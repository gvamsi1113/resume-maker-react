# backend/onboarding/views.py
from rest_framework import views, permissions, status, parsers
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.core.cache import cache
from django.conf import settings
import logging  # Import logging
from datetime import datetime

from .serializers import ResumeUploadSerializer
from .services import generate_structured_data_from_file_content
from .security import SecurityManager

# Import the new service function name
from bio.models import Bio
from resumes.models import Resume
from bio.serializers import BioSerializer
from resumes.serializers import OnboardingResumeCreateSerializer

logger = logging.getLogger(__name__)  # Get a logger


class DemoTokenView(views.APIView):
    """View to generate demo tokens for resume parsing."""

    permission_classes = []

    def post(self, request, *args, **kwargs):
        # Generate CAPTCHA first
        captcha_challenge, _ = SecurityManager.generate_captcha()

        # Generate and store token
        token = SecurityManager.generate_token()
        SecurityManager.store_token(token)

        return Response(
            {
                "token": token,
                "captcha_challenge": captcha_challenge,
                "message": "Token generated successfully. Use this token in the X-Demo-Token header for resume uploads.",
            },
            status=status.HTTP_200_OK,
        )


class OnboardingResumeUploadView(views.APIView):
    permission_classes = []
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]

    @transaction.atomic
    def post(self, request, *args, **kwargs):
        # --- 1. Security Validation ---
        # Validate the request against security measures (e.g., tokens, CAPTCHA, rate limits).
        # The SecurityManager encapsulates these checks.
        is_valid, error_message = SecurityManager.validate_request(request)
        if not is_valid:
            return Response({"error": error_message}, status=status.HTTP_403_FORBIDDEN)

        logger.info(
            f"Received request for resume upload from IP: {SecurityManager.get_client_ip(request)}"
        )

        # --- 2. File Presence Check ---
        # Ensure that a resume file was actually included in the request.
        if "resume_file" not in request.FILES:
            logger.warning("'resume_file' not found in request.FILES")
            return Response(
                {"error": "No resume file provided"}, status=status.HTTP_400_BAD_REQUEST
            )

        # --- 3. File Upload Validation (Type, Size) ---
        # Use ResumeUploadSerializer to validate the uploaded file itself (e.g., type, size).
        upload_serializer = ResumeUploadSerializer(data=request.data)
        if not upload_serializer.is_valid():
            logger.error(f"ResumeUploadSerializer errors: {upload_serializer.errors}")
            return Response(
                upload_serializer.errors, status=status.HTTP_400_BAD_REQUEST
            )

        validated_uploaded_file = upload_serializer.validated_data["resume_file"]

        # --- 4. AI Processing ---
        # Call the service to process the file content using an AI model.
        # This service returns structured JSON data extracted/enhanced from the resume.
        logger.info("Processing resume file content with AI...")
        structured_data = generate_structured_data_from_file_content(
            validated_uploaded_file
        )

        # Handle cases where AI processing might fail or return no data.
        if structured_data is None:
            logger.error("AI processing failed for the uploaded file.")
            return Response(
                {"error": "Failed to process resume content using AI."},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        logger.info("AI processing successful.")

        # --- 5. Prepare Data for Saving ---
        # Determine user association (authenticated or anonymous).
        auth_user = request.user if request.user.is_authenticated else None
        session_id = request.session.session_key or "no-session"
        user_identifier = (
            f"user:{auth_user.id}" if auth_user else f"session:{session_id}"
        )

        # Determine if this should be a 'base' resume.
        # Default to True for anonymous users or if an authenticated user doesn't have one yet.
        is_base = True
        if auth_user:
            if Resume.objects.filter(user=auth_user, is_base_resume=True).exists():
                is_base = False  # User already has a base resume, save this as non-base

        # Generate a name for the resume based on extracted first/last name, or use a default.
        resume_name = "Uploaded Resume"
        if structured_data.get("first_name") or structured_data.get("last_name"):
            resume_name = f"{structured_data.get('first_name', '').strip()} {structured_data.get('last_name', '').strip()} Resume".strip()
        if not resume_name:
            resume_name = "Uploaded Resume"

        # Combine AI-extracted data with the derived name for the serializer.
        resume_data_for_serializer = structured_data.copy()
        resume_data_for_serializer["name"] = resume_name

        # --- 6. Data Validation and Saving using Serializer ---
        # Instantiate the serializer with the prepared data.
        serializer = OnboardingResumeCreateSerializer(data=resume_data_for_serializer)

        if serializer.is_valid():
            # If data is valid, attempt to save it to create a new Resume record.
            # Pass `user` and `is_base_resume` directly to the save method as they are not part of the AI data.
            try:
                new_resume = serializer.save(user=auth_user, is_base_resume=is_base)
                logger.info(
                    f"Successfully saved new resume with ID: {new_resume.id} for {user_identifier} via serializer"
                )

                # --- 7. Success Response ---
                # Return a success message, the ID of the new resume, and the AI-processed data.
                response_data = {
                    "message": "Resume processed and saved successfully.",
                    "resume_id": new_resume.id,  # ID of the newly created resume
                    "enhanced_resume_data": structured_data,  # The AI output that was used (and validated)
                }
                return Response(response_data, status=status.HTTP_201_CREATED)
            except Exception as e:
                # Handle unexpected errors during the serializer's save operation (e.g., rare database issues).
                logger.error(
                    f"Error saving resume via serializer for {user_identifier}: {type(e).__name__} - {e}"
                )
                # Return the structured data even when database save fails
                return Response(
                    {
                        "error": "Failed to save processed resume data to the database after validation.",
                        "enhanced_resume_data": structured_data,  # Include the AI-processed data
                    },
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )
        else:
            # --- 8. Validation Error Response ---
            # If serializer validation fails, return the specific error details.
            logger.error(
                f"Validation errors for resume data from {user_identifier}: {serializer.errors}"
            )
            return Response(
                {
                    "error": "Invalid data provided for resume.",
                    "details": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
