# coding: utf-8
import json

from django.conf import settings
from django.views.generic import View, CreateView, DeleteView, UpdateView, DetailView
from django.http import Http404, HttpResponse
from ratelimit.mixins import RatelimitMixin
from datetime import datetime
from django.utils.timezone import utc

from solr.related import cluster_articles, similar_articles

from tobaccowatcher_web.utils import update_articles_for_template
from tobaccowatcher_web.forms import BasePlotForm, CreateTrendForm, BaseTrendForm
from tobaccowatcher.models import Plot, Trend


class GetArticlesJSONView(RatelimitMixin, View):
    ratelimit_group = 'retrieve_data'
    ratelimit_key = 'user'
    ratelimit_block = True
    ratelimit_rate = settings.RATELIMIT_RATE

    def get(self, request, **kwargs):
        """
        request.GET['type']: 0 if additional articles,
                             1 if related articles
        """
        uuid = request.GET.get('uuid')
        try:
            skip, limit = int(request.GET.get('skip', 0)), int(request.GET.get('limit', 3))
            articles_type = int(request.GET.get('type', 0))
        except ValueError:
            return HttpResponse(json.dumps({'success': False, 'reason': 'Incorrect skip/limit/type values'}),
                                content_type='application/javascript')

        if not uuid:
            raise Http404

        if articles_type == 0:
            # additional articles
            articles = update_articles_for_template(cluster_articles(uuid)[skip:skip+limit])
        else:
            # related articles
            articles = update_articles_for_template(similar_articles(uuid, limit=limit, skip=skip))

        return HttpResponse(json.dumps({'success': True, 'articles': articles}),
                            content_type='application/javascript')


class TrendCreateView(CreateView):
    model = Trend
    form_class = CreateTrendForm
    http_method_names = ['post']

    def get_form(self, form_class):
        form = form_class(self.request, **self.get_form_kwargs())
        return form

    def form_valid(self, form):
        self.object = form.save()
        return HttpResponse(json.dumps({
                            'status': 'success',
                            'id': self.object.id,
                            'created_at': self.object.created_at.strftime("%Y%m%d%H%M%S"),
                            'title': self.object.title
                            }),
                            status=201,
                            content_type='application/javascript')

    def form_invalid(self, form):
        return HttpResponse(json.dumps({'status': 'fail', 'errors': form.errors}), status=400,
                            content_type='application/javascript')


class TrendDetailView(DetailView):
    model = Trend

    def get_queryset(self):
        queryset = super(TrendDetailView, self).get_queryset()
        return queryset.filter(user=self.request.user)

    def get(self, request, *args, **kwargs):
        obj = self.get_object()
        DATE_TIME_FORMAT = '%Y/%m/%d'
        return HttpResponse(json.dumps({
            'title': obj.title,
            'preview': obj.preview,
            'start_date': obj.start_date.strftime(DATE_TIME_FORMAT),
            'end_date': obj.end_date.strftime(DATE_TIME_FORMAT),
            'date_interval': obj.date_interval,
            'plots': [{
                'id': plot.id,
                'title': plot.title,
                'keywords': plot.keywords,
                'categories': plot.get_categories(),
                'locations': plot.get_locations(),
                'languages': plot.get_languages()
            } for plot in obj.plots.all()]
        }), content_type='application/javascript')


class TrendUpdateView(UpdateView):
    model = Trend
    form_class = BaseTrendForm
    http_method_names = ['post']

    def get_queryset(self):
        queryset = super(TrendUpdateView, self).get_queryset()
        return queryset.filter(user=self.request.user)

    def get_form(self, form_class):
        form = form_class(self.request, **self.get_form_kwargs())
        return form

    def form_valid(self, form):
        self.object = form.save()
        return HttpResponse(json.dumps({'status': 'success'}), content_type='application/javascript')

    def form_invalid(self, form):
        return HttpResponse(json.dumps({'status': 'fail', 'errors': form.errors}), status=400,
                            content_type='application/javascript')


class TrendDeleteView(DeleteView):
    model = Trend
    http_method_names = ['post', 'delete']

    def get_queryset(self):
        queryset = super(TrendDeleteView, self).get_queryset()
        return queryset.filter(user=self.request.user)

    def delete(self, request, *args, **kwargs):
        self.object = self.get_object()
        self.object.delete()
        return HttpResponse(json.dumps({'status': 'success'}), content_type='application/javascript')


class PlotCreateView(CreateView):
    model = Plot
    form_class = BasePlotForm
    http_method_names = ['post']

    def form_valid(self, form):
        self.object = form.save()
        return HttpResponse(json.dumps({'status': 'success', 'id': self.object.id}), status=201,
                            content_type='application/javascript')

    def form_invalid(self, form):
        return HttpResponse(json.dumps({'status': 'fail', 'errors': form.errors}), status=400,
                            content_type='application/javascript')


class PlotDetailView(DetailView):
    model = Plot

    def get_queryset(self):
        queryset = super(PlotDetailView, self).get_queryset()
        return queryset.filter(trend__user=self.request.user)

    def get(self, request, *args, **kwargs):
        obj = self.get_object()
        return HttpResponse(json.dumps({
            'title': obj.title,
            'keywords': obj.keywords,
            'categories': obj.get_categories(),
            'locations': obj.get_locations(),
            'languages': obj.get_languages(),
            'trend': obj.trend_id
        }), content_type='application/javascript')


class PlotUpdateView(UpdateView):
    model = Plot
    form_class = BasePlotForm
    http_method_names = ['post', 'put', 'patch']

    def get_queryset(self):
        queryset = super(PlotUpdateView, self).get_queryset()
        return queryset.filter(trend__user=self.request.user)

    def form_valid(self, form):
        self.object = form.save()
        return HttpResponse(json.dumps({'status': 'success'}), content_type='application/javascript')

    def form_invalid(self, form):
        return HttpResponse(json.dumps({'status': 'fail', 'errors': form.errors}), status=400,
                            content_type='application/javascript')


class PlotDeleteView(DeleteView):
    model = Plot
    http_method_names = ['post', 'delete']

    def get_queryset(self):
        queryset = super(PlotDeleteView, self).get_queryset()
        return queryset.filter(trend__user=self.request.user)

    def delete(self, request, *args, **kwargs):
        self.object = self.get_object()
        self.object.delete()
        return HttpResponse(json.dumps({'status': 'success'}), content_type='application/javascript')
