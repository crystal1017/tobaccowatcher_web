# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding field 'Plot.title'
        db.add_column(u'tobaccowatcher_plot', 'title',
                      self.gf('django.db.models.fields.CharField')(default='', max_length=128, blank=True),
                      keep_default=False)

        # Deleting field 'Trend.name'
        db.delete_column(u'tobaccowatcher_trend', 'name')

        # Adding field 'Trend.title'
        db.add_column(u'tobaccowatcher_trend', 'title',
                      self.gf('django.db.models.fields.CharField')(default='', max_length=128, blank=True),
                      keep_default=False)


        # Changing field 'Trend.preview'
        db.alter_column(u'tobaccowatcher_trend', 'preview', self.gf('django.db.models.fields.TextField')())

    def backwards(self, orm):
        # Deleting field 'Plot.title'
        db.delete_column(u'tobaccowatcher_plot', 'title')

        # Adding field 'Trend.name'
        db.add_column(u'tobaccowatcher_trend', 'name',
                      self.gf('django.db.models.fields.CharField')(default='', max_length=128),
                      keep_default=False)

        # Deleting field 'Trend.title'
        db.delete_column(u'tobaccowatcher_trend', 'title')


        # Changing field 'Trend.preview'
        db.alter_column(u'tobaccowatcher_trend', 'preview', self.gf('django.db.models.fields.files.FileField')(max_length=255))

    models = {
        u'auth.group': {
            'Meta': {'object_name': 'Group'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '80'}),
            'permissions': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['auth.Permission']", 'symmetrical': 'False', 'blank': 'True'})
        },
        u'auth.permission': {
            'Meta': {'ordering': "(u'content_type__app_label', u'content_type__model', u'codename')", 'unique_together': "((u'content_type', u'codename'),)", 'object_name': 'Permission'},
            'codename': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'content_type': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['contenttypes.ContentType']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '50'})
        },
        u'contenttypes.contenttype': {
            'Meta': {'ordering': "('name',)", 'unique_together': "(('app_label', 'model'),)", 'object_name': 'ContentType', 'db_table': "'django_content_type'"},
            'app_label': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'model': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'})
        },
        u'tobaccowatcher.alert': {
            'Meta': {'object_name': 'Alert'},
            'body': ('django.db.models.fields.TextField', [], {}),
            'how_many': ('django.db.models.fields.IntegerField', [], {}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_active': ('django.db.models.fields.BooleanField', [], {'default': 'False'})
        },
        u'tobaccowatcher.feedback': {
            'Meta': {'object_name': 'Feedback'},
            'data': ('django.db.models.fields.CharField', [], {'max_length': '250'}),
            'date_created': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'blank': 'True'}),
            'feedback_type': ('django.db.models.fields.CharField', [], {'max_length': '64'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['tobaccowatcher.User']"}),
            'uuid': ('django.db.models.fields.CharField', [], {'max_length': '64'})
        },
        u'tobaccowatcher.plot': {
            'Meta': {'object_name': 'Plot'},
            'categories': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'keywords': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'languages': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'locations': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '128', 'blank': 'True'}),
            'trend': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'plots'", 'to': u"orm['tobaccowatcher.Trend']"})
        },
        u'tobaccowatcher.trend': {
            'Meta': {'object_name': 'Trend'},
            'end_date': ('django.db.models.fields.DateField', [], {}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'preview': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'start_date': ('django.db.models.fields.DateField', [], {}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '128', 'blank': 'True'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'trends'", 'to': u"orm['tobaccowatcher.User']"})
        },
        u'tobaccowatcher.user': {
            'Meta': {'object_name': 'User'},
            'affiliation': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'email': ('django.db.models.fields.EmailField', [], {'unique': 'True', 'max_length': '255', 'db_index': 'True'}),
            'first_name': ('django.db.models.fields.CharField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'}),
            'groups': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['auth.Group']", 'symmetrical': 'False'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_active': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'is_admin': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'is_invited': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'last_login': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'last_name': ('django.db.models.fields.CharField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'}),
            'password': ('django.db.models.fields.CharField', [], {'max_length': '128'})
        },
        u'tobaccowatcher.useralert': {
            'Meta': {'object_name': 'UserAlert'},
            'data': ('django.db.models.fields.TextField', [], {}),
            'frequency': ('django.db.models.fields.CharField', [], {'default': "'daily'", 'max_length': '20'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_paused': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'name': ('django.db.models.fields.TextField', [], {}),
            'shared': ('django.db.models.fields.related.ManyToManyField', [], {'related_name': "'alerts'", 'symmetrical': 'False', 'to': u"orm['tobaccowatcher.User']"}),
            'updated': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'blank': 'True'}),
            'url': ('django.db.models.fields.TextField', [], {}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['tobaccowatcher.User']"})
        }
    }

    complete_apps = ['tobaccowatcher']