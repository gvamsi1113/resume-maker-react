# backend/resumes/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ResumeViewSet

# Use a router for the ResumeViewSet
# This handles list, retrieve, update, partial_update, destroy actions
# Plus our custom 'base' and 'create-base' actions via @action decorator
router = DefaultRouter()
router.register(r"resumes", ResumeViewSet, basename="resume")

urlpatterns = router.urls
