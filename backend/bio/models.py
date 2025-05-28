# backend/bio/models.py
from django.db import models

# from django.contrib.auth.models import User # No longer directly import User
from django.conf import settings  # Import settings
from django.contrib.auth import get_user_model  # Import get_user_model
from django.db.models.signals import post_save
from django.dispatch import receiver


class Bio(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="bio"
    )
    # Personal Details
    first_name = models.CharField(max_length=150, blank=True, null=True)
    last_name = models.CharField(max_length=150, blank=True, null=True)
    date_of_birth = models.DateField(null=True, blank=True)
    country_of_origin = models.CharField(max_length=100, blank=True, null=True)
    # Contact
    email = models.EmailField(
        max_length=254, blank=True, null=True
    )  # This email is on Bio, distinct from User's email
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
        # Since CustomUser uses email as its string representation and has no username:
        return " ".join(p for p in parts if p) or self.user.email

    def __str__(self):
        # CustomUser's __str__ returns email
        return f"{self.user}'s Bio"


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
        # CustomUser's __str__ returns email
        return f"{self.bio.user} - {self.network}"

    class Meta:
        ordering = ["network"]
        unique_together = ("bio", "network")


@receiver(post_save, sender=get_user_model())  # Use get_user_model() for sender
def create_or_update_user_bio(sender, instance, created, **kwargs):
    bio, bio_created = Bio.objects.get_or_create(user=instance)
    # CustomUser model has first_name, last_name, email directly
    if bio_created or not bio.first_name or not bio.last_name or not bio.email:
        bio.first_name = instance.first_name or bio.first_name
        bio.last_name = instance.last_name or bio.last_name
        bio.email = instance.email or bio.email  # instance here is CustomUser
        bio.save()
    elif not bio_created:
        bio.save()
