# -*- coding: utf-8 -*-
# Generated by Django 1.9.6 on 2017-04-17 10:24
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Conversation',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Message',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('data', models.TextField()),
                ('raw_data', models.TextField()),
                ('type', models.CharField(choices=[('html', 'HTML'), ('js', 'JavaScript'), ('text', 'Text')], max_length=4)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('inAnswerTo', models.IntegerField(blank=True, null=True)),
                ('worthSending', models.BooleanField(default=False)),
                ('conversation', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='chatbot.Conversation')),
            ],
        ),
    ]
