from django.conf.urls import url, include
import views

urlpatterns = [
    url(r'^chatbot/', include("chatbot.urls")),
    url(r'^test_success/', views.test_success),
    url(r'^test_fail/', views.test_fail),
    url(r'^attendance/', views.attendance),
]
