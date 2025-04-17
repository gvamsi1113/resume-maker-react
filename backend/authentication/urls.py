from django.urls import path
# We will create RegisterView in the next step (Step 5)
from .views import RegisterView
# Import views provided by the simplejwt library for handling tokens
from rest_framework_simplejwt.views import (
    TokenObtainPairView, # Handles login and issues tokens
    TokenRefreshView,    # Handles refreshing expired access tokens
    TokenBlacklistView,  # Handles invalidating refresh tokens (logout)
)

# Define the URL patterns specific to this authentication app
urlpatterns = [
    # When a request hits /api/auth/register/, call RegisterView
    path('register/', RegisterView.as_view(), name='auth_register'),

    # When a request hits /api/auth/token/, use simplejwt's TokenObtainPairView
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),

    # When a request hits /api/auth/token/refresh/, use simplejwt's TokenRefreshView
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Optional: When a request hits /api/auth/token/blacklist/, use simplejwt's TokenBlacklistView
    path('token/blacklist/', TokenBlacklistView.as_view(), name='token_blacklist'),
]
