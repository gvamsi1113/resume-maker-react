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
from .services import parse_and_structure_resume_file
from .security import SecurityManager

# Import the new service function name
from bio.models import Bio
from resumes.models import Resume
from bio.serializers import BioSerializer
from resumes.serializers import ResumeSerializer  # Merging serializer for response

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
        # Validate security measures
        is_valid, error_message = SecurityManager.validate_request(request)
        if not is_valid:
            return Response({"error": error_message}, status=status.HTTP_403_FORBIDDEN)

        logger.info(
            f"Received request for resume upload from IP: {SecurityManager.get_client_ip(request)}"
        )

        if "resume_file" not in request.FILES:
            logger.warning("'resume_file' not found in request.FILES")
            return Response(
                {"error": "No resume file provided"}, status=status.HTTP_400_BAD_REQUEST
            )

        upload_serializer = ResumeUploadSerializer(data=request.data)
        if not upload_serializer.is_valid():
            logger.error(f"ResumeUploadSerializer errors: {upload_serializer.errors}")
            return Response(
                upload_serializer.errors, status=status.HTTP_400_BAD_REQUEST
            )

        validated_uploaded_file = upload_serializer.validated_data["resume_file"]

        # Parse with AI
        logger.info("Parsing resume file content with AI...")
        structured_data = parse_and_structure_resume_file(validated_uploaded_file)

        if structured_data is None:
            logger.error("AI Parsing failed for the uploaded file.")
            return Response(
                {"error": "Failed to parse resume content using AI."},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        logger.info("AI Parsing successful.")

        # Return only the parsed data without saving to database
        return Response(
            {
                "message": "Resume processed successfully.",
                "parsed_data": {
                    "raw_data": structured_data.get("raw_data", {}),
                    "personalized": structured_data.get("personalized", {}),
                },
            },
            status=status.HTTP_200_OK,
        )
