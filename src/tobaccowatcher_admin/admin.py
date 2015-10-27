# -*- coding: utf-8 -*-
from django.contrib import admin
from django.contrib.auth.models import Group
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
from django.conf.urls.defaults import patterns
from django.core.urlresolvers import reverse
from django.http import HttpResponsePermanentRedirect
from django.forms import TextInput, Textarea
from django.db.models import CharField, TextField
from django.shortcuts import render_to_response, RequestContext

from tobaccowatcher.models import User, Alert, Feedback, Trend, Plot
from tobaccowatcher_admin.forms import UserChangeForm, UserCreationForm


admin.site.unregister(Group)


class UserAdmin(DjangoUserAdmin):
    form = UserChangeForm
    add_form = UserCreationForm

    list_display = ('email', 'is_admin', )
    list_filter = ('is_admin', )
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'affiliation')}),
        ('Permissions', {'fields': ('is_admin', 'is_active', 'is_invited')}),
        ('Important dates', {'fields': ('last_login',)}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2')}),
    )
    search_fields = ('email',)
    ordering = ('email',)
    filter_horizontal = ()

admin.site.register(User, UserAdmin)


class FeedbackAdmin(admin.ModelAdmin):
    list_filter = ('feedback_type', 'user')
    list_display = ('uuid', 'user', 'feedback_type', 'data')
    search_fields = ('uuid', 'user')
    ordering = ('id',)

admin.site.register(Feedback, FeedbackAdmin)


class AlertsAdmin(admin.ModelAdmin):
    review_template = 'alerts.html'
    fieldsets = (
        ('Configuration', {'fields': ('is_active', 'how_many')}),
        ('Email Text', {'fields': ('body',)})
    )
    formfield_overrides = {
        CharField: {'widget': TextInput(attrs={'size': '200'})},
        TextField: {'widget': Textarea(attrs={'rows': 20, 'style': 'width: 100%; padding-right: 0;'})},
    }

    def get_urls(self):
        urls = super(AlertsAdmin, self).get_urls()
        my_urls = patterns('',
            (r'\d+/review/$', self.admin_site.admin_view(self.review)),
        )
        return my_urls + urls

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    def changelist_view(self, request, extra_context=None):
        try:
            Alert.objects.get(pk=1)

        except:
            Alert.objects.create(pk=1, how_many=100)

        return HttpResponsePermanentRedirect(reverse('admin:tobaccowatcher_alert_change', args=(1,)))

    def review(self, request, id):
        entry = Alert.objects.get(pk=id)

        return render_to_response(self.review_template, {
            'title': 'Review entry: %s' % entry.title,
            'entry': entry,
            'opts': self.model._meta,
            'root_path': self.admin_site.root_path,
        }, context_instance=RequestContext(request))

admin.site.register(Alert, AlertsAdmin)
admin.site.register(Plot)
admin.site.register(Trend)
