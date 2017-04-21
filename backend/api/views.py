from __future__ import division
import json
import pycountry

from django.shortcuts import render
from django.db.models import Sum

from models import *
from auth.decorators import loginRequired
from common.utils import getHttpResponse as HttpResponse
from common.utils import getUnixTimeMillisec
from common.decorators import allowedMethods
from django.views.decorators.csrf import csrf_exempt
import datetime
from dateutil import parser
from dateutil.relativedelta import relativedelta

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


def get_filtered_graph_data(model, country, project):
    model_objs = get_model('api', model).objects.all()
    return_key = None
    graph_data = []
    filter_map = {
        'projects': 'project',
        'countries': 'countrycode',
        'project': 'project'
    }

    if not country:
        query_data = [model_objs.aggregate(
            actual=Sum('attendance_achvd'), target=Sum('attendance_target'))]
        return_key = 'all'
    if country and not project:
        query_data = model_objs.filter(countrycode=country).values('project').annotate(
            actual=Sum('attendance_achvd'), target=Sum('attendance_target'))
        return_key = 'projects'
    if country and project:
        if country == 'all' and project == 'all':
            query_data = model_objs.values('countrycode').annotate(
                actual=Sum('attendance_achvd'), target=Sum('attendance_target'))
            return_key = 'countries'
        else:
            query_data = model_objs.filter(project=project).values('project').annotate(
                actual=Sum('attendance_achvd'), target=Sum('attendance_target'))            
            return_key = 'project'

    for datum in query_data:

        graph_point = {
            'name': 'all' if return_key=='all' else datum[filter_map[return_key]],
            'actual': datum['actual'],
            'target': datum['target'],
            'y': round((datum['actual']/datum['target'])*100, 2),
            'drilldown': True if return_key != 'project' else False
        }
        graph_data.append(graph_point)
    return graph_data, return_key


@loginRequired

@allowedMethods(["GET"])
def attendance(request):
    country = request.GET.get('country', None)
    project = request.GET.get('project', None)
    day = request.GET.get('day', None)
    #import pdb;pdb.set_trace()

    graph_data, detail = get_filtered_graph_data('kpi', country, project)

    resp = {
      'name': detail,
      'colorByPoint': True, 
      'data': graph_data
    }
    return HttpResponse(resp)


@loginRequired
@csrf_exempt
@allowedMethods(["GET"])
def osa(request):
    kpis = Kpi.objects.all()
    kpi_values = kpis.values('countrycode', 'project', 'moc', 'osa_target', 'osa_available')
    for kpi_val in kpi_values:
        try:
            kpi_val['osa_percent'] = round(
                (kpi_val['osa_available']/kpi_val['osa_target'])*100, 2)
        except ZeroDivisionError as e:
            kpi_val['osa_percent'] = 0

    return HttpResponse(list(kpi_values))

@loginRequired
def pop(request):
    kpis = Kpi.objects.all()
    kpi_values = kpis.values('countrycode', 'project', 'moc', 'pop_target', 'pop_available')
    for kpi_val in kpi_values:
        try:
            kpi_val['pop_percent'] = round(
                (kpi_val['pop_available']/kpi_val['pop_target'])*100, 2)
        except ZeroDivisionError as e:
            kpi_val['pop_percent'] = 0

    return HttpResponse(list(kpi_values)) 

@loginRequired
def npd(request):
    kpis = Kpi.objects.all()
    kpi_values = kpis.values('countrycode', 'project', 'moc', 'npd_target', 'npd_available')
    for kpi_val in kpi_values:
        try:
            kpi_val['npd_percent'] = round(
                (kpi_val['npd_available']/kpi_val['npd_target'])*100, 2)
        except ZeroDivisionError as e:
            kpi_val['npd_percent'] = 0

    return HttpResponse(list(kpi_values))

@loginRequired
def outlets(request):
    kpis = Kpi.objects.all()
    kpi_values = kpis.values('countrycode', 'project', 'moc', 'outlets_done', 'outlets_total')
    for kpi_val in kpi_values:
        try:
            kpi_val['outlets_percent'] = round(
                (kpi_val['outlets_done']/kpi_val['outlets_total'])*100, 2)
        except ZeroDivisionError as e:
            kpi_val['outlets_percent'] = 0

    return HttpResponse(list(kpi_values))

#@loginRequired
@csrf_exempt
@allowedMethods(["GET"])
def promo(request):
    start_date = request.GET.get('start_date', None)
    end_date = request.GET.get('end_date', None)

    if start_date:
        start_date = parser.parse(start_date).date()
    else:
        #start_date = datetime.datetime.now().date()-relativedelta(days=30)
        start_date = parser.parse('2016-12-01').date()

    if end_date:
        end_date = parser.parse(end_date).date()
    else:
        #end_date = datetime.datetime.now().date()
        end_date = parser.parse('2016-12-31').date()
    kpis = Kpi.objects.filter(day__gte=start_date, day__lte=end_date)

    kpi_values = kpis.values('day').annotate(
                actual=Sum('promo_available'), target=Sum('promo_target'))
    resp_list = []
    for kpi_val in kpi_values:
        try:
            kpi_val['percent'] = round(
                (kpi_val['actual']/kpi_val['target'])*100, 2)
        except ZeroDivisionError as e:
            kpi_val['percent'] = 0
        kpi_val['day'] = getUnixTimeMillisec(kpi_val['day'])
        resp_list.append([kpi_val['day'], kpi_val['percent']])
    return HttpResponse(resp_list)

@loginRequired
def heatmap(request):
    _format = request.GET.get('format', 'dict')
    query_data = Kpi.objects.all().values('countrycode').annotate(
            actual=Sum('attendance_achvd'), target=Sum('attendance_target'))
    data_list = []

    py_countries = {}
    for country in pycountry.countries:
       py_countries[country.name] = country.alpha_2

    for data in query_data:
        if _format == 'dict':
            data_dict = {}
            data_dict['name'] = data['countrycode'].title()
            data_dict['code'] = py_countries.get(data['countrycode'].title(), 'Unknown code')
            data_dict['value'] = round((data['actual']/data['target'])*100, 0)
            if not data_dict['code'] == 'Unknown code':
                data_list.append(data_dict)
        else:
            data_list.append(
                [data['countrycode'] + ',' + str(round((data['actual']/data['target'])*100, 2))])
    return HttpResponse(data_list)  
