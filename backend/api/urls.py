import views
from django.conf.urls import url

urlpatterns = [
    url(r'^test_success/', views.test_success),
    url(r'^test_fail/', views.test_fail),
]
