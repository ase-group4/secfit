from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin
from .forms import CustomUserChangeForm, CustomUserCreationForm
from .models import Offer, AthleteFile


class CustomUserAdmin(UserAdmin):
    """
    A class that extends the default admin view for User by adding a
    coach field to the create-view and the edit-view.
    """

    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    model = get_user_model()
    fieldsets = UserAdmin.fieldsets + ((None, {"fields": ("coach",)}),)
    add_fieldsets = UserAdmin.add_fieldsets + ((None, {"fields": ("coach",)}),)


admin.site.register(get_user_model(), CustomUserAdmin)
admin.site.register(Offer)
admin.site.register(AthleteFile)
