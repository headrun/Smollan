from django.conf.urls import url, include
import views

urlpatterns = [
    url(r'^chatbot/', include("chatbot.urls")),
    url(r'^test_success/', views.test_success),
    url(r'^test_fail/', views.test_fail),
    url(r'^attendance/', views.attendance),
    url(r'^osa/', views.osa),
    url(r'^promo/', views.promo),
    url(r'^pop/', views.pop),
    url(r'^npd', views.npd),
    url(r'^outlets', views.outlets),
    url(r'^heatmap', views.heatmap),
]
