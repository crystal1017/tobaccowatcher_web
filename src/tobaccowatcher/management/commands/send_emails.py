# -*- coding: utf-8 -*-

import json
import datetime
import logging
import monthdelta

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.core.management.base import BaseCommand, CommandError
from django.utils.html import strip_tags
from django.template.loader import get_template
from django.template import Context

from tobaccowatcher.models import Alert, UserAlert
from tobaccowatcher_web.utils import get_filtered_news, sanitize_search_params
from tobaccowatcher_web.constants import languages_map


logger = logging.getLogger(__name__)


class Command(BaseCommand):
    args = '<(daily|weekly|monthly|every_2_weeks)>'

    def handle(self, *args, **options):
        if len(args) == 0:
            raise CommandError('Unknown frequency value for sending digests')

        frequency = args[0]

        a = Alert.objects.get_or_create(pk=1, defaults={'how_many': 20})[0]

        if not a.is_active:
            logger.warning(u'[Alerts Cron] Cron triggered, but is is currently disabled. Nothing was sent.')
            return False

        limit = a.how_many
        body = a.body

        start = datetime.datetime.now()
        end = datetime.datetime.now()

        if frequency == 'daily':
            start = start - datetime.timedelta(1)

        elif frequency == 'weekly':
            start = start - datetime.timedelta(7)

        elif frequency == 'monthly':
            start = start - monthdelta.monthdelta(1)

        elif frequency == 'every_2_weeks':
            start = start - datetime.timedelta(14)

        else:
            raise CommandError('Unknown value %s' % frequency)

        start = int(start.strftime('%s'))
        end = int(end.strftime('%s'))

        alerts = UserAlert.objects.filter(frequency=frequency, is_paused=False).all()

        if not alerts:
            logger.info(u'[Alerts Cron] There are no alerts to send')

        # clean template stored in /emails/alerts.html
        # after all changes you need to regenerate alerts.html to alerts_inline.html via http://inliner.cm/
        html_template = get_template('emails/alerts_inline.html')

        for alert in alerts:
            try:
                search_for = sanitize_search_params(json.loads(alert.data))

                search_for['start'] = start
                search_for['end'] = end

                # count will be the total of possible results
                # i.e. it is possible for count > len(articles)
                articles, count = get_filtered_news(search_for, limit)
                if count == 0:
                    continue

                languages = []
                for language in search_for['languages']:
                    languages.append(languages_map.get(language))
                search_for['languages'] = languages

                subject = 'TobaccoWatcher Alert: {}'.format(alert.name)
                text = body + '\n\n'
                context = Context({
                    'alert': alert,
                    'SITE_URL': 'http://' + settings.HOSTNAME,
                    'base_body': a.body,
                    'articles': articles,
                    'total_articles': count,
                    'search_for': search_for
                })
                html_content = html_template.render(context)
                for article in articles:
                    text = '%s-------\n\n%s\n\n%s\n\nSource: %s\n\n' % (text,
                                                                strip_tags(article['title']),
                                                                strip_tags(article['cleaned_content']),
                                                                article['url'])
                msg = EmailMultiAlternatives(subject, text, settings.DEFAULT_FROM_EMAIL, [alert.user.email])
                msg.attach_alternative(html_content, "text/html")
                msg.send()

            except Exception as e:
                print e
                logger.error(u'[Alerts Cron] Email could not be sent: {}'.format(e))
