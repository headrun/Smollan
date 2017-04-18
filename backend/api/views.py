from __future__ import division
import json

from django.shortcuts import render
from django.db.models import Sum

from models import *
from auth.decorators import loginRequired
from common.utils import getHttpResponse as HttpResponse
from common.decorators import allowedMethods
from django.views.decorators.csrf import csrf_exempt
import datetime

try:
    from django.db.models.loading import get_model
except ImportError:
    from django.apps import apps
    get_model = apps.get_model


@allowedMethods(["GET"]) #only GET requests will be allowed
#@loginRequired #check for login
def test_success(request):

  return HttpResponse(final_data)

@allowedMethods(["POST"])
def test_fail(request):
  return HttpResponse("sample error resp", error=1)


def get_filtered_data(model, filters):
    model_objs = get_model('api', model).objects.all()
    if not filters:
        return model_objs
    country = filters.get('countrycode')
    project = filters.get('project')
    if country:
        model_objs = model_objs.filter(countrycode= filters['countrycode'])
    if project:
        model_objs = model_objs.filter(project= filters['project'])
    return model_objs


def get_bar_chart_data(filtered_data, detail_filter='countrycode'):
    query_data = filtered_data.values(detail_filter).annotate(
        actual=Sum('attendance_achvd'), target=Sum('attendance_target'))
    graph_data = []
    for datum in query_data:
        graph_point = {
            'name': datum[detail_filter],
            'actual': datum['actual'],
            'target': datum['target'],
            'value': round((datum['actual']/datum['target'])*100, 2)
        }
        graph_data.append(graph_point)
    return graph_data


def get_detail_filter(filters):
    if filters.get('project'):
        return 'project'
    return 'countrycode'


#@loginRequired
@csrf_exempt
@allowedMethods(["GET"])
def attendance(request):
    filters = json.loads(request.GET.get('filters', None) or '{}')
    filtered_data = get_filtered_data('kpi', filters)
    graph_data = get_bar_chart_data(filtered_data, get_detail_filter(filters))
    return HttpResponse(graph_data)
