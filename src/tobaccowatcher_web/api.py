# coding: utf-8
# from rest_framework.authentication import SessionAuthentication
# from rest_framework.permissions import IsAuthenticated
# from rest_framework import viewsets
# from django.conf import settings
#
# from tobaccowatcher.models import Trend, Plot
# from tobaccowatcher_web.serializers import TrendSerializer, PlotSerializer


# class TrendViewSet(viewsets.ModelViewSet):
#     queryset = Trend.objects.all()
#     serializer_class = TrendSerializer
#     authentication_classes = (SessionAuthentication,)
#     permission_classes = (IsAuthenticated,)
#
#     def get_queryset(self):
#         queryset = super(TrendViewSet, self).get_queryset()
#         return queryset.filter(user=self.request.user)
#
#
# class PlotViewSet(viewsets.ModelViewSet):
#     queryset = Plot.objects.all()
#     serializer_class = PlotSerializer
#     authentication_classes = (SessionAuthentication,)
#     permission_classes = (IsAuthenticated,)
#     filter_fields = ('trend',)
#
#     def get_queryset(self):
#         queryset = super(PlotViewSet, self).get_queryset()
#         return queryset.filter(plot__user=self.request.user)
