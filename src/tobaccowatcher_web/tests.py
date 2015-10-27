import json
import datetime

from model_mommy import mommy
from django.test import TestCase
from django.core.urlresolvers import reverse

from .solr.solr_query import Query
from tobaccowatcher.models import User, Plot, Trend


class SimpleTest(TestCase):
    def assert_query(self, query_string, **kwargs):
        query = Query()
        for attr, value in kwargs.iteritems():
            setattr(query, attr, value)
        self.assertEqual(query.query_string(),
                         query_string + ' AND -is_child:true')

    def test_verbatim_text(self):
        self.assert_query(
            'text:("lorem ipsum" AND dolor sit amet)',
            keywords=['"lorem ipsum" AND dolor sit amet'])

    def test_or_between_regions(self):
        self.assert_query(
            'text:(lorem ipsum) AND regions:("alpha" OR "beta")',
            keywords=['lorem ipsum'], regions=['alpha', 'beta'])

    def test_or_between_countries(self):
        self.assert_query(
            'text:(lorem ipsum) AND countries:("alpha" OR "beta")',
            keywords=['lorem ipsum'], countries=['alpha', 'beta'])

    def test_or_between_continents(self):
        self.assert_query(
            'text:(lorem ipsum) AND continents:("alpha" OR "beta")',
            keywords=['lorem ipsum'], continents=['alpha', 'beta'])

    def test_or_between_languages(self):
        self.assert_query(
            'text:(lorem ipsum) AND language:("alpha" OR "beta")',
            keywords=['lorem ipsum'], languages=['alpha', 'beta'])


class AjaxTextCase(TestCase):
    def get_user(self):
        return User.objects.create_user(email='test@tw.org', password='test')

    def login(self):
        self.user = self.get_user()
        self.client.login(email=self.user.email, password='test')

    def test_trend_create(self):
        base_url = reverse('ajax_trend_create')
        self.login()
        response = self.client.get(base_url)
        self.assertEqual(response.status_code, 405)

        response = self.client.post(base_url)
        self.assertEqual(response.status_code, 400)

        data = {
            'preview': 'preview'
        }
        response = self.client.post(base_url, data)
        self.assertEqual(response.status_code, 400)
        self.assertTrue('start_date' in json.loads(response.content)['errors'])
        self.assertTrue('end_date' in json.loads(response.content)['errors'])

        today = datetime.date.today()
        data['start_date'] = today  # '%Y-%m-%d'
        data['end_date'] = today + datetime.timedelta(days=3)  # '%Y-%m-%d'
        response = self.client.post(base_url, data)
        self.assertEqual(response.status_code, 201)

        data = {
            'date_interval': 'Last 3 months'
        }
        response = self.client.post(base_url, data)
        self.assertEqual(response.status_code, 201)

    def test_trend_update(self):
        self.login()
        second_user = User.objects.create_user(email='test2@tw.org', password='123')
        today = datetime.date.today()
        trend = mommy.make(Trend, user=second_user, start_date=today, end_date=today)
        base_url = reverse('ajax_trend_update', args=[trend.id])
        data = {
            'title': 'title'
        }
        response = self.client.post(base_url, data)
        self.assertEqual(response.status_code, 404)

        trend.user = self.user
        trend.save()
        response = self.client.post(base_url, data)
        self.assertEqual(response.status_code, 400)
        self.assertTrue('start_date' in json.loads(response.content)['errors'])
        self.assertTrue('end_date' in json.loads(response.content)['errors'])

        data['start_date'] = trend.start_date  # '%Y-%m-%d'
        data['end_date'] = trend.end_date  # '%Y-%m-%d'
        response = self.client.post(base_url, data)
        self.assertEqual(response.status_code, 200)

        updated_trend = Trend.objects.get(id=trend.id)
        self.assertEqual(updated_trend.title, 'title')
        self.assertEqual(updated_trend.preview, '')

        data = {
            'date_interval': 'Last month'
        }
        response = self.client.post(base_url, data)
        self.assertEqual(response.status_code, 200)

    def test_trend_delete(self):
        self.login()
        second_user = User.objects.create_user(email='test2@tw.org', password='123')
        trend = mommy.make(Trend, user=second_user)

        base_url = reverse('ajax_trend_delete', args=[trend.id])
        response = self.client.get(base_url)
        self.assertEqual(response.status_code, 405)

        response = self.client.post(base_url)
        self.assertEqual(response.status_code, 404)

        trend.user = self.user
        trend.save()
        response = self.client.post(base_url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(Trend.objects.all().count(), 0)

    def test_plot_create(self):
        base_url = reverse('ajax_plot_create')
        self.login()
        response = self.client.get(base_url)
        self.assertEqual(response.status_code, 405)

        response = self.client.post(base_url)
        self.assertEqual(response.status_code, 400)

        data = {
            'keywords': 'some keywords',
            'languages': 'en,ru',
            'locations': 'usa,canada,unknown country',
            'categories': 'prevalence'
        }
        response = self.client.post(base_url, data)
        self.assertEqual(response.status_code, 400)
        self.assertTrue('locations' in json.loads(response.content)['errors'])
        self.assertTrue('trend' in json.loads(response.content)['errors'])

        data['locations'] = ''
        trend = mommy.make(Trend, user=self.user)
        data['trend'] = trend.id
        response = self.client.post(base_url, data)
        self.assertEqual(response.status_code, 201)

    def test_plot_update(self):
        self.login()
        second_user = User.objects.create_user(email='test2@tw.org', password='123')
        trend = mommy.make(Trend, user=second_user)
        plot = Plot.objects.create(trend=trend, categories='prevalence')
        base_url = reverse('ajax_plot_update', args=[plot.id])
        data = {
            'keywords': 'some keywords',
            'languages': 'en,ru',
            'locations': 'usa,canada,unknown country',
            'categories': 'prevalence',
            'trend': plot.trend_id
        }
        response = self.client.post(base_url, data)
        self.assertEqual(response.status_code, 404)

        trend.user = self.user
        trend.save()
        response = self.client.post(base_url, data)
        self.assertEqual(response.status_code, 400)
        self.assertTrue('locations' in json.loads(response.content)['errors'])

        data['locations'] = 'usa,canada,russia'
        response = self.client.post(base_url, data)
        self.assertEqual(response.status_code, 200)

        updated = Plot.objects.get(id=plot.id)
        self.assertEqual(updated.languages, 'en,ru')
        self.assertEqual(updated.locations, 'usa,canada,russia')
        self.assertEqual(updated.keywords, 'some keywords')

    def test_plot_delete(self):
        self.login()
        second_user = User.objects.create_user(email='test2@tw.org', password='123')
        trend = mommy.make(Trend, user=second_user)
        plot = Plot.objects.create(trend=trend)

        base_url = reverse('ajax_plot_delete', args=[plot.id])
        response = self.client.get(base_url)
        self.assertEqual(response.status_code, 405)

        response = self.client.post(base_url)
        self.assertEqual(response.status_code, 404)

        trend.user = self.user
        trend.save()
        response = self.client.post(base_url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(Plot.objects.all().count(), 0)
