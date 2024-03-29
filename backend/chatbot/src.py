import datetime
import json
import os, urllib, requests

import time

from django.template import loader
from django.utils.timezone import utc
from random import random
from .models import Message, Conversation
from django.conf import settings

BASE_DIR = settings.BASE_DIR

tableDataPath = os.path.join(BASE_DIR, "chatbot/table_sample.json")
SAMPLE_TABLE_DATA = json.loads(open(tableDataPath, "r").read())

chartsDataPath = os.path.join(BASE_DIR, "chatbot/charts_sample.json")
SAMPLE_CHARTS_DATA = json.loads(open(chartsDataPath, "r").read())
SAMPLE_CHARTS_KEYS = SAMPLE_CHARTS_DATA.keys()

#URL = 'http://144.76.48.157:8010/search?query="%s"&source=api'
URL = 'http://144.76.48.157:9033/search'

assertions = ["Here is what i found",
              "Check it out",
              "I found this for you",
              "Here is what i found",
              "Check it out",
              "I found this for you"]

negatives = ["I did not found anything related",
             "I can not understand what you are saying",
             "Unable to get what you asked",
             "I did not found anything related",
             "I can not understand what you are saying",
             "Unable to get what you asked"]

class Api(object):

  def getMessages(self, user, filters=None, json=True):

    #if you put {} as default parameters, wierd shit may happen
    filters = filters or {}
    after   = filters.get("after")
    before  = filters.get("before")
    count   = filters.get("count", 10)
    msgType = filters.get("type")

    messages = Message.objects.filter(conversation__user=user)

    if after:
      messages = messages.filter(created__gt=after)

    if before:
      messages = messages.filter(created__lt=before)

    if msgType:
      messages = messages.filter(type=msgType)

    messages = messages.order_by("-created")
    messages = list(messages[:count])

    messages.reverse()

    result = []

    if json:
      for msg in messages:
        result.append(msg.json)

    else:
      result = messages

    return result

  def getPrevMesg(self, user):

    messages = Message.objects.filter(conversation__user=user)
    filtered = messages.filter(worthSending=True).order_by('-created')
    data = {}

    if filtered:
        data['reply'] = filtered[0].raw_data
        data['prev_query'] = messages.get(id=filtered[0].inAnswerTo).data

    return data

  def getAffirmitive(self):

    return {"data": assertions[int(random()*len(assertions))],
            "type": "text"}

  def getNegativeResp(self):

    return {"data": negatives[int(random()*len(negatives))],
            "type": "text"}

  def getReport(self, data):

    #need to put api call here
    #data = SAMPLE_TABLE_DATA

    template = loader.get_template("api/table.html").render(data)
    return {"data": template,
            "type": "html"}

  def getChart(self, input, extras={}):

     #randomChart = SAMPLE_CHARTS_KEYS[int(random()*len(SAMPLE_CHARTS_KEYS))]

     #chartData = {"series": SAMPLE_CHARTS_DATA[randomChart]}
     chartData = {}
     if extras:
        chartData = extras

     chartData["series"]= input
     print(chartData)
     template = loader.get_template("api/highcharts.html").render({"options": json.dumps(chartData)})

     return {
       "data": template,
       "type": "html"
     }

  def formatMsg(self, data):

    return {"data": data,
            "type": "text"}

  def createMessage(self, conv, data, raw_data=False, question=None, save=True, worth_sending=False):

    message = Message(data=data["data"],\
                      raw_data = raw_data,\
                      conversation=conv,\
                      type=data["type"],
                      inAnswerTo=question,
                      worthSending=worth_sending)

    if save:
      time.sleep(1)
      message.save()
    else:
      message.created = datetime.datetime.now(tz=utc)

    return message.json

  """
  def createMessage(self, conv, data, question=None, save=True):

    message = Message(data=data["data"],\
                      conversation=conv,\
                      type=data["type"],
                      inAnswerTo=question)

    if save:
      message.save()
    else:
      message.created = datetime.datetime.now(tz=utc)

    return message.json
  """
  def parse(self, user, input):

    error = 0
    messages = []

    #get last generated report
    payload = self.getPrevMesg(user)
    #
    payload['email'] = user.email
    #
    conv = Conversation.objects.create(user=user)
    question = self.createMessage(conv, {"data": input,\
                                         "type": "text"})["id"]
    #url = URL %urllib.quote(input)
    #data = requests.get(url, params=payload).text

    payload['query'] = input
    payload['source'] = "api"

    data = requests.post(URL, payload).text
    data = json.loads(data)
    print('\n\n'+str(data))
    result = data.get('result')
    for _chunk in result:
        message = ''

        if _chunk.get('type') == 'message':
            message = self.createMessage(conv, self.formatMsg(_chunk['data']), _chunk,
                                       question=question, save=True)
            #message = self.createMessage(conv, self.getAffirmitive(),\
            #                           question, save=False)
        elif _chunk.get('type') == 'table':
            message = self.createMessage(conv, self.getReport(_chunk['data']), _chunk,
                                      question=question, worth_sending=True)

        elif _chunk.get('type') == 'chart':
            message = self.createMessage(conv, self.getChart(_chunk['data'], extras=_chunk['extras']), _chunk,
                                    question=question, worth_sending=True)
        if message:
            messages.append(message)

    print("\nmessages:\n")
    print(message)
    return error, messages

  """
  def parse(self, user, input):

    error = 0
    messages = []

    conv = Conversation.objects.create(user=user)
    question = self.createMessage(conv, {"data": input,\
                                         "type": "text"})["id"]

    if "plot" in input.lower():
      message = self.createMessage(conv, self.getAffirmitive(),\
                                   question, save=False)
      messages.append(message)

      chart = self.createMessage(conv, self.getChart(input), question)
      messages.append(chart)

    elif "report" in input.lower():
      message = self.createMessage(conv, self.getAffirmitive(),\
                                   question, save=False)
      messages.append(message)

      report = self.createMessage(conv, self.getReport(input),\
                                  question)
      messages.append(report)

    else:
      message = self.createMessage(conv, self.getNegativeResp(), question)
      messages.append(message)

      message = self.createMessage(conv, {"data": "Try 'help'",\
                                          "type": "text"},\
                                   question, save=False)

      messages.append(message);

    return error, messages
  """
  @staticmethod
  def run(methodName, *args):

    api = Api()
    return api.__getattribute__(methodName)(*args)
