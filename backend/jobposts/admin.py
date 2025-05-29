from django.contrib import admin
from .models import JobPost


@admin.register(JobPost)
class JobPostAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "company_name", "created_at", "updated_at")
    list_filter = ("user", "company_name", "created_at")
    search_fields = ("company_name", "job_description", "user__email")
    raw_id_fields = ("user",)
