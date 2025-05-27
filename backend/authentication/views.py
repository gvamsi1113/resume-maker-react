# from django.shortcuts import render # Unused import removed

from django.contrib.auth.models import User  # Need the User model
from rest_framework import (
    generics,
    permissions,
)  # Import DRF generics & permissions
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import (
    RegisterSerializer,
    EmailLoginSerializer,
)  # Import RegisterSerializer and EmailLoginSerializer
from rest_framework_simplejwt.views import (
    TokenViewBase,
    TokenRefreshView,
)  # For a base view if needed, or just APIView
from rest_framework.views import APIView  # Using APIView for more control
from django.conf import settings  # Import settings for DEBUG
from django.utils import timezone  # For cookie expiration
from datetime import timedelta  # For cookie expiration
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.exceptions import InvalidToken


# Register API View
# We use a generic 'CreateAPIView' provided by DRF.
# This class is specifically designed to handle POST requests for
# creating objects.
class RegisterView(generics.CreateAPIView):
    # Specifies the base queryset (mainly used for list views, but good
    # practice). We are dealing with User objects.
    queryset = User.objects.all()

    # Specifies who is allowed to access this specific API endpoint.
    # 'AllowAny' means no authentication is required - anyone can attempt
    # to register.
    permission_classes = (permissions.AllowAny,)

    # Tells this view which serializer to use for validating incoming data
    # and for creating the new User object.
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        user = serializer.save()  # Save the user using the serializer

        # Generate JWT tokens for the new user
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        # refresh_token_str = str(refresh) # No longer need this for body

        response = Response()

        # Set refresh token in HttpOnly cookie
        refresh_token_lifetime = settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"]
        expires = timezone.now() + refresh_token_lifetime

        response.set_cookie(
            key="refresh_token",
            value=str(refresh),
            httponly=True,
            expires=expires,
            samesite="Lax",
            secure=not settings.DEBUG,
            path="/",
        )

        # Return user data along with access token in the body
        response.data = {
            "message": "User registered successfully!",
            "user": {
                "id": user.id,
                "email": user.email,
            },
            "tokens": {
                "access": access_token,
                # Refresh token is now in cookie, not in body
            },
        }
        response.status_code = status.HTTP_201_CREATED
        return response


# Login API View
class EmailLoginView(
    APIView
):  # Changed from TokenViewBase to APIView for simplicity with custom serializer
    permission_classes = (permissions.AllowAny,)
    serializer_class = EmailLoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(
            data=request.data, context={"request": request}
        )
        try:
            serializer.is_valid(raise_exception=True)
        except (
            Exception
        ) as e:  # Catching a broader exception just in case, but ValidationErorr is primary
            # Ensure you have 'from rest_framework import serializers' if not already present at top
            # For specific handling of serializers.ValidationError:
            # from rest_framework.exceptions import ValidationError as DRFValidationError
            # if isinstance(e, DRFValidationError):
            # return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        validated_data = serializer.validated_data
        access_token = validated_data["access"]
        refresh_token = validated_data["refresh"]
        user_data = validated_data["user"]

        response = Response()

        # Set refresh token in HttpOnly cookie
        refresh_token_lifetime = settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"]
        expires = timezone.now() + refresh_token_lifetime

        response.set_cookie(
            key="refresh_token",
            value=str(refresh_token),
            httponly=True,
            expires=expires,
            samesite="Lax",  # Or 'Strict'
            secure=not settings.DEBUG,  # True in production, False in development
            path="/",  # Make cookie available for all paths
        )

        # Access token and user data remain in the response body
        response.data = {
            "message": "Login successful!",
            "user": {
                "id": user_data.id,
                "email": user_data.email,
            },
            "tokens": {
                "access": str(access_token),
                # Refresh token is now in cookie, not in body
            },
        }
        response.status_code = status.HTTP_200_OK
        return response


class LogoutView(APIView):
    permission_classes = (
        permissions.IsAuthenticated,
    )  # Ensure this is imported: from rest_framework import permissions

    def post(self, request, *args, **kwargs):
        print(f"[LogoutView] Request Headers: {request.headers}")  # Log all headers
        print(
            f"[LogoutView] Request Cookies: {request.COOKIES}"
        )  # Log cookies seen by Django
        response = Response()
        refresh_token_value = request.COOKIES.get("refresh_token")

        if refresh_token_value:
            try:
                token = RefreshToken(refresh_token_value)
                token.blacklist()

                # Clear the refresh_token cookie
                response.delete_cookie(
                    "refresh_token",
                    path="/",
                    # samesite='Lax' # samesite needs to be specified for Chrome >= 80 if secure is True, even for deletion
                    # For deletion, modern browsers might not strictly need samesite, but path and domain must match.
                    # Let's add samesite for robustness.
                    samesite=(
                        "Lax" if not settings.DEBUG else None
                    ),  # None allows non-secure cookies in dev to be cleared
                )
                response.data = {
                    "message": "Logout successful, token blacklisted and cookie cleared."
                }
                response.status_code = status.HTTP_200_OK
            except Exception as e:
                # This could happen if the token is malformed or already blacklisted
                response.data = {"detail": f"Error blacklisting token: {str(e)}"}
                response.status_code = status.HTTP_400_BAD_REQUEST
        else:
            response.data = {"detail": "Refresh token not found in cookies."}
            response.status_code = status.HTTP_400_BAD_REQUEST

        return response


class CustomTokenRefreshSerializer(TokenRefreshSerializer):
    def validate(self, attrs):
        # attrs['refresh'] will be None because it's not in the request body
        # We need to get it from the cookie in the request context
        refresh_token_value = self.context["request"].COOKIES.get("refresh_token")
        if not refresh_token_value:
            raise InvalidToken("No refresh token found in cookies.")

        attrs["refresh"] = refresh_token_value
        return super().validate(attrs)


class CustomTokenRefreshView(TokenRefreshView):
    serializer_class = CustomTokenRefreshSerializer  # Use our custom serializer

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)

        # If token refresh was successful and new tokens were issued,
        # the new refresh token (if rotated) needs to be set as an HttpOnly cookie.
        # The new access token is already in response.data['access'] by the parent class.
        if response.status_code == status.HTTP_200_OK and "refresh" in response.data:
            new_refresh_token = response.data[
                "refresh"
            ]  # This is the new rotated refresh token

            refresh_token_lifetime = settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"]
            expires = timezone.now() + refresh_token_lifetime

            response.set_cookie(
                key="refresh_token",
                value=str(new_refresh_token),
                httponly=True,
                expires=expires,
                samesite="Lax",
                secure=not settings.DEBUG,
                path="/",
            )
            # Remove the refresh token from the response body as it's now in a cookie
            del response.data["refresh"]

        return response
