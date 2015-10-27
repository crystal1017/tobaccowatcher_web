# -*- coding: utf-8 -*-
from django import forms

from tobaccowatcher.models import User, UserAlert, Plot, Trend
from tobaccowatcher_web.constants import CATEGORIES, regions_tree, LANGUAGES


__ALL__ = (
    'ProfileForm',
)


class ProfileForm(forms.ModelForm):
    class Meta:
        model = User
        exclude = ('is_active', 'is_admin', 'groups', 'password', 'last_login')


class UserAlertForm(forms.ModelForm):
    class Meta(object):
        model = UserAlert
        fields = ('name',)
        widgets = {
            'name': forms.TextInput()
        }


class UserForm(forms.ModelForm):
    class Meta(object):
        model = User
        fields = ('email', 'first_name', 'last_name', 'affiliation')
        widgets = {
            'email': forms.TextInput(attrs={'class': 'form-control'}),
            'first_name': forms.TextInput(attrs={'class': 'form-control'}),
            'last_name': forms.TextInput(attrs={'class': 'form-control'}),
            'affiliation': forms.TextInput(attrs={'class': 'form-control'})
        }


class BaseTrendForm(forms.ModelForm):
    class Meta(object):
        model = Trend
        fields = ('start_date', 'end_date', 'title', 'preview', 'date_interval')

    def __init__(self, request, *args, **kwargs):
        super(BaseTrendForm, self).__init__(*args, **kwargs)
        self.request = request
        if 'date_interval' in request.POST:
            self.fields['start_date'].required = False
            self.fields['end_date'].required = False


class CreateTrendForm(BaseTrendForm):
    def save(self, *args, **kwargs):
        if not self.instance.pk:
            self.instance.user = self.request.user
        return super(CreateTrendForm, self).save(*args, **kwargs)


class BasePlotForm(forms.ModelForm):
    class Meta(object):
        model = Plot
        fields = ('keywords', 'categories', 'locations', 'languages', 'trend', 'title')

    def clean_categories(self):
        categories = self.cleaned_data['categories'].split(',')
        origin = [c['id'] for c in CATEGORIES]
        for category in categories:
            if category and category not in origin:
                raise forms.ValidationError('Category with id "{0}" not in allowed categories'.format(category))
        return ','.join(categories)

    def clean_locations(self):
        locations = self.cleaned_data['locations'].split(',')
        origin = []
        for region in regions_tree:
            origin.append(region['id'])
            for country in region.get('countries', []):
                origin.append(country['id'])
        for location in locations:
            if location and location not in origin:
                raise forms.ValidationError('Country/Region with id "{0}" not in allowed list'.format(location))
        return ','.join(locations)

    def clean_language(self):
        languages = self.cleaned_data['languages'].split(',')
        origin = [l['id'] for l in LANGUAGES]
        for language in languages:
            if language and language not in origin:
                raise forms.ValidationError('Language with id "{0}" not in allowed languages'.format(language))
        return ','.join(languages)
