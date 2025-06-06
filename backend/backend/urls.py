# backend/backend/urls.py
from django.contrib import admin
from django.urls import path, include
from accounts.views import CustomRegisterView  # Import the custom view

urlpatterns = [
    path("admin/", admin.site.urls),
    # path("api/auth/", include("authentication.urls")), # Old auth URLs
    path("api/auth/", include("dj_rest_auth.urls")),  # dj-rest-auth main URLs
    path("api/auth/registration/", CustomRegisterView.as_view(), name="rest_register"),
    path(
        "accounts/", include("allauth.urls")
    ),  # allauth specific URLs (needed for some flows like password reset forms)
    path("api/", include("bio.urls")),
    path("api/", include("resumes.urls")),
    path("api/", include("generation.urls")),
    path("api/", include("onboarding.urls")),
]
