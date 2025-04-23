# backend/bio/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BioRetrieveUpdateView, SocialProfileViewSet

router = DefaultRouter()
router.register(r"social-profiles", SocialProfileViewSet, basename="socialprofile")

urlpatterns = [
    path("bio/", BioRetrieveUpdateView.as_view(), name="user-bio"),
    path("", include(router.urls)),
]
