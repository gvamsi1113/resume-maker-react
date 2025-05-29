# backend/resumes/models.py
import uuid
from django.db import models

# from django.contrib.auth.models import User # No longer directly import User
from django.conf import settings  # Import settings
from django.db.models import Q  # For constraints condition
# Import JobPost model, ensure correct relative import
from jobposts.models import JobPost


class Resume(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,  # Use settings.AUTH_USER_MODEL
        on_delete=models.CASCADE,
        related_name="resumes",
        null=True,
        blank=True,
        default=None,
    )
    name = models.CharField(max_length=200, default="Untitled Resume")
    is_base_resume = models.BooleanField(default=False, db_index=True)
    # Source Job Info
    source_job_description = models.TextField(blank=True, null=True)
    source_job_url = models.URLField(max_length=1024, blank=True, null=True)
    source_company_name = models.CharField(max_length=150, blank=True, null=True)

    # Link to a specific JobPost a user might be applying to with this resume
    associated_job_post = models.ForeignKey(
        JobPost,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="associated_resumes",
        help_text="The specific job post this resume is tailored for or associated with."
    )

    tracking_link = models.URLField(
        max_length=1024, 
        blank=True, 
        null=True, 
        help_text="Link to track the application status for this resume, if applicable."
    )

    # Fields to store the AI's enhanced_resume_data directly
    # Top-level contact and summary block
    first_name = models.CharField(max_length=150, blank=True, null=True)
    last_name = models.CharField(max_length=150, blank=True, null=True)
    email = models.EmailField(
        max_length=254, blank=True, null=True
    )  # Note: distinct from processed_email
    phone = models.CharField(
        max_length=30, blank=True, null=True
    )  # Note: distinct from processed_phone
    location = models.CharField(max_length=255, blank=True, null=True)
    socials = models.JSONField(default=list, blank=True)  # For the 'socials' array
    summary = models.TextField(blank=True, null=True)  # For the main 'summary' string

    # Arrays from the JSON data
    work = models.JSONField(
        default=list, blank=True
    )  # Stores the 'work' array directly
    education = models.JSONField(
        default=list, blank=True
    )  # Stores the 'education' array directly
    projects = models.JSONField(
        default=list, blank=True
    )  # Stores the 'projects' array directly
    skills = models.JSONField(
        default=list, blank=True
    )  # Stores the 'skills' array directly (array of skill categories)
    languages = models.JSONField(
        default=list, blank=True
    )  # Stores the 'languages' array directly
    certificates = models.JSONField(
        default=list, blank=True
    )  # Stores the 'certificates' array directly
    other_extracted_data = models.JSONField(
        default=list, blank=True
    )  # Stores potentially a list of other extracted items, possibly structured

    # New field for resume analysis
    analysis = models.TextField(
        blank=True, null=True
    )  # Stores text analysis of the original resume

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        base_marker = "[BASE]" if self.is_base_resume else ""
        # CustomUser's __str__ returns email, or use user.email directly
        user_identifier = self.user.email if self.user else "Anonymous"
        return f"{user_identifier} - {self.name} ({self.id}) {base_marker}"

    class Meta:
        ordering = ["-is_base_resume", "-updated_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["user", "is_base_resume"],
                condition=Q(is_base_resume=True),
                name="unique_base_resume_per_user",
            )
        ]
