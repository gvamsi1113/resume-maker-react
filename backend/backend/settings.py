import os
import dj_database_url
from dotenv import load_dotenv
from pathlib import Path
from datetime import timedelta

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(os.path.join(BASE_DIR, ".env"))

SECRET_KEY = os.environ.get(
    "SECRET_KEY",
    "django-insecure-!!!REPLACE-ME-SECRET-KEY!!!"  # MUST REPLACE IN .env
)
DEBUG = os.environ.get("DEBUG", "False") == "True"
ALLOWED_HOSTS = os.environ.get(
    "DJANGO_ALLOWED_HOSTS", "127.0.0.1 localhost [::1]"
).split(" ")

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",
    "authentication",
    "profiles",
]
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]
ROOT_URLCONF = "backend.urls"
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]
WSGI_APPLICATION = "backend.wsgi.application"

# Database configuration
# Default to SQLite if DATABASE_URL is not set
DEFAULT_DB_URL = f'sqlite:///{BASE_DIR / "db.sqlite3"}'
DATABASE_URL = os.environ.get("DATABASE_URL", DEFAULT_DB_URL)

DATABASES = {
    "default": dj_database_url.config(default=DATABASE_URL, conn_max_age=600)
}

# Password validation
# https://docs.djangoproject.com/en/stable/ref/settings/#auth-password-validators
AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": (
            "django.contrib.auth.password_validation"
            ".UserAttributeSimilarityValidator"
        ),
    },
    {
        "NAME": (
            "django.contrib.auth.password_validation.MinimumLengthValidator"
        ),
    },
    {
        "NAME": (
            "django.contrib.auth.password_validation.CommonPasswordValidator"
        ),
    },
    {
        "NAME": (
            "django.contrib.auth.password_validation.NumericPasswordValidator"
        ),
    },
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True
STATIC_URL = "static/"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# Django Rest Framework Settings
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        # Tells DRF to look for JWT Bearer tokens for authentication
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        # Sets the default access level. AllowAny means anyone can access
        # endpoints unless specifically restricted later.
        "rest_framework.permissions.AllowAny",
    ),
    # Optional settings can be added later
}

# Simple JWT Settings
SIMPLE_JWT = {
    # How long an access token is valid (e.g., 15 minutes)
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=15),
    # How long a refresh token is valid (e.g., 1 day)
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
    # Issue a new refresh token when the old one is used (recommended)
    "ROTATE_REFRESH_TOKENS": True,
    # Invalidate the old refresh token after rotation (recommended)
    "BLACKLIST_AFTER_ROTATION": True,
    # Update Django's 'last_login' field when a token is refreshed
    "UPDATE_LAST_LOGIN": True,
    "ALGORITHM": "HS256",  # Signing algorithm
    # Use Django's main SECRET_KEY for signing tokens
    "SIGNING_KEY": SECRET_KEY,
    "VERIFYING_KEY": "",  # Not needed for HS256
    "AUDIENCE": None,
    "ISSUER": None,
    "JSON_ENCODER": None,
    "JWK_URL": None,
    "LEEWAY": 0,
    # Specifies the 'Authorization' header format (e.g., "Bearer <token>")
    "AUTH_HEADER_TYPES": ("Bearer",),
    "AUTH_HEADER_NAME": "HTTP_AUTHORIZATION",
    "USER_ID_FIELD": "id",  # Field on the User model to use for ID
    "USER_ID_CLAIM": "user_id",  # Claim name in the JWT payload for user ID
    "USER_AUTHENTICATION_RULE": (
        "rest_framework_simplejwt.authentication"
        ".default_user_authentication_rule"
    ),
    "AUTH_TOKEN_CLASSES": (
        "rest_framework_simplejwt.tokens.AccessToken",
    ),
    "TOKEN_TYPE_CLAIM": "token_type",
    "TOKEN_USER_CLASS": "rest_framework_simplejwt.models.TokenUser",
    "JTI_CLAIM": "jti",  # Unique identifier for the token
    "SLIDING_TOKEN_REFRESH_EXP_CLAIM": "refresh_exp",
    # Only used if sliding tokens enabled
    "SLIDING_TOKEN_LIFETIME": timedelta(minutes=5),
    # Only used if sliding tokens enabled
    "SLIDING_TOKEN_REFRESH_LIFETIME": timedelta(days=1),
}
