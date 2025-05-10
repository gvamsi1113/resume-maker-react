# backend/onboarding/urls.py
from django.urls import path
from .views import OnboardingResumeUploadView, DemoTokenView

urlpatterns = [
    path(
        "onboard/process-resume/",
        OnboardingResumeUploadView.as_view(),
        name="onboard-process-resume",
    ),
    path(
        "onboard/get-demo-token/",
        DemoTokenView.as_view(),
        name="onboard-get-demo-token",
    ),
]
