from django.urls import path

# We will create RegisterView in the next step (Step 5)
from .views import RegisterView, EmailLoginView, LogoutView, CustomTokenRefreshView

# We no longer need the default TokenRefreshView from simplejwt
# from rest_framework_simplejwt.views import (
#     TokenRefreshView,  # Handles refreshing expired access tokens
#     # TokenBlacklistView, # No longer using the default blacklist view directly
# )

# Define the URL patterns specific to this authentication app
urlpatterns = [
    # When a request hits /api/auth/register/, call RegisterView
    path("register/", RegisterView.as_view(), name="auth_register"),
    # When a request hits /api/auth/login/, use EmailLoginView
    path("login/", EmailLoginView.as_view(), name="auth_login"),
    # Use our custom token refresh view
    path("token/refresh/", CustomTokenRefreshView.as_view(), name="token_refresh"),
    # Use our custom LogoutView for the blacklist/logout functionality
    path("logout/", LogoutView.as_view(), name="auth_logout"),
]
