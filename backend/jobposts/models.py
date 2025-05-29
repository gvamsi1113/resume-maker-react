import uuid
from django.db import models


class JobPost(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    source_url = models.URLField(max_length=1024, unique=True, db_index=True, help_text="The unique URL where this job posting was found.")
    company_name = models.CharField(max_length=255, blank=True, null=True)
    job_title = models.CharField(max_length=255, blank=True, null=True)
    job_description = models.TextField(blank=True, null=True)
    apply_link = models.URLField(max_length=1024, blank=True, null=True, help_text="Direct link to apply for the job, if different from source_url.")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.job_title or 'Job'} at {self.company_name or 'N/A'} ({self.id})"

    class Meta:
        ordering = ["-created_at"]
