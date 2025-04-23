# backend/bio/models.py
from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


class Bio(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="bio")
    # Personal Details
    first_name = models.CharField(max_length=150, blank=True, null=True)
    last_name = models.CharField(max_length=150, blank=True, null=True)
    date_of_birth = models.DateField(null=True, blank=True)
    country_of_origin = models.CharField(max_length=100, blank=True, null=True)
    # Contact
    email = models.EmailField(max_length=254, blank=True, null=True)
    phone = models.CharField(max_length=30, blank=True, null=True)
    # Location
    current_city = models.CharField(max_length=100, blank=True, null=True)
    current_state = models.CharField(max_length=100, blank=True, null=True)
    current_country = models.CharField(max_length=100, blank=True, null=True)
    # Professional Headline/Preferences
    headline = models.CharField(max_length=200, blank=True, null=True)
    target_roles = models.JSONField(default=list, blank=True)
    target_industries = models.JSONField(default=list, blank=True)
    can_join_immediately = models.BooleanField(null=True, blank=True)
    willing_to_relocate = models.BooleanField(null=True, blank=True)
    # Base Static Sections (Stored as JSON)
    base_summary = models.TextField(blank=True, null=True)
    base_education_json = models.JSONField(default=list, blank=True)
    base_languages_json = models.JSONField(default=list, blank=True)
    base_certificates_json = models.JSONField(default=list, blank=True)
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def full_name(self):
        parts = [self.first_name, self.last_name]
        return " ".join(p for p in parts if p) or self.user.username

    def __str__(self):
        return f"{self.user.username}'s Bio"


class SocialProfile(models.Model):
    bio = models.ForeignKey(
        Bio, on_delete=models.CASCADE, related_name="social_profiles"
    )
    network = models.CharField(max_length=50)
    username = models.CharField(max_length=150, blank=True, null=True)
    url = models.URLField(max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.bio.user.username} - {self.network}"

    class Meta:
        ordering = ["network"]
        unique_together = ("bio", "network")


@receiver(post_save, sender=User)
def create_or_update_user_bio(sender, instance, created, **kwargs):
    bio, bio_created = Bio.objects.get_or_create(user=instance)
    if bio_created or not bio.first_name or not bio.last_name or not bio.email:
        bio.first_name = instance.first_name or bio.first_name
        bio.last_name = instance.last_name or bio.last_name
        bio.email = instance.email or bio.email
        bio.save()
    elif (
        not bio_created
    ):  # If bio already existed, still save it to update updated_at timestamp? Optional.
        bio.save()
