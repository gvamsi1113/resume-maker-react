# backend/onboarding/serializers.py
from rest_framework import serializers


class ResumeUploadSerializer(serializers.Serializer):
    resume_file = serializers.FileField(required=True, allow_empty_file=False)

    def validate_resume_file(self, value):
        allowed_types = [
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain",
        ]
        max_size = 5 * 1024 * 1024  # 5 MB

        if value.content_type not in allowed_types:
            raise serializers.ValidationError(
                f"Unsupported file type. Allowed: PDF, DOCX, TXT"
            )
        if value.size > max_size:
            raise serializers.ValidationError(f"File size exceeds 5MB limit.")
        return value
