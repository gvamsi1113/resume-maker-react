# backend/resumes/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ResumeViewSet, RecentApplicationsListView

# Use a router for the ResumeViewSet
# This handles list, retrieve, update, partial_update, destroy actions
# Plus our custom 'base' and 'create-base' actions via @action decorator
router = DefaultRouter()
router.register(r"resumes", ResumeViewSet, basename="resume")

urlpatterns = router.urls

# Add the path for the recent applications list view
urlpatterns.append(
    path(
        "resumes/recent-applications/",
        RecentApplicationsListView.as_view(),
        name="recent-applications-list",
    )
)
