from allauth.account.adapter import DefaultAccountAdapter

class AccountAdapter(DefaultAccountAdapter):
    def save_user(self, request, user, form, commit=True):
        """
        This is called when a user signs up an account.
        We override this to ensure that the user's email is saved correctly,
        especially since we are not using a username.
        """
        data = form.cleaned_data
        # The email is already handled by the form and user model's USERNAME_FIELD
        # user.email = data.get("email") # Not strictly necessary if USERNAME_FIELD is email
        
        # If you had other fields to set on the user model from the form, you'd do it here.
        # For example:
        # user.first_name = data.get('first_name')
        # user.last_name = data.get('last_name')

        # Let allauth's default adapter handle the password and other standard stuff
        super().save_user(request, user, form, commit=commit)
        return user

    # You might also want to override other methods like:
    # def populate_username(self, request, user):
    #     # If allauth tries to populate a username, ensure it uses the email
    #     # or does nothing if your model truly has no username field.
    #     # For AbstractBaseUser without a username field, this might not be called
    #     # or you might want to ensure it doesn't try to set a username.
    #     pass # Or set user.username = user.email if you had a username field to mirror email 