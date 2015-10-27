# -*- coding: utf-8 -*-
import os
import sys

from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from django.core.urlresolvers import reverse_lazy

try:
    from settings_local import *
except ImportError as e:
    sys.stderr.write('Exception:\n%s\n' % e)
    raise ImproperlyConfigured('Module settings_local not found.')


ADMINS = (
    # ('Your Name', 'your_email@example.com'),
)

MANAGERS = ADMINS

'''
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.', # Add 'postgresql_psycopg2', 'mysql', 'sqlite3' or 'oracle'.
        'NAME': '',                      # Or path to database file if using sqlite3.
        # The following settings are not used with sqlite3:
        'USER': '',
        'PASSWORD': '',
        'HOST': '',                      # Empty for localhost through domain sockets or '127.0.0.1' for localhost through TCP.
        'PORT': '',                      # Set to empty string for default.
    }
}
'''
# Hosts/domain names that are valid for this site; required if DEBUG is False
# See https://docs.djangoproject.com/en/1.5/ref/settings/#allowed-hosts
ALLOWED_HOSTS = ['www.tobaccowatcher.org', 'tobaccowatcher.globaltobaccocontrol.org']

# Local time zone for this installation. Choices can be found here:
# http://en.wikipedia.org/wiki/List_of_tz_zones_by_name
# although not all choices may be available on all operating systems.
# In a Windows environment this must be set to your system time zone.
TIME_ZONE = 'America/Chicago'

# Language code for this installation. All choices can be found here:
# http://www.i18nguy.com/unicode/language-identifiers.html
LANGUAGE_CODE = 'en-us'

SITE_ID = 1

# If you set this to False, Django will make some optimizations so as not
# to load the internationalization machinery.
USE_I18N = True

# If you set this to False, Django will not format dates, numbers and
# calendars according to the current locale.
USE_L10N = True

# If you set this to False, Django will not use timezone-aware datetimes.
USE_TZ = True

# Absolute filesystem path to the directory that will hold user-uploaded files.
# Example: "/var/www/example.com/media/"
#MEDIA_ROOT = ''

# URL that handles the media served from MEDIA_ROOT. Make sure to use a
# trailing slash.
# Examples: "http://example.com/media/", "http://media.example.com/"
#MEDIA_URL = ''

# Absolute path to the directory static files should be collected to.
# Don't put anything in this directory yourself; store your static files
# in apps' "static/" subdirectories and in STATICFILES_DIRS.
# Example: "/var/www/example.com/static/"
#STATIC_ROOT = ''

# URL prefix for static files.
# Example: "http://example.com/static/", "http://static.example.com/"
# STATIC_URL = '/static/'

# Additional locations of static files
ROOT = os.path.dirname(os.path.realpath(__file__))
ROOT = os.path.join(ROOT, '..')
STATICFILES_DIRS = (
    # Email assets that should not get prefixed with Gruntfile tasks
    ROOT + '/app/static/email_assets',
)

# List of finder classes that know how to find static files in
# various locations.
STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
#    'django.contrib.staticfiles.finders.DefaultStorageFinder',
)

# List of callables that know how to import templates from various sources.
TEMPLATE_LOADERS = (
    'django.template.loaders.filesystem.Loader',
    'django.template.loaders.app_directories.Loader',
#     'django.template.loaders.eggs.Loader',
)

TEMPLATE_CONTEXT_PROCESSORS = (
    'django.contrib.auth.context_processors.auth',
    'django.core.context_processors.debug',
    'django.core.context_processors.i18n',
    'django.core.context_processors.media',
    'django.core.context_processors.static',
    'django.core.context_processors.tz',
    'django.contrib.messages.context_processors.messages',
    'tobaccowatcher_web.context_processors.hostname'
)

MIDDLEWARE_CLASSES = (
    'django.middleware.common.CommonMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    # Uncomment the next line for simple clickjacking protection:
    # 'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django_hosts.middleware.HostsMiddleware',
    'tobaccowatcher.middleware.RequestLoggingMiddleware',
    'tobaccowatcher.middleware.RatelimitMiddleware'
)

ROOT_URLCONF = 'tobaccowatcher.urls'
ROOT_HOSTCONF = 'tobaccowatcher.hosts'
DEFAULT_HOST = 'home'

# Python dotted path to the WSGI application used by Django's runserver.
WSGI_APPLICATION = 'tobaccowatcher.wsgi.application'

TEMPLATE_DIRS = (
    # Put strings here, like "/home/html/django_templates" or "C:/www/django/templates".
    # Always use forward slashes, even on Windows.
    # Don't forget to use absolute paths, not relative paths.
)

INSTALLED_APPS = (
    'tobaccowatcher',
    'tobaccowatcher_admin',
    'tobaccowatcher_web',

    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.sites',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.admin',
    # Uncomment the next line to enable admin documentation:
    # 'django.contrib.admindocs',

    'south',
    'django_hosts',
    'registration'
)

ACCOUNT_ACTIVATION_DAYS = 7

SESSION_SERIALIZER = 'django.contrib.sessions.serializers.JSONSerializer'

# A sample logging configuration. The only tangible logging
# performed by this configuration is to send an email to
# the site admins on every HTTP 500 error when DEBUG=False.
# See http://docs.djangoproject.com/en/dev/topics/logging for
# more details on how to customize your logging configuration.
#ROOT = os.path.dirname(os.path.realpath(__file__))
#ROOT = os.path.join(ROOT, '..', '..')
#LOG_FILE_PATH = os.path.join(ROOT, 'logfile.log')LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'filters': {
        'require_debug_false': {
            '()': 'django.utils.log.RequireDebugFalse'
        }
    },
    'handlers': {
        'mail_admins': {
            'level': 'ERROR',
            'filters': ['require_debug_false'],
            'class': 'django.utils.log.AdminEmailHandler'
        },
        'file': {
            'level': 'DEBUG',
            'class': 'logging.handlers.RotatingFileHandler',
            'maxBytes': 1024*1024*2,
            'backupCount': 5,
            'filename': LOG_FILE_PATH,
            'formatter': 'simple'
        },
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
            'formatter': 'simple'
        }
    },
    'loggers': {
        'django.request': {
            'handlers': ['mail_admins'],
            'level': 'ERROR',
            'propagate': True,
        },
        'tobaccowatcher.middleware': {
            'handlers': ['file'],
            'level': 'INFO',
        },
        'tobaccowatcher_web.views': {
            'handlers': ['file'],
            'level': 'INFO',
        },
        'tobaccowatcher.management.commands.send_emails': {
            'handlers': ['console'],
            'level': 'INFO',
        }
    },
    'formatters': {
        'simple': {
            'format': '%(asctime)s %(message)s'
        },
    }
}

AUTH_USER_MODEL = 'tobaccowatcher.User'
LOGIN_URL = '/login'
UNREGISTERED_REDIRECT_URL = reverse_lazy('registration')
USER_CREATED_EMAILS = ['contact@tobaccowatcher.org']
RATELIMIT_ERROR_EMAILS = ['contact@tobaccowatcher.org']
RATELIMIT_EMAIL_SEND_TIMEOUT = 3600*24  # one day
MEMCACHED_SERVERS = ['127.0.0.1:11211']

SERVE_STATIC_FILES = False
POPULAR_IMPORTANCE = [1, 10]

# django-ratelimit
RATELIMIT_ENABLE = True
RATELIMIT_RATE = '100/30m'

try:
    from settings_local import *
except ImportError as e:
    sys.stderr.write('Exception:\n%s\n' % e)
    raise ImproperlyConfigured('Module settings_local not found.')

# try:
#     required_variables = (
#         'SECRET_KEY',
#         'HOSTNAME',
#         'DATABASES',
#         'ROOT',
#     )
#     for name in required_variables:
#         if not getattr(globals(), name):
#             raise ImproperlyConfigured('Variable %s required' % name)
# except NameError as e:
#     raise ImproperlyConfigured('Variable %s required' % name)
