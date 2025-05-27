# backend/authentication/serializers.py
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
import re
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from rest_framework_simplejwt.settings import (
    api_settings as simplejwt_api_settings,
)  # For UPDATE_LAST_LOGIN
from django.contrib.auth.models import update_last_login  # For UPDATE_LAST_LOGIN
from rest_framework_simplejwt.tokens import RefreshToken


# This replaces the previous MyTokenObtainPairSerializer
class EmailLoginSerializer(
    serializers.Serializer
):  # Changed parent to serializers.Serializer
    email = serializers.EmailField(write_only=True)
    password = serializers.CharField(
        style={"input_type": "password"}, trim_whitespace=False, write_only=True
    )

    # Fields for response (read-only)
    access = serializers.CharField(read_only=True)
    refresh = serializers.CharField(read_only=True)
    # Optionally include user details in response
    # user = UserDetailSerializer(read_only=True) # Example if you have a UserDetailSerializer

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        if not email or not password:
            raise serializers.ValidationError(
                'Must include "email" and "password".', code="authorization"
            )

        # Your RegisterSerializer stores the email in the User.username field.
        # So, we authenticate by passing the request's 'email' as the 'username' parameter.
        user = authenticate(
            request=self.context.get("request"), username=email, password=password
        )

        if not user or not user.is_active:
            raise serializers.ValidationError(
                "No active account found with the given credentials.",
                code="authentication",
            )

        # Get tokens for the user
        # We need to get the TokenObtainPairSerializer logic for token generation here
        # or directly use RefreshToken.for_user(user)
        refresh = RefreshToken.for_user(user)

        validated_data = {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": user,  # Store user for potential further processing or response modification
        }

        if simplejwt_api_settings.UPDATE_LAST_LOGIN:
            update_last_login(None, user)

        return validated_data


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    confirmPassword = serializers.CharField(write_only=True, required=True)
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "password",
            "confirmPassword",
        )
        read_only_fields = ("id",)

    def validate_password(self, value):
        """
        Validate password according to frontend requirements:
        - 8-16 characters long
        - At least one uppercase letter
        - At least one lowercase letter
        - At least one number
        - At least one symbol
        """
        password_regex = r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>\/?]).{8,16}$'

        if not re.match(password_regex, value):
            raise serializers.ValidationError(
                "Your password must be between 8 and 16 characters long and include at least one uppercase letter, one lowercase letter, one number, and one symbol"
            )
        return value

    def validate(self, attrs):
        if attrs["password"] != attrs["confirmPassword"]:
            raise serializers.ValidationError(
                {"confirmPassword": "Passwords do not match."}
            )
        if User.objects.filter(email=attrs["email"]).exists():
            raise serializers.ValidationError(
                {"email": "User with this email already exists."}
            )
        return attrs

    def create(self, validated_data):
        # Remove confirmPassword from validated_data as it's not needed for user creation
        validated_data.pop("confirmPassword", None)

        # Use email as username since we're not requiring a separate username
        email = validated_data["email"]

        user = User.objects.create(
            username=email,  # Use email as username
            email=email,
        )

        user.set_password(validated_data["password"])
        user.save()
        return user
