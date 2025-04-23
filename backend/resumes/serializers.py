# backend/resumes/serializers.py
from rest_framework import serializers
from .models import Resume
from bio.serializers import SocialProfileSerializer  # Import for merging
from bio.models import Bio  # Needed to fetch Bio data


class ResumeListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resume
        fields = ["id", "name", "is_base_resume", "source_company_name", "updated_at"]
        read_only_fields = fields


class ResumeSerializer(serializers.ModelSerializer):
    basics = serializers.SerializerMethodField(read_only=True)
    education = serializers.SerializerMethodField(read_only=True)
    languages = serializers.SerializerMethodField(read_only=True)
    certificates = serializers.SerializerMethodField(read_only=True)
    # social_profiles field removed as it's nested inside basics

    class Meta:
        model = Resume
        fields = [
            "id",
            "name",
            "is_base_resume",
            "source_job_description",
            "source_job_url",
            "source_company_name",
            "summary",
            "work",
            "projects",
            "skills",  # From Resume model
            "basics",
            "education",
            "languages",
            "certificates",  # Constructed from Bio
            "created_at",
            "updated_at",
        ]
        read_only_fields = (
            "id",
            "is_base_resume",
            "source_job_description",
            "source_job_url",
            "source_company_name",
            "created_at",
            "updated_at",
            "basics",
            "education",
            "languages",
            "certificates",
        )

    def get_bio_object(self, obj):
        # Access prefetch/select_related data from viewset queryset if possible
        if hasattr(obj.user, "bio"):
            return obj.user.bio
        # Fallback to DB query if not prefetched (less efficient)
        try:
            return (
                Bio.objects.select_related("user")
                .prefetch_related("social_profiles")
                .get(user=obj.user)
            )
        except Bio.DoesNotExist:
            print(
                f"Warning: Bio not found for user {obj.user.username} during resume serialization."
            )
            return None

    def get_basics(self, obj):
        bio = self.get_bio_object(obj)
        if not bio:
            return {}
        social_profiles_data = SocialProfileSerializer(
            bio.social_profiles.all(), many=True
        ).data
        return {
            "name": bio.full_name,
            "label": bio.headline or "",
            "email": bio.email or bio.user.email,
            "phone": bio.phone or "",
            "url": "",  # Add website field to Bio model?
            "location": {
                "city": bio.current_city or "",
                "region": bio.current_state or "",
                "countryCode": bio.current_country or "",
            },
            "profiles": social_profiles_data,
        }

    def get_education(self, obj):
        bio = self.get_bio_object(obj)
        return bio.base_education_json if bio else []

    def get_languages(self, obj):
        bio = self.get_bio_object(obj)
        return bio.base_languages_json if bio else []

    def get_certificates(self, obj):
        bio = self.get_bio_object(obj)
        return bio.base_certificates_json if bio else []

    def update(self, instance, validated_data):
        instance.name = validated_data.get("name", instance.name)
        instance.summary = validated_data.get("summary", instance.summary)
        instance.work = validated_data.get("work", instance.work)
        instance.projects = validated_data.get("projects", instance.projects)
        instance.skills = validated_data.get("skills", instance.skills)
        instance.save()
        return instance


class BaseResumeCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resume
        fields = [  # Fields needed to create a base resume record
            "name",
            "is_base_resume",  # Must be set True by view
            "summary",
            "work",
            "projects",
            "skills",
        ]
