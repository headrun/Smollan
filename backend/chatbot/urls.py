import views
from django.conf.urls import url, include

urlpatterns = [

  url(r'^csrf/?$', views.csrf),
  url(r'^messages/?$', views.messages),
]
