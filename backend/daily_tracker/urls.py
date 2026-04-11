from django.urls import path
from .views import TaskListCreateView, TaskUpdateDeleteView

urlpatterns = [
    path('', TaskListCreateView.as_view()),            # GET, POST → /daily/
    path('<int:pk>/', TaskUpdateDeleteView.as_view()), # PATCH, DELETE → /daily/1/
]