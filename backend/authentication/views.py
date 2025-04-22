# from django.shortcuts import render # Unused import removed

from django.contrib.auth.models import User  # Need the User model
from rest_framework import (
    generics,
    permissions,
)  # Import DRF generics & permissions
# from rest_framework.response import Response # Unused import removed
from .serializers import (
    RegisterSerializer,
)  # Import RegisterSerializer


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

    # --- Optional Customization ---
    # By default, CreateAPIView returns the newly created object data and
    # a 201 status. If you wanted to return a different response
    # (e.g., just a success message), you could override the 'create'
    # method like this: (uncomment if desired)
    #
    # from rest_framework.response import Response # Import if overriding
    #
    # def create(self, request, *args, **kwargs):
    #     # Call the parent class's create method first to handle actual
    #     # object creation
    #     response = super().create(request, *args, **kwargs)
    #     # response.data contains the serialized user data (excluding
    #     # password)
    #
    #     # Return a custom success message instead of the user data
    #     return Response({
    #         "message": "User registered successfully!",
    #         # You could optionally include some non-sensitive user data:
    #         # "user_id": response.data.get('id'),
    #         # "username": response.data.get('username')
    #     # Keep original status (201 Created)
    #     }, status=response.status_code)
