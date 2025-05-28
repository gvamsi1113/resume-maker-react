from django.shortcuts import render
from dj_rest_auth.registration.views import RegisterView
from dj_rest_auth.app_settings import api_settings as dj_rest_auth_api_settings

# Only import set_jwt_refresh_cookie as we only want to explicitly set the refresh token cookie.
# The access token will be in the response body.
from dj_rest_auth.jwt_auth import set_jwt_refresh_cookie
from rest_framework.response import Response
from rest_framework import status
from .serializers import CustomRegisterSerializer  # Still used for validation and save

# Create your views here.


class CustomRegisterView(RegisterView):
    serializer_class = CustomRegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = self.perform_create(serializer)  # This calls serializer.save()
        headers = self.get_success_headers(serializer.data)

        # Use the default get_response_data to get access/refresh tokens in the body
        # This typically returns a flat structure like {"access": "...", "refresh": "...", "user": {...}}
        response_data = self.get_response_data(user)

        if response_data:
            response = Response(
                response_data,  # Access token is already in here
                status=status.HTTP_201_CREATED,
                headers=headers,
            )
        else:
            # Handle cases like email verification sent, no tokens returned in body
            response = Response(status=status.HTTP_204_NO_CONTENT, headers=headers)

        # --- Add JWT refresh cookie if token is present and settings allow ---
        if dj_rest_auth_api_settings.USE_JWT and response_data:
            refresh_token = response_data.get("refresh")

            # Only set the refresh token as a cookie.
            # The access token remains in the response_data (JSON body).
            if refresh_token and dj_rest_auth_api_settings.JWT_AUTH_REFRESH_COOKIE:
                set_jwt_refresh_cookie(response, refresh_token)
        # --- End: Add JWT cookies ---

        return response
