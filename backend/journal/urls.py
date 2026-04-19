from django.urls import path
from .views import JournalListCreateView, JournalUpdateDeleteView, JournalFeaturedView, JournalStatsView

urlpatterns = [
    path('', JournalListCreateView.as_view(), name='journal-list-create'),
    path('featured/', JournalFeaturedView.as_view(), name='journal-featured'),
    path('stats/', JournalStatsView.as_view(), name='journal-stats'),
    path('<int:pk>/', JournalUpdateDeleteView.as_view(), name='journal-detail'),
]
