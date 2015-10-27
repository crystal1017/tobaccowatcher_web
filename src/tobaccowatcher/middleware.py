# coding: utf-8
import logging

from django.conf import settings
from django.core.mail import send_mail
from ratelimit.exceptions import Ratelimited

from tobaccowatcher_web.utils import get_memcached


logger = logging.getLogger(__name__)


def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[-1].strip()
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


class RequestLoggingMiddleware(object):
    def process_response(self, request, response):
        try:
            user = request.user

            if user and not user.is_anonymous() and request.path:
                client_ip = get_client_ip(request)
                logger.info(str(client_ip) + '\t' + str(request.get_full_path()) + '\t' + str(user))
        except AttributeError:
            pass
        return response


class RatelimitMiddleware(object):
    def process_exception(self, request, exception):
        if not isinstance(exception, Ratelimited):
            return

        mc = get_memcached()
        key = 'ratelimited_{}'.format(request.user.id)
        if not mc.get(key):
            subject = 'User ratelimited'
            message = 'User with id={id} ratelimited'.format(id=request.user.id)
            send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, settings.RATELIMIT_ERROR_EMAILS,
                      fail_silently=True)
            mc.set(key, True, settings.RATELIMIT_EMAIL_SEND_TIMEOUT)
        return
