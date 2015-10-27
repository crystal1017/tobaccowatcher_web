# -*- coding: utf-8 -*-
import json
import csv
import logging
import cStringIO
import datetime

from math import floor
from django.core.urlresolvers import reverse, reverse_lazy
from django.core.mail import send_mail
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.contrib import messages
from django.conf import settings
from django.contrib.auth import authenticate, login, logout
from django.http import HttpResponse, HttpResponseRedirect, Http404
from django.shortcuts import render_to_response
from django.template import RequestContext
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import TemplateView, RedirectView, CreateView
from django.views.generic.base import View
from django.utils.translation import ugettext_lazy as _
from django.utils import timezone
from ratelimit.mixins import RatelimitMixin

from solr.related import cluster_articles, similar_articles
from solr.utils import get_data_statistics

from .utils import extract_search_params, sanitize_search_params, get_single_article, \
    get_filtered_news, update_articles_for_template, extract_search_params_from_json, \
    build_search_url, get_counts, get_memcached, get_solr, get_solr_meta, solr_mongo_searcher
from .constants import *
from .forms import ProfileForm, UserAlertForm, UserForm
from tobaccowatcher.models import User, Feedback, UserAlert, Plot, Trend


logger = logging.getLogger(__name__)
SHARE_DESC = _("The world's first digital surveillance system dedicated to informing and enhancing global tobacco control.")


def prepare_ctx_for_filter(search_for, ctx):
    regions = [
        {
            'id': r['id'],
            'name': r['name'],
            'is_active': r['id'] in search_for['region_ids'],
            'countries': [
                {
                    'id': c['id'],
                    'name': c['name'],
                    'is_active': c['id'] in search_for['country_ids']
                } for c in r.get('countries', [])
            ]
        } for r in regions_tree
    ]

    ctx['terms'] = search_for['terms']
    ctx['categories'] = [{'id': c['id'], 'name': c['name'], 'class': c['class'], 'description': c['desc'],
                          'short': c['short'], 'is_active': c['id'] in search_for['category_ids']}
                         for c in CATEGORIES]
    ctx['regions'] = regions
    ctx['languages'] = [{'id': l['id'], 'name': l['name'], 'is_active': l['id'] in search_for['language_ids']} for l in LANGUAGES]
    ctx['start'] = search_for['start_text']
    ctx['end'] = search_for['end_text']
    ctx['is_importance'] = True if search_for.get('importance') else False


class HomePageView(TemplateView):
    template_name = 'main.html'

    def get_context_data(self, **kwargs):
        context = super(HomePageView, self).get_context_data(**kwargs)

        params = extract_search_params(self.request.GET)
        params['end'] = datetime.datetime.utcnow().strftime('%m/%d/%Y')
        params['importance'] = settings.POPULAR_IMPORTANCE

        # "tmp" vars are currently unused in the return, so they are being handled in a weird way like this.
        # TODO: Add a parameter or new method to handle getting only the number of results found
        search_for = sanitize_search_params(params)
        res, tmp = get_filtered_news(search_for, 3, 0)
        tmp, total_count = get_filtered_news(
            sanitize_search_params(extract_search_params(self.request.GET)), 1)

        data_stats = get_data_statistics(get_solr_meta(), get_memcached())
        data_stats['unique_sources'] = floor(data_stats.get('unique_sources',0)/1000.0) * 1000

        context.update({
            'articles': res,
            'total_count': total_count,
            'data_stats': data_stats
        })
        return context


class ArticlesTemplateView(TemplateView):
    template_name = 'articles.html'

    def get_context_data(self, **kwargs):
        ctx = super(ArticlesTemplateView, self).get_context_data(**kwargs)
        ctx['page_title'] = 'Articles'
        ctx['trending'] = []
        search_for = sanitize_search_params(extract_search_params(self.request.GET))

        prepare_ctx_for_filter(search_for, ctx)

        ctx['SHARE_DESC'] = SHARE_DESC
        ctx['menu_active_elem'] = 'dashboard'

        return ctx


class ArticleDetailView(TemplateView):
    template_name = 'article_detail.html'

    def get_context_data(self, **kwargs):
        context = super(ArticleDetailView, self).get_context_data(**kwargs)
        uuid = kwargs.get('uuid')
        article = get_single_article(uuid)
        if not article:
            raise Http404

        additional_articles = update_articles_for_template(
            cluster_articles(solr_mongo_searcher(), uuid))
        related_articles = update_articles_for_template(
            similar_articles(get_solr(), uuid, limit=10))
        context.update({
            'article': article,
            'article_json': json.dumps(article),
            'additional_articles': additional_articles,
            'related_articles': related_articles
        })
        return context


class NewsFeed(View):
    http_method_names = ['post']

    @csrf_exempt
    def dispatch(self, *args, **kwargs):
        return super(NewsFeed, self).dispatch(*args, **kwargs)

    def post(self, request, *args, **kwargs):
        search_for = sanitize_search_params(extract_search_params(self.request.POST))
        articles = get_filtered_news(search_for, 10, 0)
        return HttpResponse(json.dumps(articles), mimetype='application/json')


class FeedbackView(View):
    http_method_names = ['post']

    @csrf_exempt
    def dispatch(self, *args, **kwargs):
        return super(FeedbackView, self).dispatch(*args, **kwargs)

    def post(self, request, *args, **kwargs):
        _user = request.user
        _uuid = request.POST.get('uuid')

        if _uuid and _user:
            if request.POST.get('notrelated', '') == 'true':
                feedback = Feedback()
                feedback.uuid = _uuid
                feedback.user = _user
                feedback.feedback_type = 'related'
                feedback.data = 'Not tobacco related'
                feedback.save()

            if request.POST.get('category', '') != '':
                feedback = Feedback()
                feedback.uuid = _uuid
                feedback.user = _user
                feedback.feedback_type = 'category'
                feedback.data = request.POST.get('category', '')
                feedback.save()

            if request.POST.get('language', '') != '':
                feedback = Feedback()
                feedback.uuid = _uuid
                feedback.user = _user
                feedback.feedback_type = 'language'
                feedback.data = request.POST.get('language', '')
                feedback.save()

            if request.POST.get('country', '') != '':
                feedback = Feedback()
                feedback.uuid = _uuid
                feedback.user = _user
                feedback.feedback_type = 'country'
                feedback.data = request.POST.get('country', '')
                feedback.save()

            if request.POST.get('region', '') != '':
                feedback = Feedback()
                feedback.uuid = _uuid
                feedback.user = _user
                feedback.feedback_type = 'region'
                feedback.data = request.POST.get('region', '')
                feedback.save()

            if request.POST.get('more', '') != '':
                feedback = Feedback()
                feedback.uuid = _uuid
                feedback.user = _user
                feedback.feedback_type = 'note'
                feedback.data = request.POST.get('more', '')
                feedback.save()

        return HttpResponse('{msg: "ok"}', mimetype='application/json')


class FeedbackDataView(View):
    http_method_names = ['get']

    @csrf_exempt
    def dispatch(self, *args, **kwargs):
        return super(FeedbackDataView, self).dispatch(*args, **kwargs)

    def get(self, request, *args, **kwargs):
        data = {
            'categories': [[c['id'], c['short']] for c in CATEGORIES],
            'languages': languages_map.items(),
            'countries': feedback_countries,
            'regions': regions_map.items()
        }
        return HttpResponse(json.dumps(data), mimetype='application/json')


class FilterView(RatelimitMixin, View):
    http_method_names = ['get', 'options']
    ratelimit_group = 'retrieve_data'
    ratelimit_key = 'user'
    ratelimit_block = True
    ratelimit_rate = settings.RATELIMIT_RATE

    @csrf_exempt
    def dispatch(self, *args, **kwargs):
        return super(FilterView, self).dispatch(*args, **kwargs)

    def get(self, request, *args, **kwargs):
        search_for = sanitize_search_params(extract_search_params(self.request.GET))
        res, num_results = get_filtered_news(search_for, 10, 0)
        result = {'data': res, 'num_results': num_results}
        response = HttpResponse(json.dumps(result), mimetype='application/json')
        response['Access-Control-Allow-Origin'] = '*'

        return response

    def options(self, request, *args, **kwargs):
        response = HttpResponse('')
        response['Access-Control-Allow-Origin'] = '*'
        response['Access-Control-Allow-Methods'] = ['POST','GET','OPTIONS', 'PUT', 'DELETE']
        response['Access-Control-Allow-Headers'] = '*'  # "X-Requested-With"
        response['Access-Control-Max-Age'] = '1800'

        return response


class AboutView(TemplateView):
    template_name = 'about.html'

    def get_context_data(self, **kwargs):
        context = super(AboutView, self).get_context_data(**kwargs)

        context['page_title'] = 'About'
        context['SHARE_DESC'] = SHARE_DESC
        context['menu_active_elem'] = 'about'

        return context


class AlertsListView(TemplateView):
    template_name = 'alerts_list.html'
    form_class = UserAlertForm

    @csrf_exempt
    def dispatch(self, *args, **kwargs):
    	self.alert_id = kwargs.get('alert_id', None)
        self.alert = None

        if self.alert_id:
            try:
                self.alert = UserAlert.objects.filter(pk=self.alert_id)[0]
            except:
                pass

        return super(AlertsListView, self).dispatch(*args, **kwargs)

    def get(self, request, *args, **kwargs):
        # context = {
        #     'form': self.form_class(instance=self.alert),
        #     'menu_active_elem': 'alerts',
        #     'alert': self.alert
        # }

        context = self.get_context_data(**kwargs)

        if self.alert:
            search_for = json.loads(self.alert.data)
        else:
            search_for = sanitize_search_params(extract_search_params(self.request.GET))
        print search_for
        prepare_ctx_for_filter(search_for, context)

        return render_to_response(self.template_name, context,
                                  context_instance=RequestContext(request))


    def get_context_data(self, **kwargs):
        ctx = super(AlertsListView, self).get_context_data(**kwargs)
        ctx['page_title'] = 'Alerts'
        alerts = UserAlert.objects.filter(user=self.request.user).order_by('pk').all()
        alert_data = []
        for alert in alerts:
            alert_languages = []
            language_data = json.loads(alert.data)['languages']
            for language in language_data:
                alert_languages.append(languages_map.get(language))

            alert_data.append((alert, json.loads(alert.data), alert_languages))

        ctx['alerts'] = alert_data
        ctx['menu_active_elem'] = 'alerts'

        return ctx
        


class AlertsEditView(View):
    http_method_names = ['get', 'put', 'post', 'delete', 'options']
    template_name = 'alerts_edit.html'
    form_class = UserAlertForm

    @csrf_exempt
    def dispatch(self, *args, **kwargs):
        self.alert_id = kwargs.get('alert_id', None)
        self.alert = None

        if self.alert_id:
            try:
                self.alert = UserAlert.objects.filter(pk=self.alert_id)[0]
            except:
                pass

        return super(AlertsEditView, self).dispatch(*args, **kwargs)

    def get(self, request, *args, **kwargs):
        context = {
            'form': self.form_class(instance=self.alert),
            'menu_active_elem': 'alerts',
            'alert': self.alert
        }

        if self.alert:
            search_for = json.loads(self.alert.data)
        else:
            search_for = sanitize_search_params(extract_search_params(self.request.GET))

        prepare_ctx_for_filter(search_for, context)

        return render_to_response(self.template_name, context,
                                  context_instance=RequestContext(request))

    def put(self, request, *args, **kwargs):
        if self.alert and 'is_paused' in request.POST:
            if self.alert.user == request.user:
                self.alert.is_paused = self._get_is_paused()

        elif self.alert:
            search_for = sanitize_search_params(extract_search_params(self.request.POST))

            if self.alert.user != request.user:
                self.alert.pk = None
                self.alert.user = request.user
                self.alert.save()

            form = self.form_class(data=self.request.POST)
            if not form.is_valid():
                return HttpResponse(json.dumps({'success': False}), content_type='application/javascript')
            self.alert.data = json.dumps(search_for)
            self.alert.name = form.cleaned_data['name']
            self.alert.url = build_search_url(search_for)
            self.alert.frequency = self._get_frequency()
            self.alert = self._emails(self.alert)

        if self.alert:
            self.alert.save()

        return HttpResponse(json.dumps({'success': True}), content_type='application/javascript')

    def post(self, request, *args, **kwargs):
        if self.request.POST.get('_method', '') == 'put':
            return self.put(request, *args, **kwargs)

        if self.request.POST.get('_method', '') == 'delete':
            return self.delete(request, *args, **kwargs)

        form = self.form_class(data=self.request.POST)
        if not form.is_valid():
            return HttpResponse(json.dumps({'success': False}), content_type='application/javascript')
        search_for = sanitize_search_params(extract_search_params(self.request.POST))

        alert = UserAlert()
        alert.user = request.user
        alert.data = json.dumps(search_for)
        alert.name = form.cleaned_data['name']
        alert.url = build_search_url(search_for)
        alert.frequency = self._get_frequency()
        alert.is_paused = False
        alert.save()

        alert = self._emails(alert)
        alert.save()

        return HttpResponse(json.dumps({'success': True}), content_type='application/javascript')

    def delete(self, request, *args, **kwargs):
        if self.alert:
            if self.alert.user == request.user:
                self.alert.delete()
            else:
                self.alert.shared.remove(request.user)

        return HttpResponseRedirect(reverse('alerts_list'))

    def options(self, request, *args, **kwargs):
        response = HttpResponse('')
        response['Access-Control-Allow-Origin'] = '*'
        response['Access-Control-Allow-Methods'] = ['POST','GET','OPTIONS', 'PUT', 'DELETE']
        response['Access-Control-Allow-Headers'] = '*'  # "X-Requested-With"
        response['Access-Control-Max-Age'] = '1800'

        return response

    def _emails(self, alert):
        """
        extract emails from request.POST, create users for new emails and send mail in two cases:
            1. for alert creator if some emails not in database
            2. for existing users only when user linking for alert first time
        """
        emails = self.request.POST.get('share', '').split(';')
        emails = [email.strip() for email in emails]
        emails = [e for e in emails if self._validate_email(e) and e != self.request.user.email]

        users = User.objects.filter(email__in=emails)
        shared_users = alert.shared.all()
        # subject and message for existing users in system
        subject = 'Subscribing for alert'
        message = 'You are subscribed for new alert <link here>'
        for user in users:
            # send mail only for new users
            if user not in shared_users:
                alert.shared.add(user)
                send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email], fail_silently=True)
            emails.remove(user.email)

        # on this step in 'emails' only emails without users, let's create users!
        # Note: new users creation was added before adding of email sending
        if emails:
            for email in emails:
                user = User()
                user.email = email
                user.is_invited = True
                user.save()
                alert.shared.add(user)

            # send mail for creator about new users
            subject = 'Alert for new users'
            message = 'Some emails was not on our service, here is the list of emails: %s.' % \
                      (''.join(emails))
            send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [alert.user.email], fail_silently=True)

        return alert

    def _validate_email(self, email):
        try:
            validate_email(email)
            return True

        except ValidationError:
            return False

    def _get_is_paused(self):
        return self.request.POST.get('is_paused', False) == 'true'

    def _get_frequency(self):
        if self.request.POST.get('frequency', '') in ['daily', 'weekly', 'monthly', 'every_2_weeks']:
            return self.request.POST['frequency']
        else:
            return 'daily'


class AlertsPauseView(View):
    http_method_names = ['get']

    def get(self, request, *args, **kwargs):
        try:
            alert = UserAlert.objects.get(pk=int(kwargs.get('alert_id')), user=request.user)
            alert.is_paused = True
            alert.save()
            messages.info(request, 'Your alert: {}, was paused'.format(alert.name))
        except UserAlert.DoesNotExist:
            raise Http404()

        return HttpResponseRedirect(reverse_lazy('alerts_list'))


class TrendsView(RatelimitMixin, View):
    http_method_names = ['get', 'post', 'options']
    template_name = 'trends2.html'

    ratelimit_group = 'retrieve_data'
    ratelimit_key = 'user'
    ratelimit_block = True
    ratelimit_rate = settings.RATELIMIT_RATE

    @csrf_exempt
    def dispatch(self, *args, **kwargs):
        return super(TrendsView, self).dispatch(*args, **kwargs)

    def get(self, request, *args, **kwargs):
        ctx = {}
        ctx['page_title'] = 'Trends'
        ctx['menu_active_elem'] = 'trends'
        ctx['categories'] = [{'id': c['id'], 'name': c['name']} for c in CATEGORIES]
        ctx['regions'] = regions_tree
        ctx['languages'] = [{'id': l['id'], 'name': l['name']} for l in LANGUAGES]
        ctx['trends'] = Trend.objects.filter(user=request.user).order_by('id')
        ctx['recommended'] = Trend.objects.filter(user__is_admin=True).order_by('id')[:3]
        return render_to_response(self.template_name,
                                  ctx,
                                  context_instance=RequestContext(request))

    def post(self, request, *args, **kwargs):
        search_for = sanitize_search_params(extract_search_params(self.request.POST))
        counts = get_counts(search_for, request.POST.get('round', 'month'))
        response = cStringIO.StringIO()
        w = csv.DictWriter(response, ['date', 'count'])
        w.writeheader()
        w.writerows(counts)

        return HttpResponse(response.getvalue(),  mimetype='text/csv')

    def options(self, request, *args, **kwargs):
        response = HttpResponse('')
        response['Access-Control-Allow-Origin'] = '*'
        response['Access-Control-Allow-Methods'] = ['POST', 'GET', 'OPTIONS']
        response['Access-Control-Allow-Headers'] = '*'  # "X-Requested-With"
        response['Access-Control-Max-Age'] = '1800'

        return response


class TrendsCSVView(View):
    """
        Return csv with information of all plots from request, waits list of data in next format:
        [{"c": "smoke-free", "r": ["africa", "central_asia", "west_asia"], "round": "month"}, ...]
    """

    def get(self, request):
        plots = request.GET.get('plots')
        start = request.GET.get('st', '')
        end = request.GET.get('e', '')
        try:
            start = datetime.datetime.strptime(start, '%Y-%m-%d').date()
            end = datetime.datetime.strptime(end, '%Y-%m-%d').date()
        except:
            start, end = None, None

        try:
            plots = json.loads(plots)
        except (ValueError, TypeError):
            return HttpResponse('Incorrect json', status=400)

        if not plots:
            return HttpResponse('Blank request list', status=400)

        for plot in plots:
            if not type(plot) == dict:
                return HttpResponse('List should contains only dictionaries', status=400)

        result = {}
        DATE_TIME_FORMAT = '%m/%d/%Y'
        headers = ''
        titles = []
        for i, plot in enumerate(plots):
            search_for = sanitize_search_params(extract_search_params_from_json(plot))
            counts = get_counts(search_for, 'week')
            if i == 0:
                for count in counts:
                    d = datetime.datetime.strptime(count['date'], DATE_TIME_FORMAT).date()
                    result[d] = [count['count']]
            else:
                for count in counts:
                    d = datetime.datetime.strptime(count['date'], DATE_TIME_FORMAT).date()
                    result[d].append(count['count'])

            # parse request params for get headers for csv
            column = []
            if search_for.get('words'):
                column.append('Search: {0}'.format(', '.join(search_for['words'])))
            if search_for['categories']:
                column.append('Categories: {0}'.format(', '.join(search_for['categories'])))
            if search_for['regions']:
                column.append('Regions: {0}'.format(', '.join(search_for['regions'])))
            if search_for['languages']:
                column.append('Languages: {0}'.format(', '.join(search_for['languages'])))
            title = plot.get('title') if plot.get('title') else 'Unnamed Plot'
            titles.append(title)
            headers = headers + title + ';' + ', '.join(column) + '\r\n'

        # build csv by hands
        updated = [{'date': date, 'counts': count} for date, count in result.iteritems()]
        sorted_result = sorted(updated, key=lambda d: d['date'])

        # but firstly - push non-existed dates to list
        dates_dict = {}
        for d in updated:
            dates_dict[d['date']] = d['counts']

        start_date = start if start else sorted_result[0]['date']
        end_date = end if end else sorted_result[-1]['date']

        # find real start, because user can enter random date
        for i in range(6):
            if start_date in dates_dict:
                break
            start_date += datetime.timedelta(days=1)

        csv = headers + 'Date: from {0} to {1};'.format(start_date.strftime(DATE_TIME_FORMAT),
                                                        end_date.strftime(DATE_TIME_FORMAT)) + ';'.join(titles) + '\r\n'
        if not updated:
            return self.get_response(csv)

        full_list_of_dates = []
        delta = datetime.timedelta(days=7)
        while start_date < end_date:
            full_list_of_dates.append(start_date)
            start_date += delta

        final_list = []
        for date_obj in full_list_of_dates:
            if date_obj in dates_dict:
                final_list.append({'date': date_obj, 'counts': dates_dict[date_obj]})
            else:
                final_list.append({'date': date_obj, 'counts': ['' for i in range(len(plots))]})

        for d in final_list:
            csv += d['date'].strftime(DATE_TIME_FORMAT) + ';'
            values = []
            for value in d['counts']:
                values.append(str(round(value)) if value else str(value))
            csv += ';'.join(values) + '\r\n'
        return self.get_response(csv)

    def get_response(self, data):
        response = HttpResponse(data, content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename=analyse.csv'
        return response


class ProfileView(View):
    template_name = 'profile.html'

    def get(self, request):
        ctx = {}
        ctx['form'] = ProfileForm(instance=request.user)
        ctx['menu_active_elem'] = 'account'
        ctx['page_title'] = 'Account'

        return render_to_response(self.template_name,
                                  ctx,
                                  context_instance=RequestContext(request))

    def post(self, request):
        form = ProfileForm(request.POST, request.FILES, instance=request.user)

        if form.is_valid():
            form.save()

            password = request.POST.get('new_password')

            if password:
                request.user.set_password(password)
                request.user.save()

            messages.success(request, 'Profile details updated.')

        else:
            messages.error(request, form.errors)

        ctx = {
            'form': form,
            'menu_active_elem': 'account'
        }

        return render_to_response(self.template_name,
                                  ctx,
                                  context_instance=RequestContext(request))


class LoginView(View):
    template_name = 'login.html'

    def get(self, request):
        return render_to_response(self.template_name,
                                  context_instance=RequestContext(request))

    def post(self, request):
        logout(request)

        if request.POST:
            username = request.POST.get('username', '').lstrip().rstrip()
            password = request.POST.get('password')

            user = authenticate(username=username, password=password)

            if user is not None:
                if user.is_active:
                    login(request, user)
                    if 'next=' in request.META.get('HTTP_REFERER'):
                        next_url = request.META.get('HTTP_REFERER').split('next=')[-1]
                        return HttpResponseRedirect(next_url)
                    else:
                        return HttpResponseRedirect(reverse('index'))

        return render_to_response('login.html',
                                  context_instance=RequestContext(request))


class LogoutView(View):
    def get(self, request):
        logout(request)
        return HttpResponseRedirect('/')


class UserCreateView(CreateView):
    model = User
    template_name = 'registration/registration_form.html'
    form_class = UserForm
    success_url = reverse_lazy('index')

    def get_form_kwargs(self):
        kwargs = super(UserCreateView, self).get_form_kwargs()
        kwargs['instance'] = User(is_active=False)
        return kwargs

    def form_invalid(self, form):
        return HttpResponse(json.dumps({'success': False, 'errors': form.errors}),
                            content_type='application/javascript')

    def form_valid(self, form):
        self.object = form.save()
        subject = 'New user created'
        message = 'User "{first_name} {last_name}" with email "{email}" and affiliation "{affiliation}" ' \
                  'was created at {now}'.format(first_name=self.object.first_name,
                                                last_name=self.object.last_name,
                                                email=self.object.email,
                                                affiliation=self.object.affiliation,
                                                now=timezone.now())
        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, settings.USER_CREATED_EMAILS, fail_silently=True)
        return HttpResponse(json.dumps({'success': True, 'url': '{}'.format(self.success_url)}),
                            content_type='application/javascript')


class RegistrationCompleteView(TemplateView):
    template_name = 'registration/registration_complete.html'


class LogArticleOpened(View):
    def get(self, request):
        return HttpResponse('OK')


class GoToRedirectView(RedirectView):
    permanent = False

    def get_redirect_url(self, **kwargs):
        url = self.request.GET.get('url', '')
        return url
