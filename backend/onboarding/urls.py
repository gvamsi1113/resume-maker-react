# backend/onboarding/urls.py
from django.urls import path
from .views import OnboardingResumeUploadView

urlpatterns = [
    path(
        "onboard/process-resume/",
        OnboardingResumeUploadView.as_view(),
        name="onboard-process-resume",
    ),
]
