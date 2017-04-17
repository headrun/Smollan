"""
Example settings for local development

Use this file as a base for your local development settings.
It should not be checked into your code repository.
"""
from settings import *   # pylint: disable=W0614,W0401

ALLOWED_HOSTS.extend(["localhost"])
DATABASES["default"].update({

  'NAME': 'smollen',
  'USER': 'root',
  'PASSWORD': 'root'
})
