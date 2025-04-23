from django.shortcuts import render

# Create your views here.
# backend/generation/views.py
from rest_framework import views, permissions, status
from rest_framework.response import Response

# Correct import path for the service function
from .services.resume_generator_service import generate_resume_content_for_jd


class GenerateResumeView(views.APIView):
    """
    API endpoint to trigger resume content generation based on a Job Description.
    Requires authentication. Expects {"jd_text": "..."} in POST body.
    Returns the full data of the newly created Resume object on success.
    """

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        jd_text = request.data.get("jd_text", None)
        if not jd_text:
            return Response(
                {"error": "jd_text field is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = request.user
        # Call the main service function
        result_data = generate_resume_content_for_jd(user, jd_text)

        # Check if the service returned an error string
        if isinstance(result_data, str) and result_data.startswith("Error:"):
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
            if (
                "profile not found" in result_data.lower()
                or "base resume not found" in result_data.lower()
            ):
                status_code = (
                    status.HTTP_400_BAD_REQUEST
                )  # Bad request if prerequisite data missing
            elif "blocked by safety filters" in result_data.lower():
                status_code = (
                    status.HTTP_400_BAD_REQUEST
                )  # Treat blocking as bad input/request for now
            elif "AI Client not configured" in result_data:
                status_code = status.HTTP_503_SERVICE_UNAVAILABLE
            elif "Failed to parse AI response" in result_data:
                status_code = (
                    status.HTTP_502_BAD_GATEWAY
                )  # Error communicating with or parsing AI
            return Response({"error": result_data}, status=status_code)

        # If successful, result_data is the dictionary from the ResumeSerializer
        return Response(
            result_data, status=status.HTTP_201_CREATED
        )  # Return 201 since a new resource was created
