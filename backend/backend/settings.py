import os
import dj_database_url
from dotenv import load_dotenv
from pathlib import Path
from datetime import timedelta
from corsheaders.defaults import default_headers

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(os.path.join(BASE_DIR, ".env"))

SECRET_KEY = os.environ.get(
    "SECRET_KEY", "django-insecure-!!!REPLACE-ME-SECRET-KEY!!!"  # MUST REPLACE IN .env
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
    "django.contrib.sites",  # Required by allauth
    "accounts",
    "rest_framework",
    "rest_framework.authtoken",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",
    # "authentication", # No longer needed
    "bio",
    "resumes",
    "generation",
    "onboarding",
    "corsheaders",
    "allauth",
    "allauth.account",
    "allauth.socialaccount",  # If using social accounts
    "dj_rest_auth",
    "dj_rest_auth.registration",  # For registration views
]

# Required by allauth
SITE_ID = 1

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "allauth.account.middleware.AccountMiddleware",  # allauth middleware
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
                "django.template.context_processors.request",  # allauth needs this
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]
WSGI_APPLICATION = "backend.wsgi.application"

AUTH_USER_MODEL = "accounts.CustomUser"

# Database configuration
# Default to SQLite if DATABASE_URL is not set
DEFAULT_DB_URL = f'sqlite:///{BASE_DIR / "db.sqlite3"}'
DATABASE_URL = os.environ.get("DATABASE_URL", DEFAULT_DB_URL)

DATABASES = {"default": dj_database_url.config(default=DATABASE_URL, conn_max_age=600)}

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
        "NAME": ("django.contrib.auth.password_validation.MinimumLengthValidator"),
    },
    {
        "NAME": ("django.contrib.auth.password_validation.CommonPasswordValidator"),
    },
    {
        "NAME": ("django.contrib.auth.password_validation.NumericPasswordValidator"),
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
    # dj_rest_auth will handle authentication classes
    # 'DEFAULT_AUTHENTICATION_CLASSES': (
    #     'rest_framework_simplejwt.authentication.JWTAuthentication',
    # ),
    "DEFAULT_PERMISSION_CLASSES": ("rest_framework.permissions.AllowAny",),
    # Make sure DRF uses Django's session authentication if needed by allauth views
    # or if you mix session and token auth. dj_rest_auth handles token auth.
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
        # Add session auth if you have views that might use it,
        # or if allauth's non-API views are directly accessed.
        # 'rest_framework.authentication.SessionAuthentication',
    ),
}

AUTHENTICATION_BACKENDS = (
    # Needed to login by username in Django admin, regardless of `allauth`
    "django.contrib.auth.backends.ModelBackend",
    # `allauth` specific authentication methods, such as login by e-mail
    "allauth.account.auth_backends.AuthenticationBackend",
)

# django-allauth specific settings
# ACCOUNT_AUTHENTICATION_METHOD = "email"  # Deprecated
ACCOUNT_LOGIN_METHODS = {"email"}  # New setting
# ACCOUNT_EMAIL_REQUIRED = True # Deprecated
ACCOUNT_SIGNUP_FIELDS = {
    "email",
    "password",
}  # New setting: specifies fields for signup form
ACCOUNT_UNIQUE_EMAIL = True
ACCOUNT_EMAIL_VERIFICATION = "mandatory"
ACCOUNT_USERNAME_REQUIRED = False  # dj_rest_auth compatibility; allauth itself will ignore this with custom model
ACCOUNT_USER_MODEL_USERNAME_FIELD = None  # Correct for allauth with no username field
ACCOUNT_USERNAME_HANDLING = "email"  # Use email as username
ACCOUNT_ADAPTER = "accounts.adapter.AccountAdapter"

# For DRF/React SPA, we usually don't need allauth's default login/logout views
# LOGIN_REDIRECT_URL = "/"
# LOGOUT_REDIRECT_URL = "/"

SILENCED_SYSTEM_CHECKS = ["account.W001"]  # Silence spurious allauth warning

# dj-rest-auth settings
REST_AUTH = {
    "USE_JWT": True,
    "JWT_AUTH_HTTPONLY": True,  # For refresh token in HttpOnly cookie
    "JWT_AUTH_COOKIE": "refresh-token",  # Name of the cookie for refresh token by dj-rest-auth
    "JWT_AUTH_REFRESH_COOKIE": "refresh-token",  # Ensure this matches JWT_AUTH_COOKIE if using simplejwt defaults
    "JWT_AUTH_SAMESITE": "Lax",
    "USER_DETAILS_SERIALIZER": "dj_rest_auth.serializers.UserDetailsSerializer",  # Default
    "LOGIN_SERIALIZER": "dj_rest_auth.serializers.LoginSerializer",  # Default
    "REGISTER_SERIALIZER": "accounts.serializers.CustomRegisterSerializer",  # USE OUR CUSTOM SERIALIZER
    # If you need to issue an access token in the response body and refresh token in cookie
    "JWT_AUTH_RETURN_EXPIRATION": False,  # simplejwt specific, dj-rest-auth handles this
    "SESSION_LOGIN": False,  # Ensure this is False if you only want JWT
}


# Simple JWT Settings (dj_rest_auth uses these if djangorestframework-simplejwt is the JWT provider)
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=15),  # Increased for usability
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),  # Standard refresh lifetime
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "UPDATE_LAST_LOGIN": True,
    "ALGORITHM": "HS256",
    "SIGNING_KEY": SECRET_KEY,
    "VERIFYING_KEY": None,
    "AUDIENCE": None,
    "ISSUER": None,
    "JWK_URL": None,
    "LEEWAY": 0,
    "AUTH_HEADER_TYPES": ("Bearer",),
    "AUTH_HEADER_NAME": "HTTP_AUTHORIZATION",
    "USER_ID_FIELD": "id",
    "USER_ID_CLAIM": "user_id",
    "USER_AUTHENTICATION_RULE": "rest_framework_simplejwt.authentication.default_user_authentication_rule",
    "AUTH_TOKEN_CLASSES": ("rest_framework_simplejwt.tokens.AccessToken",),
    "TOKEN_TYPE_CLAIM": "token_type",
    "JTI_CLAIM": "jti",
    "SLIDING_TOKEN_REFRESH_EXP_CLAIM": "refresh_exp",
    "SLIDING_TOKEN_LIFETIME": timedelta(minutes=5),
    "SLIDING_TOKEN_REFRESH_LIFETIME": timedelta(days=1),
    # Custom: if refresh token is sent in cookie, simplejwt needs to know it won't be in body
    # This is usually handled by dj-rest-auth's configuration rather than simplejwt directly
}

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# For development, allow all origins (remove in production)
# CORS_ALLOW_ALL_ORIGINS = True # Commented out to use specific origins

CORS_ALLOW_HEADERS = list(default_headers) + [
    "x-demo-token",
]

CORS_ALLOW_CREDENTIALS = True
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"  # During development
