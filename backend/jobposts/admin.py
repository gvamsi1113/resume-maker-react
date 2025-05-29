from django.contrib import admin
from .models import JobPost


@admin.register(JobPost)
class JobPostAdmin(admin.ModelAdmin):
    list_display = ("id", "company_name", "job_title", "source_url", "created_at", "updated_at")
    list_filter = ("company_name", "created_at")
    search_fields = ("company_name", "job_title", "job_description", "source_url")
