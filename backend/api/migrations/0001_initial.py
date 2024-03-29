# -*- coding: utf-8 -*-
# Generated by Django 1.9.6 on 2017-04-18 06:25
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Kpi',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('countrycode', models.CharField(blank=True, max_length=100, null=True)),
                ('project', models.CharField(blank=True, max_length=20, null=True)),
                ('moc', models.CharField(blank=True, max_length=10, null=True)),
                ('day', models.DateField(blank=True, null=True)),
                ('attendance_achvd', models.IntegerField(blank=True, null=True)),
                ('attendance_target', models.IntegerField(blank=True, null=True)),
                ('vacancy', models.IntegerField(blank=True, null=True)),
                ('vacancy_bracket', models.IntegerField(blank=True, null=True)),
                ('outlets_assigned', models.IntegerField(blank=True, null=True)),
                ('outlets_done', models.IntegerField(blank=True, null=True)),
                ('outlets_additional', models.IntegerField(blank=True, null=True)),
                ('outlets_total', models.IntegerField(blank=True, null=True)),
                ('tasks_assigned', models.IntegerField(blank=True, null=True)),
                ('tasks_done', models.IntegerField(blank=True, null=True)),
                ('osa_target', models.IntegerField(blank=True, null=True)),
                ('osa_available', models.IntegerField(blank=True, null=True)),
                ('osa_nonavailable', models.IntegerField(blank=True, null=True)),
                ('promo_target', models.IntegerField(blank=True, null=True)),
                ('promo_available', models.IntegerField(blank=True, null=True)),
                ('promo_nonavailable', models.IntegerField(blank=True, null=True)),
                ('pop_target', models.IntegerField(blank=True, null=True)),
                ('pop_available', models.IntegerField(blank=True, null=True)),
                ('pop_nonavailable', models.IntegerField(blank=True, null=True)),
                ('npd_target', models.IntegerField(blank=True, null=True)),
                ('npd_available', models.IntegerField(blank=True, null=True)),
                ('npd_nonavailale', models.IntegerField(blank=True, null=True)),
                ('att_per', models.FloatField(blank=True, null=True)),
            ],
            options={
                'db_table': 'kpi',
                'managed': True,
            },
        ),
    ]
