# coding: utf-8
from django.conf import settings


def hostname(request):
    return {
        'HOSTNAME': 'http://' + settings.HOSTNAME,
        'RAW_HOSTNAME': settings.HOSTNAME
    }
