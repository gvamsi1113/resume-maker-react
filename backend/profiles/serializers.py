from rest_framework import serializers
from .models import Profile, Experience, Education, Skill


# Serializer for the Skill model
class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        # Include all fields except the 'profile' foreign key initially
        # The profile will be linked automatically based on the request user
        exclude = ("profile",)  # Or list fields: ('id', 'name', 'category')


# Serializer for the Education model
class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        exclude = ("profile",)  # Or fields: ('id', 'institution_name', ...)


# Serializer for the Experience model
class ExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experience
        exclude = ("profile",)  # Or fields: ('id', 'job_title', ...)


# Serializer for the main Profile model
# This serializer will include nested serializers for related objects
class ProfileSerializer(serializers.ModelSerializer):
    # Make user data read-only in the profile response
    username = serializers.CharField(source="user.username", read_only=True)
    # Nested serializers for related models.
    # 'many=True' because one profile has many experiences, etc.
    # 'read_only=True' initially means we won't support creating/updating
    # experiences directly nested within the profile PUT/POST, but they
    # will be shown in GET requests. We'll handle creating/updating
    # related items via separate dedicated endpoints later.
    experiences = ExperienceSerializer(many=True, read_only=True)
    education = EducationSerializer(many=True, read_only=True)
    skills = SkillSerializer(many=True, read_only=True)

    class Meta:
        model = Profile
        # List all fields from the Profile model + the nested related fields
        fields = [
            "id",  # Include primary key
            "user",  # Include the user foreign key ID (useful sometimes)
            "username",  # Include the read-only username
            "full_name",
            "email",
            "phone",
            "location",
            "linkedin_url",
            "portfolio_url",
            "website_url",
            "summary",
            "created_at",
            "updated_at",
            # Related data fields:
            "experiences",
            "education",
            "skills",
        ]
        # Mark the 'user' field as read-only after creation.
        # We link it implicitly.
        read_only_fields = ("user", "created_at", "updated_at")

    # Optional: If we wanted to allow creating profile via this serializer
    # (less common, usually profile is created via signal when user registers),
    # we might override create. For now, we focus on Retrieve/Update.


# --- Separate Serializer for *Updating* Profile (without nested relations) ---
# It's often cleaner to have a separate serializer for updates if you don't
# want to handle complex nested writes through the main profile endpoint.
class ProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        # Only include fields that the user should be able to directly update
        # via the profile endpoint
        fields = [
            "full_name",
            "email",
            "phone",
            "location",
            "linkedin_url",
            "portfolio_url",
            "website_url",
            "summary",
        ]
        # Note: We don't include 'user' here as it shouldn't be changed.
        # We will handle Experience, Education, Skill updates via their own
        # endpoints.
