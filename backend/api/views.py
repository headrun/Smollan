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
from django.db.models import Q
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


def get_filtered_graph_data(model, country, project, start_date, end_date):
    model_objs = get_model('api', model).objects.all()
    return_key = None
    graph_data = []
    filter_map = {
        'projects': 'project',
        'countries': 'countrycode',
        'project': 'project'
    }

    if not country:
        query = Q()
        if start_date:
            query = query & Q(day__gte=start_date)
        if end_date:
            query = query & Q(day__lte=end_date)    
        if query:
                query_data = [model_objs.filter(query).aggregate(
                    actual=Sum('attendance_achvd'), target=Sum('attendance_target'))]
        else:
            query_data = [model_objs.all().aggregate(actual=Sum('attendance_achvd'),\
                    target=Sum('attendance_target'))]
        if query_data[0]['target']:
            return_key = 'South East Asia'

    if country and not project:
        query = Q(countrycode=country)
        if start_date:
            query = query & Q(day__gte=start_date)
        if end_date:
            query = query & Q(day__lte=end_date)

        query_data = model_objs.filter(query).values('project').annotate(\
            actual=Sum('attendance_achvd'), target=Sum('attendance_target'))
        return_key = 'projects'

    if country and project:
        if country == 'all' and project == 'all':
            query = Q()
            if start_date:
                query = query & Q(day__gte=start_date)
            if end_date:
                query = query & Q(day__lte=end_date)

            if query:
                query_data = model_objs.filter(query).\
                values('countrycode').annotate(actual=Sum('attendance_achvd'), \
                target=Sum('attendance_target'))
                return_key = 'countries'
            else:
                query_data = model_objs.all().values('countrycode').annotate(\
                actual=Sum('attendance_achvd'),target=Sum('attendance_target'))
                return_key = 'countries'
        else:
            query = Q(project=project)
            if start_date:
                query = query & Q(day__gte=start_date)
            if end_date:
                query = query & Q(day__lte=end_date)

            query_data = model_objs.filter(query).values('project').annotate(
                actual=Sum('attendance_achvd'), target=Sum('attendance_target'))            
            return_key = 'project'

    if return_key:
        for datum in query_data:

            graph_point = {
                'name': 'South East Asia' if return_key=='South East Asia' else datum[filter_map[return_key]],
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
    start_date = request.GET.get('start_date', None)
    end_date = request.GET.get('end_date', None)

    graph_data, detail = get_filtered_graph_data('kpi', country, project, start_date, end_date)

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


def format_nodes(node_list, node_map):
    nodes = []
    for ind, ent in enumerate(node_list):
        node = {
            'node': ind,
            'name': ent
        }
        node_map[ent] = ind
        nodes.append(node)
    return nodes


def get_nodes_sankey(kpis):
    countries = list(kpis.distinct().values_list('countrycode', flat=True))
    projects = list(kpis.distinct().values_list('project', flat=True))
    node_list = countries + projects
    nodes = []
    node_map = {}
    nodes = format_nodes(node_list, node_map)
    return nodes, node_map


def get_node_links_sankey(kpis, node_map):
    kpi_values = kpis.values(
        'countrycode', 'project').annotate(
        available=Sum('promo_available'), target=Sum('promo_target'))
    links = []
    for ent in kpi_values:
        node_link = {
            'source': node_map[ent['countrycode']],
            'value': round((ent['available']/ent['target'])*100, 0) if ent['target'] else 0,
            #'value': ent['available'],
            'target': node_map[ent['project']]
        }
        if ent['target']:
            links.append(node_link)
    return links

#@loginRequired
@csrf_exempt
@allowedMethods(["GET"])
def promo(request):
    start_date = request.GET.get('start_date', None)
    end_date = request.GET.get('end_date', None)
    country = request.GET.get('country', None)
    project = request.GET.get('project', None)

    query = Q()
    if start_date:
        start_date = parser.parse(start_date).date()
        query = query & Q(day__gte=start_date)
    if end_date:
        end_date = parser.parse(end_date).date()
        query = query & Q(day__lte=end_date)
    if country:
        query = query & Q(countrycode = country)
    if project:
        query = query & Q(project = project)

    if query:
        kpis = Kpi.objects.filter(query)
    else:
        kpis = Kpi.objects.all()
        #kpis = Kpi.objects.filter(countrycode='HONGKONG')

    nodes, node_map = get_nodes_sankey(kpis)
    links = get_node_links_sankey(kpis, node_map)


    resp =  {
                "nodes": nodes,
                "links": links
            };

    return HttpResponse(resp)



# #@loginRequired
# @csrf_exempt
# @allowedMethods(["GET"])
# def promo(request):
#     start_date = request.GET.get('start_date', None)
#     end_date = request.GET.get('end_date', None)
#     country = request.GET.get('country', None)
#     project = request.GET.get('project', None)

#     query = Q()
#     if start_date:
#         start_date = parser.parse(start_date).date()
#         query = query & Q(day__gte=start_date)
#     if end_date:
#         end_date = parser.parse(end_date).date()
#         query = query & Q(day__lte=end_date)
#     if country:
#         query = query & Q(countrycode = country)
#     if project:
#         query = query & Q(project = project)

#     if query:
#         kpis = Kpi.objects.filter(query)
#     else:
#         kpis = Kpi.objects.all()


#     kpi_values = kpis.values('day').annotate(
#                 actual=Sum('promo_available'), target=Sum('promo_target'))
#     resp_list = []
#     for kpi_val in kpi_values:
#         try:
#             kpi_val['percent'] = round(
#                 (kpi_val['actual']/kpi_val['target'])*100, 2)
#         except ZeroDivisionError as e:
#             kpi_val['percent'] = 0
#         kpi_val['day'] = getUnixTimeMillisec(kpi_val['day'])
#         resp_list.append([kpi_val['day'], kpi_val['percent']])
#     return HttpResponse(resp_list)

@loginRequired
def heatmap(request):
    _format = request.GET.get('format', 'dict')
    start_date = request.GET.get('start_date', None)
    end_date = request.GET.get('end_date', None)
    country = request.GET.get('country', None)
    project = request.GET.get('project', None)

    query = Q()
    if start_date:
        query = query & Q(day__gte=start_date)
    if end_date:
        query = query & Q(day__lte=end_date)
    if country:
        query = query & Q(countrycode = country)
    if project:
        query = query & Q(project = project)

    if query:
        query_data = Kpi.objects.filter(query).\
            values('countrycode').annotate(
                    actual=Sum('attendance_achvd'), target=Sum('attendance_target'))
    else:
        query_data = Kpi.objects.all().values('countrycode').\
            annotate(actual=Sum('attendance_achvd'), target=Sum('attendance_target'))

    data_list = []

    py_countries = {}
    for country in pycountry.countries:
       py_countries[country.name] = country.alpha_2


    stnd_dict = {'Hongkong': 'Hong Kong', 'Taiwan' : 'Taiwan, Province of China',\
                       'Vietnam' : 'Viet Nam'}

    for data in query_data:
        if _format == 'dict':
            cnt_name = data['countrycode'].title()
            cnt_code = stnd_dict.get(cnt_name, cnt_name)
            data_dict = {}
            data_dict['name'] = cnt_name
            data_dict['code'] = py_countries.get(cnt_code, 'Unknown code')
            data_dict['value'] = round((data['actual']/data['target'])*100, 0)
            if not data_dict['code'] == 'Unknown code':
                data_list.append(data_dict)
        else:
            data_list.append([data['countrycode'] + ',' + str(round((data['actual']/data['target'])*100, 2))])
    return HttpResponse(data_list)  

def get_countries(request):
    countries = Kpi.objects.filter().values_list('countrycode').distinct()
    cnt_list = []
    for country in countries:
        cnt_list.append(country[0])

    return HttpResponse(cnt_list)

def get_projects(request):
    country = request.GET.get('country', 'all')
    if country == 'all':
        projects = Kpi.objects.filter().values_list('project').distinct()
    else:
        projects = Kpi.objects.filter(countrycode=country).values_list('project').distinct()
    prj_list = []
    for project in projects:
        prj_list.append(project[0])

    return HttpResponse(prj_list)
