# backend/resumes/models.py
from django.db import models
from django.contrib.auth.models import User
from django.db.models import Q  # For constraints condition


class Resume(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="resumes")
    name = models.CharField(max_length=200, default="Untitled Resume")
    is_base_resume = models.BooleanField(default=False, db_index=True)
    # Source Job Info
    source_job_description = models.TextField(blank=True, null=True)
    source_job_url = models.URLField(max_length=1024, blank=True, null=True)
    source_company_name = models.CharField(max_length=150, blank=True, null=True)
    # Generated/Stored Content for THIS version
    summary = models.TextField(blank=True, null=True)
    work = models.JSONField(default=list, blank=True)
    projects = models.JSONField(default=list, blank=True)
    skills = models.JSONField(default=dict, blank=True)
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        base_marker = "[BASE]" if self.is_base_resume else ""
        return f"{self.user.username} - {self.name} {base_marker}"

    class Meta:
        ordering = ["-is_base_resume", "-updated_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["user", "is_base_resume"],
                condition=Q(is_base_resume=True),
                name="unique_base_resume_per_user",
            )
        ]
