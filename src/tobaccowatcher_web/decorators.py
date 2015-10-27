# coding: utf-8
from django.contrib.auth.decorators import login_required as django_login_required
from django.conf import settings


def login_required(function):
    """
    wrapper for django login_required with our custom url for redirect
    """
    return django_login_required(function, login_url=settings.UNREGISTERED_REDIRECT_URL)
