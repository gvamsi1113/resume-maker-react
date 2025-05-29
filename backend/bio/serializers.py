# backend/bio/serializers.py
from rest_framework import serializers
from .models import Bio, SocialProfile


class SocialProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = SocialProfile
        exclude = ("bio",)
        read_only_fields = ("id", "created_at", "updated_at")


class BioSerializer(serializers.ModelSerializer):
    social_profiles = SocialProfileSerializer(many=True, read_only=True)

    class Meta:
        model = Bio
        fields = [
            "id",
            "user",
            "first_name",
            "last_name",
            "date_of_birth",
            "country_of_origin",
            "email",
            "phone",
            "current_city",
            "current_state",
            "current_country",
            "headline",
            "target_roles",
            "target_industries",
            "can_join_immediately",
            "willing_to_relocate",
            "base_summary",
            "base_education_json",
            "base_languages_json",
            "base_certificates_json",
            "created_at",
            "updated_at",
            "social_profiles",
        ]
        read_only_fields = (
            "id",
            "user",
            "created_at",
            "updated_at",
            "social_profiles",
        )


class BioUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bio
        fields = [
            "first_name",
            "last_name",
            "date_of_birth",
            "country_of_origin",
            "email",
            "phone",
            "current_city",
            "current_state",
            "current_country",
            "headline",
            "target_roles",
            "target_industries",
            "can_join_immediately",
            "willing_to_relocate",
            "base_summary",
            "base_education_json",
            "base_languages_json",
            "base_certificates_json",
        ]
