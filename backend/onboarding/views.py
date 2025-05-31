# backend/onboarding/views.py

# Standard Library
import logging
from datetime import datetime

# Third-Party Libraries
from rest_framework import parsers, permissions, status, views
from rest_framework.response import Response

# Django
from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import Q

# from django.shortcuts import get_object_or_404 # Not used in the provided views
# from django.core.cache import cache # Not used in the provided views
# from django.conf import settings # Not used in the provided views

# Local (Project) Imports
# Assuming 'resumes' and 'bio' are apps accessible from this path
# Adjust relative import path if necessary (e.g., from project.resumes.models import Resume)
from resumes.models import Resume
from resumes.serializers import OnboardingResumeCreateSerializer

# from bio.models import Bio # Not used in the provided views
# from bio.serializers import BioSerializer # Not used in the provided views

from .security import SecurityManager
from .serializers import ResumeUploadSerializer
from .services import (
    extract_contact_details_from_text_snippet,  # Alphabetized
    extract_text_from_uploaded_file,
    generate_structured_data_from_file_content,
)

User = get_user_model()
logger = logging.getLogger(__name__)


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
        logger.info(
            f"OnboardingResumeUploadView: POST request received from IP: {SecurityManager.get_client_ip(request)}"
        )
        # --- 1. Security Validation ---
        logger.debug(
            "OnboardingResumeUploadView: Step 1 - Security Validation started."
        )
        is_valid, error_message = SecurityManager.validate_request(request)
        if not is_valid:
            logger.warning(
                f"OnboardingResumeUploadView: Security validation failed - {error_message}"
            )
            return Response({"error": error_message}, status=status.HTTP_403_FORBIDDEN)
        logger.info(
            f"OnboardingResumeUploadView: Step 1 - Security validation passed for IP: {SecurityManager.get_client_ip(request)}"
        )

        # --- 2. File Presence Check ---
        logger.debug(
            "OnboardingResumeUploadView: Step 2 - File Presence Check started."
        )
        if "resume_file" not in request.FILES:
            logger.warning(
                "OnboardingResumeUploadView: Step 2 - 'resume_file' not found in request.FILES"
            )
            return Response(
                {"error": "No resume file provided"}, status=status.HTTP_400_BAD_REQUEST
            )
        logger.info(
            "OnboardingResumeUploadView: Step 2 - 'resume_file' found in request.FILES."
        )

        # --- 3. File Upload Validation ---
        logger.debug(
            "OnboardingResumeUploadView: Step 3 - File Upload Validation started."
        )
        upload_serializer = ResumeUploadSerializer(data=request.data)
        if not upload_serializer.is_valid():
            logger.error(
                f"OnboardingResumeUploadView: Step 3 - ResumeUploadSerializer errors: {upload_serializer.errors}"
            )
            return Response(
                upload_serializer.errors, status=status.HTTP_400_BAD_REQUEST
            )
        validated_uploaded_file = upload_serializer.validated_data["resume_file"]
        logger.info(
            f"OnboardingResumeUploadView: Step 3 - File {validated_uploaded_file.name} passed upload validation."
        )

        # --- 4. Preliminary Checks: Text Extraction, Contact Extraction, Duplicate Checks ---
        logger.debug("OnboardingResumeUploadView: Step 4 - Preliminary Checks started.")
        extracted_text = None
        contact_details = None

        # 4.1 Attempt Text Extraction
        logger.debug(
            "OnboardingResumeUploadView: Step 4.1 - Attempting Text Extraction."
        )
        try:
            logger.info(
                f"OnboardingResumeUploadView: Attempting text extraction from {validated_uploaded_file.name} for preliminary checks..."
            )
            extracted_text = extract_text_from_uploaded_file(validated_uploaded_file)
            if not extracted_text or not extracted_text.strip():
                logger.warning(
                    "OnboardingResumeUploadView: Step 4.1 - Text extraction for preliminary checks failed or yielded empty text. Skipping further preliminary checks."
                )
                extracted_text = None  # Ensure it's None if extraction failed
            else:
                logger.info(
                    f"OnboardingResumeUploadView: Step 4.1 - Successfully extracted text for preliminary checks ({len(extracted_text)} chars)."
                )
        except Exception as e_text_extract:
            logger.error(
                f"OnboardingResumeUploadView: Step 4.1 - Error during text extraction: {type(e_text_extract).__name__} - {e_text_extract}. Skipping preliminary checks."
            )
            extracted_text = None  # Ensure it's None on error

        # 4.2 Attempt Contact Detail Extraction (if text was extracted)
        logger.debug(
            "OnboardingResumeUploadView: Step 4.2 - Attempting Contact Detail Extraction."
        )
        if extracted_text:
            try:
                logger.info(
                    "OnboardingResumeUploadView: Attempting contact info extraction from text snippet..."
                )
                text_snippet_100 = extracted_text[:100]
                contact_details = extract_contact_details_from_text_snippet(
                    text_snippet_100
                )
                if not contact_details:
                    logger.warning(
                        "OnboardingResumeUploadView: Step 4.2 - Contact detail extraction from snippet failed or yielded no details. Skipping DB checks."
                    )
                    logger.debug(
                        f"OnboardingResumeUploadView: Step 4.2 - contact_details value after failed extraction: {contact_details}"
                    )
                else:
                    logger.info(
                        f"OnboardingResumeUploadView: Step 4.2 - Successfully extracted contact details: {contact_details}"
                    )
            except Exception as e_contact_extract:
                logger.error(
                    f"OnboardingResumeUploadView: Step 4.2 - Error during contact detail extraction: {type(e_contact_extract).__name__} - {e_contact_extract}. Skipping DB checks."
                )
                contact_details = None
        else:
            logger.info(
                "OnboardingResumeUploadView: Step 4.2 - Skipped contact detail extraction as no text was extracted in Step 4.1."
            )

        # 4.3 Perform Database Duplicate Checks (if contact details were extracted)
        logger.debug(
            "OnboardingResumeUploadView: Step 4.3 - Performing Database Duplicate Checks."
        )
        if contact_details:
            email_from_snippet = contact_details.get("email")
            phone_from_snippet = contact_details.get("phone")
            logger.info(
                f"OnboardingResumeUploadView: Step 4.3 - Contact details available for DB checks. Email: '{email_from_snippet}', Phone: '{phone_from_snippet}'"
            )

            # Case 1: Check for existing User by email
            if (
                email_from_snippet
                and isinstance(email_from_snippet, str)
                and email_from_snippet.strip()
            ):
                logger.debug(
                    "OnboardingResumeUploadView: Step 4.3.1 - Checking for existing User by email."
                )
                try:
                    existing_user = User.objects.filter(
                        email__iexact=email_from_snippet.strip()
                    ).first()
                    if existing_user:
                        logger.info(
                            f"OnboardingResumeUploadView: Step 4.3.1 - Existing user (ID: {existing_user.id}) found matching email: {email_from_snippet.strip()}"
                        )
                        return Response(
                            {
                                "message": "A user account matching the provided email already exists. Please log in to upload or manage your resumes.",
                                "resume_id": None,
                                "enhanced_resume_data": None,
                                "is_duplicate_user": True,
                            },
                            status=status.HTTP_200_OK,
                        )
                    else:
                        logger.info(
                            f"OnboardingResumeUploadView: Step 4.3.1 - No existing user found for email: {email_from_snippet.strip()}."
                        )
                except Exception as e_user_check:
                    logger.error(
                        f"OnboardingResumeUploadView: Step 4.3.1 - Error during user duplicate check: {type(e_user_check).__name__} - {e_user_check}"
                    )
            else:
                logger.info(
                    "OnboardingResumeUploadView: Step 4.3.1 - Skipped user duplicate check as no email was available/valid from snippet."
                )

            # Case 2: If no existing User was found, check for existing Resume by email or phone
            logger.debug(
                "OnboardingResumeUploadView: Step 4.3.2 - Checking for existing Resume by email or phone."
            )
            resume_query = Q()
            if (
                email_from_snippet
                and isinstance(email_from_snippet, str)
                and email_from_snippet.strip()
            ):
                resume_query |= Q(email__iexact=email_from_snippet.strip())
            if (
                phone_from_snippet
                and isinstance(phone_from_snippet, str)
                and phone_from_snippet.strip()
            ):
                resume_query |= Q(phone__iexact=phone_from_snippet.strip())

            logger.debug(
                f"OnboardingResumeUploadView: Step 4.3.2 - Constructed resume_query: {resume_query}"
            )

            if resume_query:
                existing_resume = (
                    Resume.objects.filter(resume_query).order_by("-created_at").first()
                )
                if existing_resume:
                    logger.info(
                        f"OnboardingResumeUploadView: Step 4.3.2 - Existing resume (ID: {existing_resume.id}) found matching contact details. Details: {existing_resume}"
                    )
                    serialized_existing_resume = OnboardingResumeCreateSerializer(
                        existing_resume
                    ).data
                    logger.info(
                        f"OnboardingResumeUploadView: Step 4.3.2 - Serialized existing resume data for response. Preview: {str(serialized_existing_resume)[:200]}"
                    )
                    return Response(
                        {
                            "message": "An existing resume matching the provided contact details was found.",
                            "resume_id": existing_resume.id,
                            "enhanced_resume_data": serialized_existing_resume,
                            "is_duplicate": True,
                        },
                        status=status.HTTP_200_OK,
                    )
                else:
                    logger.info(
                        "OnboardingResumeUploadView: Step 4.3.2 - No existing resume found matching contact details."
                    )
            else:
                logger.info(
                    "OnboardingResumeUploadView: Step 4.3.2 - Resume query is empty (no valid email/phone from snippet), skipping resume duplicate check."
                )

            # Case 3: No User and No Resume found (Proceed to main processing)
            logger.info(
                "OnboardingResumeUploadView: Step 4.3.3 - No existing user or resume found based on extracted contact details. Proceeding to main AI processing."
            )

        else:  # No contact_details extracted
            logger.info(
                "OnboardingResumeUploadView: Step 4.3 - Skipped DB duplicate checks as contact details were not extracted. Proceeding to main AI processing."
            )
            # If extracted_text itself was None, it was already logged. Note: The original code had an 'if extracted_text:' here,
            # but it's redundant if we are just proceeding. The main processing step will handle if extracted_text is None.

        # --- 5. Main AI Processing ---
        logger.debug("OnboardingResumeUploadView: Step 5 - Main AI Processing started.")
        logger.info(
            f"OnboardingResumeUploadView: Preparing for main AI processing for file: {validated_uploaded_file.name}"
        )

        input_for_main_ai = None
        if extracted_text:
            logger.info(
                "OnboardingResumeUploadView: Step 5 - Using extracted text for main AI processing."
            )
            input_for_main_ai = extracted_text
        else:
            logger.info(
                "OnboardingResumeUploadView: Step 5 - Using uploaded file for main AI processing (text extraction failed or was skipped during preliminary checks)."
            )
            input_for_main_ai = validated_uploaded_file

        logger.info(
            "OnboardingResumeUploadView: Step 5 - Calling generate_structured_data_from_file_content."
        )
        structured_data = generate_structured_data_from_file_content(input_for_main_ai)

        if structured_data is None:
            logger.error(
                "OnboardingResumeUploadView: Step 5 - AI processing failed (generate_structured_data_from_file_content returned None)."
            )
            return Response(
                {"error": "Failed to process resume content using AI."},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        logger.info("OnboardingResumeUploadView: Step 5 - AI processing successful.")
        logger.info(
            f"OnboardingResumeUploadView: Step 5 - Structured data from AI (first 500 chars): {str(structured_data)[:500]}"
        )

        # --- 6. Prepare Data for Saving ---
        logger.debug(
            "OnboardingResumeUploadView: Step 6 - Prepare Data for Saving started."
        )
        auth_user = request.user if request.user.is_authenticated else None
        session_id = request.session.session_key or "no-session"
        user_identifier = (
            f"user:{auth_user.id}" if auth_user else f"session:{session_id}"
        )
        logger.info(
            f"OnboardingResumeUploadView: Step 6 - User identifier for saving: {user_identifier}"
        )

        is_base = True
        if auth_user:
            logger.debug(
                "OnboardingResumeUploadView: Step 6 - Authenticated user found, checking for existing base resume."
            )
            if Resume.objects.filter(user=auth_user, is_base_resume=True).exists():
                is_base = False
                logger.info(
                    "OnboardingResumeUploadView: Step 6 - Existing base resume found for user. New resume will not be base."
                )
            else:
                logger.info(
                    "OnboardingResumeUploadView: Step 6 - No existing base resume for user. New resume will be base."
                )
        else:
            logger.info(
                "OnboardingResumeUploadView: Step 6 - Anonymous user. New resume will be base."
            )

        resume_name = "Uploaded Resume"
        if structured_data.get("first_name") or structured_data.get("last_name"):
            resume_name = f"{structured_data.get('first_name', '').strip()} {structured_data.get('last_name', '').strip()} Resume".strip()
        if not resume_name:  # Ensure resume_name is not empty if names are blank
            resume_name = "Uploaded Resume"
        logger.info(
            f"OnboardingResumeUploadView: Step 6 - Generated resume name: {resume_name}"
        )

        resume_data_for_serializer = structured_data.copy()
        resume_data_for_serializer["name"] = resume_name
        logger.info(
            f"OnboardingResumeUploadView: Step 6 - Data prepared for serializer (first 500 chars): {str(resume_data_for_serializer)[:500]}"
        )

        # --- 7. Data Validation and Saving using Serializer ---
        logger.debug(
            "OnboardingResumeUploadView: Step 7 - Data Validation and Saving using Serializer started."
        )
        serializer = OnboardingResumeCreateSerializer(data=resume_data_for_serializer)

        if serializer.is_valid():
            logger.info(
                "OnboardingResumeUploadView: Step 7 - Serializer validation successful."
            )
            try:
                logger.info(
                    "OnboardingResumeUploadView: Step 7 - Attempting to save resume with serializer."
                )
                new_resume = serializer.save(user=auth_user, is_base_resume=is_base)
                logger.info(
                    f"OnboardingResumeUploadView: Step 7 - Successfully saved new resume with ID: {new_resume.id} for {user_identifier} via serializer"
                )

                # --- 8. Success Response ---
                logger.debug(
                    "OnboardingResumeUploadView: Step 8 - Preparing success response."
                )
                response_data = {
                    "message": "Resume processed and saved successfully.",
                    "resume_id": new_resume.id,
                    "enhanced_resume_data": structured_data,
                }
                logger.info(
                    f"OnboardingResumeUploadView: Step 8 - Sending success response: {response_data}"
                )
                return Response(response_data, status=status.HTTP_201_CREATED)
            except Exception as e:
                logger.error(
                    f"OnboardingResumeUploadView: Step 7 - Error saving resume via serializer for {user_identifier}: {type(e).__name__} - {e}"
                )
                return Response(
                    {
                        "error": "Failed to save processed resume data to the database after validation.",
                        "enhanced_resume_data": structured_data,
                    },
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )
        else:
            # --- 9. Validation Error Response ---
            logger.error(
                f"OnboardingResumeUploadView: Step 7 - Serializer validation errors for {user_identifier}: {serializer.errors}"
            )
            return Response(
                {
                    "error": "Invalid data provided for resume.",
                    "details": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )


class AuthenticatedResumeUploadView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]  # Require authentication
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]

    @transaction.atomic
    def post(self, request, *args, **kwargs):
        user = request.user  # User is guaranteed to be authenticated
        logger.info(
            f"AuthenticatedResumeUploadView: POST request received from authenticated user: {user.email} (ID: {user.id})"
        )

        # --- 1. File Presence Check (Skipping SecurityManager validation) ---
        logger.debug(
            "AuthenticatedResumeUploadView: Step 1 - File Presence Check started."
        )
        if "resume_file" not in request.FILES:
            logger.warning(
                "AuthenticatedResumeUploadView: Step 1 - 'resume_file' not found in request.FILES"
            )
            return Response(
                {"error": "No resume file provided"}, status=status.HTTP_400_BAD_REQUEST
            )
        logger.info(
            "AuthenticatedResumeUploadView: Step 1 - 'resume_file' found in request.FILES."
        )

        # --- 2. File Upload Validation ---
        logger.debug(
            "AuthenticatedResumeUploadView: Step 2 - File Upload Validation started."
        )
        upload_serializer = ResumeUploadSerializer(data=request.data)
        if not upload_serializer.is_valid():
            logger.error(
                f"AuthenticatedResumeUploadView: Step 2 - ResumeUploadSerializer errors for user {user.id}: {upload_serializer.errors}"
            )
            return Response(
                upload_serializer.errors, status=status.HTTP_400_BAD_REQUEST
            )
        validated_uploaded_file = upload_serializer.validated_data["resume_file"]
        logger.info(
            f"AuthenticatedResumeUploadView: Step 2 - File {validated_uploaded_file.name} passed upload validation for user {user.id}."
        )

        # --- 3. Preliminary Checks: Text Extraction, Contact Extraction, Duplicate Checks (Simplified for authenticated users) ---
        logger.debug(
            "AuthenticatedResumeUploadView: Step 3 - Preliminary Checks started."
        )
        extracted_text = None

        # 3.1 Attempt Text Extraction
        logger.debug(
            "AuthenticatedResumeUploadView: Step 3.1 - Attempting Text Extraction."
        )
        try:
            logger.info(
                f"AuthenticatedResumeUploadView: Attempting text extraction from {validated_uploaded_file.name} for user {user.id}..."
            )
            extracted_text = extract_text_from_uploaded_file(validated_uploaded_file)
            if not extracted_text or not extracted_text.strip():
                logger.warning(
                    f"AuthenticatedResumeUploadView: Step 3.1 - Text extraction failed or yielded empty text for user {user.id}. Proceeding with file."
                )
                extracted_text = None
            else:
                logger.info(
                    f"AuthenticatedResumeUploadView: Step 3.1 - Successfully extracted text ({len(extracted_text)} chars) for user {user.id}."
                )
        except Exception as e_text_extract:
            logger.error(
                f"AuthenticatedResumeUploadView: Step 3.1 - Error during text extraction for user {user.id}: {type(e_text_extract).__name__} - {e_text_extract}. Proceeding with file."
            )
            extracted_text = None

        # 3.2 Duplicate check: Optional: Check if this user already uploaded a resume with the exact same filename (content check is harder)
        # This is a simple check. More sophisticated checks (e.g. content hash) could be added.
        # For now, we primarily rely on the AI processing and then the user can manage/delete.
        # We can check if a resume with the same name *for this user* exists.
        # However, the main purpose here is to process and make it available.
        # The user can decide later if it's a duplicate they want to remove.
        # The `is_duplicate` flag from the original view was more about *unauthenticated* users potentially re-uploading.
        # For authenticated users, they are knowingly adding to their account.
        logger.info(
            f"AuthenticatedResumeUploadView: Step 3.2 - Skipping extensive duplicate checks for authenticated user {user.id}. AI processing will proceed."
        )

        # --- 4. Main AI Processing ---
        logger.debug(
            f"AuthenticatedResumeUploadView: Step 4 - Main AI Processing started for user {user.id}."
        )
        logger.info(
            f"AuthenticatedResumeUploadView: Preparing for main AI processing for file: {validated_uploaded_file.name} for user {user.id}"
        )

        input_for_main_ai = (
            extracted_text if extracted_text else validated_uploaded_file
        )
        if extracted_text:
            logger.info(
                f"AuthenticatedResumeUploadView: Step 4 - Using extracted text for main AI processing for user {user.id}."
            )
        else:
            logger.info(
                f"AuthenticatedResumeUploadView: Step 4 - Using uploaded file for main AI processing for user {user.id} (text extraction failed or was skipped)."
            )

        logger.info(
            f"AuthenticatedResumeUploadView: Step 4 - Calling generate_structured_data_from_file_content for user {user.id}."
        )
        structured_data = generate_structured_data_from_file_content(input_for_main_ai)

        if structured_data is None:
            logger.error(
                f"AuthenticatedResumeUploadView: Step 4 - AI processing failed for user {user.id} (generate_structured_data_from_file_content returned None)."
            )
            return Response(
                {"error": "Failed to process resume content using AI."},
                status=status.HTTP_502_BAD_GATEWAY,  # 502 Bad Gateway if AI service fails
            )

        logger.info(
            f"AuthenticatedResumeUploadView: Step 4 - AI processing successful for user {user.id}."
        )
        logger.debug(  # Log more detailed data for debug if needed
            f"AuthenticatedResumeUploadView: Step 4 - Structured data from AI for user {user.id} (first 500 chars): {str(structured_data)[:500]}"
        )

        # --- 5. Prepare Data for Saving ---
        logger.debug(
            f"AuthenticatedResumeUploadView: Step 5 - Prepare Data for Saving started for user {user.id}."
        )

        # User is request.user (guaranteed by IsAuthenticated)
        user_identifier = f"user:{user.id}"
        logger.info(
            f"AuthenticatedResumeUploadView: Step 5 - User identifier for saving: {user_identifier}"
        )

        # Logic to make the new resume the base, and unmark any old base resume.
        # This is done atomically thanks to @transaction.atomic on the post method.
        try:
            # Set all other resumes for this user to is_base_resume=False
            Resume.objects.filter(user=user, is_base_resume=True).update(
                is_base_resume=False
            )
            logger.info(
                f"AuthenticatedResumeUploadView: Step 5 - Unmarked existing base resume(s) for user {user.id}."
            )
        except Exception as e_update_base:
            # Log this error but proceed with attempting to save the new resume as base.
            # The unique constraint on the model might still prevent issues if an old base wasn't updated,
            # but this indicates a potential problem.
            logger.error(
                f"AuthenticatedResumeUploadView: Step 5 - Error unmarking existing base resume(s) for user {user.id}: {e_update_base}. Will attempt to save new resume as base."
            )

        is_base = True  # New resume will always be the base.
        logger.info(
            f"AuthenticatedResumeUploadView: Step 5 - New resume will be set as the base for user {user.id}."
        )

        resume_name = "Uploaded Resume"
        # Generate name from AI data if available
        ai_first_name = structured_data.get("first_name", "").strip()
        ai_last_name = structured_data.get("last_name", "").strip()
        if ai_first_name or ai_last_name:
            resume_name = f"{ai_first_name} {ai_last_name} Resume".strip()

        # Fallback if name is still empty (e.g. AI didn't provide names)
        if not resume_name:
            resume_name = f"Resume uploaded on {datetime.now().strftime('%Y-%m-%d')}"

        logger.info(
            f"AuthenticatedResumeUploadView: Step 5 - Generated resume name: '{resume_name}' for user {user.id}"
        )

        resume_data_for_serializer = structured_data.copy()
        resume_data_for_serializer["name"] = resume_name
        # Add email and phone from structured_data if available, to be saved in Resume model
        if "email" in structured_data:  # This is email from resume content
            resume_data_for_serializer["email"] = structured_data["email"]
        if "phone" in structured_data:  # This is phone from resume content
            resume_data_for_serializer["phone"] = structured_data["phone"]

        logger.debug(  # Log more detailed data for debug if needed
            f"AuthenticatedResumeUploadView: Step 5 - Data prepared for serializer for user {user.id} (first 500 chars): {str(resume_data_for_serializer)[:500]}"
        )

        # --- 6. Data Validation and Saving using Serializer ---
        logger.debug(
            f"AuthenticatedResumeUploadView: Step 6 - Data Validation and Saving using Serializer started for user {user.id}."
        )
        serializer = OnboardingResumeCreateSerializer(data=resume_data_for_serializer)

        if serializer.is_valid():
            logger.info(
                f"AuthenticatedResumeUploadView: Step 6 - Serializer validation successful for user {user.id}."
            )
            try:
                logger.info(
                    f"AuthenticatedResumeUploadView: Step 6 - Attempting to save resume with serializer for user {user.id}."
                )
                # Save the resume, associating it with the authenticated user
                new_resume = serializer.save(user=user, is_base_resume=is_base)
                logger.info(
                    f"AuthenticatedResumeUploadView: Step 6 - Successfully saved new resume with ID: {new_resume.id} for {user_identifier} via serializer"
                )

                # --- 7. Success Response ---
                logger.debug(
                    f"AuthenticatedResumeUploadView: Step 7 - Preparing success response for user {user.id}."
                )
                # Use the same serializer to ensure consistent output format
                response_serializer = OnboardingResumeCreateSerializer(new_resume)
                response_data = {
                    "message": "Resume processed and saved successfully.",
                    "resume_id": new_resume.id,
                    "enhanced_resume_data": response_serializer.data,  # Use serialized data
                }
                logger.info(
                    f"AuthenticatedResumeUploadView: Step 7 - Sending success response for user {user.id}: {response_data}"
                )
                return Response(response_data, status=status.HTTP_201_CREATED)
            except Exception as e:
                logger.error(
                    f"AuthenticatedResumeUploadView: Step 6 - Error saving resume via serializer for {user_identifier}: {type(e).__name__} - {e}"
                )
                error_detail = str(e)
                return Response(
                    {
                        "error": "Failed to save processed resume data to the database after validation.",
                        "detail": error_detail,
                        "enhanced_resume_data": structured_data,
                    },
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )
        else:
            logger.error(
                f"AuthenticatedResumeUploadView: Step 6 - Serializer validation failed for user {user.id}: {serializer.errors}"
            )
            return Response(
                {
                    "error": "Validation failed for the processed resume data.",
                    "errors": serializer.errors,
                    "enhanced_resume_data": structured_data,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )


# --- END OF AuthenticatedResumeUploadView ---
