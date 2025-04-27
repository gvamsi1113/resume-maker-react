# backend/resumes/views.py
from rest_framework import viewsets, permissions, generics, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404

from .models import Resume
from .serializers import (
    ResumeSerializer,
    ResumeListSerializer,
    BaseResumeCreateSerializer,
)
from bio.models import Bio  # Import Bio for create_base action


class ResumeViewSet(viewsets.ModelViewSet):
    """
    API endpoint for listing, retrieving, updating, and deleting user Resumes.
    Creation of non-base resumes happens via /api/generate/.
    Base resume creation via custom action.
    """

    permission_classes = [permissions.IsAuthenticated]
    # Default serializer for retrieve/update/partial_update/destroy
    serializer_class = ResumeSerializer

    def get_serializer_class(self):
        # Use different serializers based on the action
        if self.action == "list":
            return ResumeListSerializer
        # For create_base action, maybe use BaseResumeCreateSerializer explicitly
        if self.action == "create_base":
            return BaseResumeCreateSerializer  # Or handle in action directly
        return ResumeSerializer  # Default for retrieve, update, partial_update

    def get_queryset(self):
        """Filter resumes for user, prefetch Bio needed by ResumeSerializer."""
        return (
            Resume.objects.select_related("user__bio")
            .prefetch_related(
                "user__bio__social_profiles"  # Prefetch through user to bio to socials
            )
            .filter(user=self.request.user)
            .order_by("-is_base_resume", "-updated_at")
        )

    # We inherit standard list, retrieve, update, partial_update, destroy
    # Ownership is ensured by get_queryset filtering by request.user

    # Custom action to get ONLY the base resume easily
    @action(detail=False, methods=["get"], url_path="base")
    def get_base_resume(self, request):
        # Use the filtered queryset
        base_resume = self.get_queryset().filter(is_base_resume=True).first()
        if not base_resume:
            return Response(
                {"detail": "Base resume not found."}, status=status.HTTP_404_NOT_FOUND
            )
        serializer = self.get_serializer(base_resume)  # Uses ResumeSerializer
        return Response(serializer.data)

    # Custom action to create the initial base resume
    @action(detail=False, methods=["post"], url_path="create-base")
    def create_base_resume(self, request):
        user = request.user
        if self.get_queryset().filter(is_base_resume=True).exists():
            return Response(
                {"error": "Base resume already exists."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            bio = user.bio
        except Bio.DoesNotExist:
            return Response(
                {"error": "User Bio not found."}, status=status.HTTP_400_BAD_REQUEST
            )

        # Create initial data structure for the base resume
        initial_data = {
            "name": "Base Resume",
            "is_base_resume": True,
            "summary": bio.base_summary or "",
            # Populate from Bio's JSON fields (assuming structure matches target)
            "work": [],  # TODO: How to populate initial work? From Bio? Manual POST?
            "projects": [],  # TODO: How to populate initial projects?
            "skills": {},  # TODO: How to populate initial skills?
        }
        # Use the dedicated create serializer
        serializer = BaseResumeCreateSerializer(data=initial_data)
        if serializer.is_valid():
            resume = serializer.save(user=user)
            # Return the full representation using the main serializer
            full_serializer = ResumeSerializer(resume, context={"request": request})
            return Response(full_serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def perform_destroy(self, instance):
        # Prevent deleting the base resume through the standard DELETE method
        if instance.is_base_resume:
            # Raise validation error which results in 400 Bad Request
            raise serializers.ValidationError("The Base Resume cannot be deleted.")
        instance.delete()
