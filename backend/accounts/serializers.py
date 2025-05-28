# D:\resume-maker-react\backend\accounts\serializers.py

from django.conf import settings
from dj_rest_auth.registration.serializers import (
    RegisterSerializer as DefaultRegisterSerializer,
)
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from dj_rest_auth.serializers import UserDetailsSerializer

# Make sure your settings.py has appropriate django-allauth configurations for email-based registration:
# AUTH_USER_MODEL = 'accounts.CustomUser'  # Or your actual custom user model
# ACCOUNT_USER_MODEL_USERNAME_FIELD = None
# ACCOUNT_USERNAME_REQUIRED = False
# ACCOUNT_AUTHENTICATION_METHOD = 'email'
# ACCOUNT_EMAIL_REQUIRED = True
# ACCOUNT_UNIQUE_EMAIL = True
#
# And in your CustomUser model (e.g., accounts/models.py):
# USERNAME_FIELD = 'email'
# REQUIRED_FIELDS = [] # e.g., if only email and password are required for createsuperuser


class CustomRegisterSerializer(DefaultRegisterSerializer):
    """
    Custom serializer for registration that does not require a username.
    It expects email, password, and password2.
    The user is identified by their email address, as configured in django-allauth settings.
    Returns user details and JWT tokens upon successful registration.
    """

    # If your CustomUser model has no username field and django-allauth is configured
    # for email-only (ACCOUNT_USER_MODEL_USERNAME_FIELD = None), dj_rest_auth's
    # RegisterSerializer should already adapt.
    # Explicitly setting username = None here or ensuring it's not in Meta.fields
    # reinforces this if there's any ambiguity or if the parent serializer tries to include it.
    username = None

    # We will hold the tokens here after user creation
    access_token = serializers.CharField(read_only=True)
    refresh_token = serializers.CharField(read_only=True)
    user = UserDetailsSerializer(read_only=True)  # To serialize user details

    class Meta:
        model = settings.AUTH_USER_MODEL
        # Only include fields that are expected as input for registration
        # The output structure is defined by to_representation
        fields = (
            "email",
            "password",
            "password2",
        )
        extra_kwargs = {
            "password": {"write_only": True},
            "password2": {"write_only": True},
            # 'email' is write_only by default in parent if not customized
        }

    def save(self, request):
        user = super().save(request)
        # After user is created by the parent's save method,
        # we generate tokens for this user.
        # These tokens will be available when to_representation is called.
        # Note: The default RegisterSerializer.save() returns the user object.
        # We need to ensure our modifications are compatible or handled correctly.
        # Storing them on the serializer instance itself is a common way.

        refresh = RefreshToken.for_user(user)
        self.instance = user  # Set the instance for to_representation
        # We need to make these available to to_representation or modify data directly
        # A common way is to set them as attributes on the serializer if to_representation
        # is not overridden, or on the instance if to_representation accesses instance.
        # For simplicity, we'll set them on the instance so UserDetailsSerializer can pick them up if customized,
        # or to_representation can access them.

        # Actually, it's better to prepare the data that will be used by to_representation
        # or directly return the desired structure if the view uses serializer.data after save.
        # The RegisterView calls serializer.save(), gets user, then calls get_response_data(user)
        # which then calls self.get_serializer(user).data.
        # So, the `to_representation` of *this* serializer (CustomRegisterSerializer) is what matters.

        return user  # super().save(request) already returns the user

    def to_representation(self, instance):
        # instance here is the user object created by save()

        # --- Debugging ---
        # print(f"[DEBUG] User instance to serialize: {instance}")
        # try:
        #     print(f"[DEBUG] User instance pk: {instance.pk}")
        #     print(f"[DEBUG] User instance email: {instance.email}")
        #     # Add other fields you expect on CustomUser, e.g.:
        #     # if hasattr(instance, 'first_name'):
        #     #     print(f"[DEBUG] User instance first_name: {instance.first_name}")
        # except AttributeError as e:
        #     print(f"[DEBUG] Attribute error accessing user fields: {e}")
        # --- End Debugging ---

        # Get user data using UserDetailsSerializer
        user_data = UserDetailsSerializer(instance, context=self.context).data

        # --- Debugging ---
        # print(f"[DEBUG] UserDetailsSerializer output (user_data): {user_data}")
        # --- End Debugging ---

        # Generate tokens for the user
        refresh = RefreshToken.for_user(instance)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        return {
            "user": user_data,
            "tokens": {  # Nesting tokens as per frontend expectation
                "access": access_token,
                "refresh": refresh_token,
            },
        }


# --- Optional: Example of a serializer that also includes first_name and last_name ---
# To use this, you would set REST_AUTH['REGISTER_SERIALIZER'] to
# 'accounts.serializers.CustomRegisterSerializerWithNames' in settings.py.

# class CustomRegisterSerializerWithNames(DefaultRegisterSerializer):
#     """
#     Custom serializer for registration that does not require a username,
#     but includes first_name and last_name.
#     """
#     username = None  # Assuming username is not used/required based on allauth settings.

#     first_name = serializers.CharField(max_length=150, required=True) # Set required=False if optional
#     last_name = serializers.CharField(max_length=150, required=True)  # Set required=False if optional

#     class Meta:
#         model = settings.AUTH_USER_MODEL  # Crucial
#         fields = ('email', 'password', 'password2', 'first_name', 'last_name')

#     def save(self, request):
#         user = super().save(request)
#         # Save the additional fields to the user model.
#         # Ensure your AUTH_USER_MODEL (CustomUser) has first_name and last_name fields.
#         user.first_name = self.validated_data.get('first_name', '')
#         user.last_name = self.validated_data.get('last_name', '')
#         user.save()
#         return user
