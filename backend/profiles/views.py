# backend/profiles/views.py
from rest_framework import viewsets, permissions, generics

from .models import Profile, Experience, Education, Skill
from .serializers import (
    ProfileSerializer,
    ProfileUpdateSerializer,  # Use this for updating profile details
    ExperienceSerializer,
    EducationSerializer,
    SkillSerializer,
)


# --- ViewSet for the main user Profile ---
# We use RetrieveUpdateAPIView as a user generally has only one profile
# associated with them, and we typically retrieve or update it.
# Creation often happens automatically when a User registers
# (via signals - implement later) or via a dedicated endpoint if needed.
class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    API endpoint that allows users to view or edit their own profile.
    """

    queryset = Profile.objects.all()
    # Use different serializers for retrieving (GET) vs updating (PUT/PATCH)
    serializer_class = ProfileSerializer  # Default for GET
    permission_classes = [permissions.IsAuthenticated]  # MUST be logged in

    def get_object(self):
        # Override to ensure users can only get their OWN profile
        # request.user is the authenticated user instance from the token
        profile, created = Profile.objects.get_or_create(
            user=self.request.user
        )
        # Note: get_or_create handles the case where a profile might not exist
        # yet for a registered user.
        # You might want more robust profile creation
        # logic elsewhere (e.g., using Django Signals when a User is created).
        return profile

    def get_serializer_class(self):
        # Use the simpler Update serializer for PUT/PATCH requests
        if self.request.method in ["PUT", "PATCH"]:
            return ProfileUpdateSerializer
        return self.serializer_class  # Use ProfileSerializer for GET


# --- ViewSets for related items (Experience, Education, Skill) ---
# ModelViewSet provides default CRUD operations
# (List, Create, Retrieve, Update, Destroy)


class BaseOwnerViewSet(viewsets.ModelViewSet):
    """
    Base ViewSet that filters querysets and sets profile on save
    to ensure users only interact with their own objects.
    """

    permission_classes = [permissions.IsAuthenticated]  # Must be logged in

    def get_queryset(self):
        """Ensure users only see their own objects."""
        # Get the user's profile (or create if it doesn't exist - adjust
        # as needed)
        user_profile, _ = Profile.objects.get_or_create(user=self.request.user)
        # Filter the specific model's queryset by the user's profile
        # self.queryset is defined in the inheriting class
        return self.queryset.filter(profile=user_profile)

    def perform_create(self, serializer):
        """Ensure new objects are automatically linked to user's profile."""
        user_profile, _ = Profile.objects.get_or_create(user=self.request.user)
        # Save the object, associating it with the correct profile
        serializer.save(profile=user_profile)


# Inherit from BaseOwnerViewSet to get automatic
# filtering and profile assignment
class ExperienceViewSet(BaseOwnerViewSet):
    queryset = (
        Experience.objects.all()
    )  # Base queryset (will be filtered in get_queryset)
    serializer_class = ExperienceSerializer


class EducationViewSet(BaseOwnerViewSet):
    queryset = Education.objects.all()
    serializer_class = EducationSerializer


class SkillViewSet(BaseOwnerViewSet):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
