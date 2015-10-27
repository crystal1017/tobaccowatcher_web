# -*- coding: utf-8 -*-
import logging

from django.contrib.auth.models import Group, BaseUserManager, AbstractBaseUser
from django.db import models
from django.conf import settings


logger = logging.getLogger(__name__)


class UserManager(BaseUserManager):
    def create_user(self, email, password=None):
        if not email:
            raise ValueError('Users must have an email address')

        user = self.model(email=UserManager.normalize_email(email))
        user.set_password(password)
        user.save(using=self._db)

        return user

    def create_superuser(self, email, password):
        user = self.create_user(email, password=password)
        user.is_admin = True
        user.save(using=self._db)

        return user


class User(AbstractBaseUser):
    """User profile"""

    email = models.EmailField(verbose_name='Email', max_length=255, unique=True, db_index=True)
    first_name = models.CharField(verbose_name='First Name', max_length=100, null=True, blank=True)
    last_name = models.CharField(verbose_name='Last Name', max_length=100, null=True, blank=True)
    affiliation = models.CharField(verbose_name='Affiliation', max_length=255, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_admin = models.BooleanField(default=False)
    is_invited = models.BooleanField(default=False)

    #role = models.CharField(max_length=16, choices=ROLE.ALL, default=ROLE.NONE, null=False)
    groups = models.ManyToManyField(Group)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def get_short_name(self):
        return self.email

    def __unicode__(self):
        return self.email

    def has_perm(self, perm, obj=None):
        return True

    def has_module_perms(self, app_label):
        return True

    def get_full_name(self):
        if self.first_name and self.last_name:
            return u"{0} {1}".format(self.first_name, self.last_name)
        elif self.first_name:
            return self.first_name
        elif self.last_name:
            return self.last_name
        return ''

    def get_shortened_full_name(self):
        if self.first_name and self.last_name:
            return u"{0}. {1}".format(str(self.first_name)[0], self.last_name)
        elif self.first_name:
            return self.first_name
        elif self.last_name:
            return self.last_name
        return ''

    @property
    def is_staff(self):
        return self.is_admin


class Feedback(models.Model):
    uuid = models.CharField(max_length=64)
    user = models.ForeignKey(User)
    feedback_type = models.CharField(max_length=64,
                                     choices=(
                                         ('category', 'Category'),
                                         ('language', 'Language'),
                                         ('country', 'Country'),
                                         ('region', 'Region'),
                                         ('related', 'Not tobacco-related'),
                                         ('note', 'Note')))
    data = models.CharField(max_length=250)
    date_created = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "feedback"
        verbose_name_plural = "feedback"


class Alert(models.Model):
    is_active = models.BooleanField('Activate Alerts')
    how_many = models.IntegerField('News items', help_text='Number of news items sent in alert')
    body = models.TextField('Template')

    def __str__(self):
        return 'Alert configure'

    class Meta(object):
        verbose_name = 'Alerts'
        verbose_name_plural = 'Alerts'


class UserAlert(models.Model):
    user = models.ForeignKey(User)
    updated = models.DateTimeField(auto_now=True)
    data = models.TextField()
    is_paused = models.BooleanField(default=False)
    frequency = models.CharField(max_length=20,
                                 choices=(('daily', 'Daily'),
                                          ('weekly', 'Weekly'),
                                          ('monthly', 'Monthly'),
                                          ('every_2_weeks', 'Every 2 Weeks')),
                                 default='daily')
    url = models.TextField()
    name = models.TextField()
    shared = models.ManyToManyField(User, related_name='alerts')


class Trend(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    title = models.CharField(max_length=128, blank=True)
    user = models.ForeignKey(User, related_name='trends')
    start_date = models.DateField(null=True)
    end_date = models.DateField(null=True)
    date_interval = models.CharField(max_length=30, blank=True)
    preview = models.TextField(blank=True)


class Plot(models.Model):
    title = models.CharField(max_length=128, blank=True)
    trend = models.ForeignKey(Trend, related_name='plots')
    keywords = models.TextField(blank=True)
    categories = models.TextField(blank=True)
    locations = models.TextField(blank=True)
    languages = models.TextField(blank=True)

    def get_categories(self):
        return self.categories.split(',')

    def get_locations(self):
        return self.locations.split(',')

    def get_languages(self):
        return self.languages.split(',')

    def prepare_to_save(self, values_list):
        return ','.join(values_list)

