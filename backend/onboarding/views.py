# backend/onboarding/views.py
from rest_framework import views, permissions, status, parsers
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import transaction

from .serializers import ResumeUploadSerializer

# Import the new service function name
from .services import parse_and_structure_resume_file
from bio.models import Bio
from resumes.models import Resume
from bio.serializers import BioSerializer
from resumes.serializers import ResumeSerializer  # Merging serializer for response


class OnboardingResumeUploadView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]

    @transaction.atomic
    def post(self, request, *args, **kwargs):
        upload_serializer = ResumeUploadSerializer(data=request.data)
        if not upload_serializer.is_valid():
            return Response(
                upload_serializer.errors, status=status.HTTP_400_BAD_REQUEST
            )

        uploaded_file = upload_serializer.validated_data["resume_file"]
        user = request.user
        print(f"Processing uploaded resume file for user: {user.username}")

        # 1. Parse with AI (using the new function that takes the file object)
        print("Parsing resume file content with AI...")
        # Call the new service function
        structured_data = parse_and_structure_resume_file(uploaded_file)
        if structured_data is None:
            return Response(
                {"error": "Failed to parse resume content using AI."},
                status=status.HTTP_502_BAD_GATEWAY,
            )
        print("AI Parsing successful.")

        # 2. Update Bio and Create Base Resume
        try:
            bio = get_object_or_404(Bio, user=user)

            # Update Bio from parsed data
            bio.base_summary = structured_data.get("summary", bio.base_summary)
            bio.base_education_json = structured_data.get(
                "education", bio.base_education_json
            )
            bio.base_languages_json = structured_data.get(
                "languages", bio.base_languages_json
            )
            bio.base_certificates_json = structured_data.get(
                "certificates", bio.base_certificates_json
            )
            # TODO: Extract/update other Bio fields if parser supports it
            # bio.headline = structured_data.get("headline", bio.headline)
            # ... etc ...
            bio.save()
            print("Bio updated with parsed static data.")

            # Create/Replace Base Resume
            Resume.objects.filter(user=user, is_base_resume=True).delete()
            print("Existing base resume deleted (if any). Creating new base resume...")

            base_resume = Resume.objects.create(
                user=user,
                name="Base Resume (from Upload)",
                is_base_resume=True,
                # Populate directly from parsed AI data
                summary=structured_data.get("summary", ""),
                work=structured_data.get("work", []),
                projects=structured_data.get("projects", []),
                # Use list default based on latest decision for skills structure
                skills=structured_data.get("skills", []),
            )
            print("New Base Resume created.")

            # Prepare response
            bio_updated = (
                Bio.objects.select_related("user")
                .prefetch_related("social_profiles")
                .get(pk=bio.pk)
            )
            base_resume_created = (
                Resume.objects.select_related("user__bio")
                .prefetch_related("user__bio__social_profiles")
                .get(pk=base_resume.pk)
            )
            bio_serializer = BioSerializer(bio_updated)
            resume_serializer = ResumeSerializer(
                base_resume_created
            )  # Use merging serializer

            return Response(
                {
                    "message": "Resume processed successfully.",
                    "bio": bio_serializer.data,
                    "base_resume": resume_serializer.data,
                },
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            print(f"Error updating DB in onboarding: {type(e).__name__} - {e}")
            return Response(
                {"error": "Failed to save processed resume data."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
