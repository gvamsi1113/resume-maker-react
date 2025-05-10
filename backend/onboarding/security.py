from django.core.cache import cache
from django.conf import settings
from rest_framework.exceptions import PermissionDenied
import secrets
import time
from typing import Optional, Tuple
import logging

logger = logging.getLogger(__name__)


class SecurityManager:
    # Rate limiting settings
    RATE_LIMIT_REQUESTS = 20  # Increased for testing
    RATE_LIMIT_WINDOW = 3600  # 1 hour in seconds

    # Token settings
    TOKEN_LENGTH = 32
    TOKEN_EXPIRY = 3600  # 1 hour in seconds

    # CAPTCHA settings
    CAPTCHA_EXPIRY = 300  # 5 minutes in seconds

    @classmethod
    def get_client_ip(cls, request) -> str:
        """Get client IP address from request."""
        x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
        if x_forwarded_for:
            return x_forwarded_for.split(",")[0]
        return request.META.get("REMOTE_ADDR")

    @classmethod
    def check_rate_limit(cls, request) -> bool:
        """Check if request is within rate limits."""
        ip = cls.get_client_ip(request)
        cache_key = f"rate_limit_{ip}"
        request_count = cache.get(cache_key, 0)

        if request_count >= cls.RATE_LIMIT_REQUESTS:
            return False

        cache.set(cache_key, request_count + 1, cls.RATE_LIMIT_WINDOW)
        return True

    @classmethod
    def generate_token(cls) -> str:
        """Generate a secure temporary token."""
        return secrets.token_urlsafe(cls.TOKEN_LENGTH)

    @classmethod
    def store_token(cls, token: str) -> None:
        """Store token with expiry."""
        cache.set(f"token_{token}", True, cls.TOKEN_EXPIRY)

    @classmethod
    def validate_token(cls, token: str) -> bool:
        """Validate if token exists and is not expired."""
        valid = bool(cache.get(f"token_{token}"))
        logger.info(f"validate_token: token={token}, valid={valid}")
        return valid

    @classmethod
    def generate_captcha(cls) -> Tuple[str, str]:
        """Generate a simple CAPTCHA challenge and answer."""
        # Simple math CAPTCHA
        num1 = secrets.randbelow(10)
        num2 = secrets.randbelow(10)
        answer = str(num1 + num2)
        challenge = f"{num1} + {num2} = ?"

        # Store answer with expiry
        cache.set(f"captcha_{challenge}", answer, cls.CAPTCHA_EXPIRY)
        return challenge, answer

    @classmethod
    def validate_captcha(cls, challenge: str, answer: str) -> bool:
        """Validate CAPTCHA answer."""
        stored_answer = cache.get(f"captcha_{challenge}")
        valid = stored_answer == answer
        logger.info(
            f"validate_captcha: challenge={challenge}, answer={answer}, stored_answer={stored_answer}, valid={valid}"
        )
        return valid

    @classmethod
    def validate_request(cls, request) -> Tuple[bool, Optional[str]]:
        """Validate all security measures for a request."""
        # Check rate limit
        if not cls.check_rate_limit(request):
            logger.warning("Rate limit exceeded for IP: %s", cls.get_client_ip(request))
            return False, "Rate limit exceeded. Please try again later."

        # Check token
        token = request.headers.get("X-Demo-Token")
        logger.info(f"validate_request: received token={token}")
        if not token:
            logger.warning("No token provided in request headers.")
            return False, "Invalid or expired token. Please request a new token."
        if not cls.validate_token(token):
            logger.warning("Invalid or expired token: %s", token)
            return False, "Invalid or expired token. Please request a new token."

        # Check CAPTCHA if provided
        captcha_challenge = request.data.get("captcha_challenge")
        captcha_answer = request.data.get("captcha_answer")
        if captcha_challenge and captcha_answer:
            if not cls.validate_captcha(captcha_challenge, captcha_answer):
                logger.warning(
                    "Invalid CAPTCHA answer. Challenge: %s, Answer: %s",
                    captcha_challenge,
                    captcha_answer,
                )
                return False, "Invalid CAPTCHA answer."
            else:
                logger.info(
                    f"CAPTCHA validated successfully for challenge={captcha_challenge}"
                )

        logger.info("Security checks passed for token: %s", token)
        return True, None
