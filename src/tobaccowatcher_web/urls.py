# -*- coding: utf-8 -*-
from django.conf import settings
from django.conf.urls import patterns, include, url
# from rest_framework import routers

from tobaccowatcher_web import views, ajax, api
from tobaccowatcher_web.decorators import login_required
from tobaccowatcher_admin.urls import urlpatterns as admin_urlpatterns


urlpatterns = patterns(
    'tobaccowatcher_web.views',
    url(r'^$', login_required(views.HomePageView.as_view()), name='index'),
    url(r'^articles/$', login_required(views.ArticlesTemplateView.as_view()), name='articles'),
    url(r'^articles/(?P<uuid>\S+)/$', login_required(views.ArticleDetailView.as_view()), name='article_detail'),
    url(r'^filter/$', login_required(views.FilterView.as_view()), name='filter'),
    url(r'^feedback/$', login_required(views.FeedbackView.as_view()), name='feedback'),
    url(r'^feedback-data/$', login_required(views.FeedbackDataView.as_view()), name='feedback-data'),
    url(r'^newsfeed/$', login_required(views.NewsFeed.as_view()), name='newsfeed'),
    url(r'^about/$', login_required(views.AboutView.as_view()), name='about'),
    url(r'^account/$', login_required(views.ProfileView.as_view()), name='profile'),
    url(r'^alerts/$', login_required(views.AlertsListView.as_view()), name='alerts_list'),
    url(r'^alert/$', login_required(views.AlertsEditView.as_view()), name='alerts_edit'),
    url(r'^alert/(?P<alert_id>\d+)/$', login_required(views.AlertsEditView.as_view()), name='alerts_edit'),
    url(r'^alert/(?P<alert_id>\d+)/pause$', login_required(views.AlertsPauseView.as_view()), name='alerts_pause'),
    url(r'^analyses/$', login_required(views.TrendsView.as_view()), name='trends'),
    url(r'^analyses/csv/$', login_required(views.TrendsCSVView.as_view()), name='trends_csv'),
    url(r'^login/$', views.LoginView.as_view(), name='login'),
    url(r'^logout/$', views.LogoutView.as_view(), name='logout'),
    url(r'^accounts/register/$', views.UserCreateView.as_view(), name='registration'),
    url(r'^accounts/register/complete/$', views.RegistrationCompleteView.as_view(), name='registration_complete'),

    url(r'^logger/article_opened/$', views.LogArticleOpened.as_view(), name='log_article_opened'),
    url(r'^ext$', views.GoToRedirectView.as_view(), name='goto'),
    # unused?
    # url(r'^accounts/', include('registration.backends.default.urls')),

    url(r'^ajax/load_articles/$', ajax.GetArticlesJSONView.as_view(), name='ajax_load_articles'),
    url(r'^ajax/plot/create/$', login_required(ajax.PlotCreateView.as_view()), name='ajax_plot_create'),
    url(r'^ajax/plot/(?P<pk>\d+)/$', login_required(ajax.PlotDetailView.as_view()), name='ajax_plot_detail'),
    url(r'^ajax/plot/(?P<pk>\d+)/update/$', login_required(ajax.PlotUpdateView.as_view()), name='ajax_plot_update'),
    url(r'^ajax/plot/(?P<pk>\d+)/delete/$', login_required(ajax.PlotDeleteView.as_view()), name='ajax_plot_delete'),
    url(r'^ajax/trend/create/$', login_required(ajax.TrendCreateView.as_view()), name='ajax_trend_create'),
    url(r'^ajax/trend/(?P<pk>\d+)/$', login_required(ajax.TrendDetailView.as_view()), name='ajax_trend_detail'),
    url(r'^ajax/trend/(?P<pk>\d+)/update/$', login_required(ajax.TrendUpdateView.as_view()), name='ajax_trend_update'),
    url(r'^ajax/trend/(?P<pk>\d+)/delete/$', login_required(ajax.TrendDeleteView.as_view()), name='ajax_trend_delete'),
    # Include admin urls since this is the ROOT_CONF
    url(r'admin/', include(admin_urlpatterns)),
)

if settings.SERVE_STATIC_FILES:
    from django.conf.urls.static import static
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)


# router = routers.DefaultRouter()
# router.register('trend', api.TrendViewSet)
# router.register('plot', api.PlotViewSet)
#
#
# urlpatterns += [
#     url(r'^api/v1/', include(router.urls, namespace='api')),
# ]
