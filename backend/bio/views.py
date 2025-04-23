# backend/bio/views.py
from rest_framework import viewsets, permissions, generics
from django.shortcuts import get_object_or_404
from .models import Bio, SocialProfile
from .serializers import (
    BioSerializer,
    BioUpdateSerializer,
    SocialProfileSerializer,
)


class BioRetrieveUpdateView(generics.RetrieveUpdateAPIView):
    """API endpoint for retrieving or updating the logged-in user's Bio."""

    # Optimize query by selecting related user and prefetching social profiles
    queryset = (
        Bio.objects.select_related("user").prefetch_related("social_profiles").all()
    )
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return get_object_or_404(self.get_queryset(), user=self.request.user)

    def get_serializer_class(self):
        if self.request.method in ["PUT", "PATCH"]:
            return BioUpdateSerializer
        return BioSerializer


class SocialProfileViewSet(viewsets.ModelViewSet):
    """API endpoint for CRUD operations on the user's Social Profiles."""

    serializer_class = SocialProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user_bio = get_object_or_404(Bio, user=self.request.user)
        return SocialProfile.objects.filter(bio=user_bio)

    def perform_create(self, serializer):
        user_bio = get_object_or_404(Bio, user=self.request.user)
        serializer.save(bio=user_bio)
