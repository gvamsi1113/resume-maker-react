# backend/backend/urls.py
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("authentication.urls")),
    path("api/", include("bio.urls")),
    path("api/", include("resumes.urls")),
    path("api/", include("generation.urls")),
    path("api/", include("onboarding.urls")),
]
