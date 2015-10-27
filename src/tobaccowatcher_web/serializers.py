# coding: utf-8
# from rest_framework import serializers
#
# from tobaccowatcher.models import Trend, Plot


# class TrendSerializer(serializers.HyperlinkedModelSerializer):
#     class Meta:
#         model = Trend
#         fields = ('name', 'start_date', 'end_date')
#
#     def save(self, **kwargs):
#         kwargs['user'] = self.context['request'].user
#         super(TrendSerializer, self).save(**kwargs)
#
#
# class PlotSerializer(serializers.HyperlinkedModelSerializer):
#     trend = serializers.HyperlinkedRelatedField(view_name='api:plot-detail', queryset=Trend.objects.all())
#
#     class Meta:
#         model = Plot
#         fields = ('trend', 'keywords', 'categories', 'locations', 'languages')
#
#     def get_fields(self):
#         fields = super(PlotSerializer, self).get_fields()
#         fields['trend'].queryset = Trend.objects.filter(user=self.context['request'].user)
#         return fields
