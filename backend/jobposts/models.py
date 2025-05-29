import uuid
from django.db import models
from django.conf import settings


class JobPost(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="job_posts",
        null=True,  # Allow anonymous job posts if needed, or remove if user is mandatory
        blank=True,
    )
    url = models.URLField(max_length=1024, blank=True, null=True)
    company_name = models.CharField(max_length=255, blank=True, null=True)
    job_description = models.TextField(blank=True, null=True)
    apply_link = models.URLField(max_length=1024, blank=True, null=True, help_text="Direct link to apply for the job.")
    # title = models.CharField(max_length=255, blank=True, null=True) # Consider adding a job title

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.company_name or 'N/A'} - {self.id}"

    class Meta:
        ordering = ["-created_at"]
