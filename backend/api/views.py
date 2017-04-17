import json

from django.shortcuts import render
from django.db.models import Sum

from models import *
from auth.decorators import loginRequired
from common.utils import getHttpResponse as HttpResponse
from common.decorators import allowedMethods

@allowedMethods(["GET"]) #only GET requests will be allowed
#@loginRequired #check for login
def test_success(request):

  return HttpResponse(final_data)

@allowedMethods(["POST"])
def test_fail(request):

  return HttpResponse("sample error resp", error=1)
