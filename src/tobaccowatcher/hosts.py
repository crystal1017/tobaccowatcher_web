# -*- coding: utf-8 -*-

from django_hosts import patterns, host
from django.conf import settings

host_patterns = patterns(
    '',
    host(r'^admin/', 'tobaccowatcher_admin.urls', name='admin_subdomain'),
    host(r'', 'tobaccowatcher_web.urls', name='home'),
)
