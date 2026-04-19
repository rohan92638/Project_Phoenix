from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta

from .models import JournalEntry
from .serializers import JournalEntrySerializer


class JournalListCreateView(generics.ListCreateAPIView):
    serializer_class = JournalEntrySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        date_param = self.request.query_params.get('date')
        
        queryset = JournalEntry.objects.filter(user=user)
        
        # Featured in requirements: "suppose i am select 10 april then show me 10 april journal"
        if date_param:
            queryset = queryset.filter(date=date_param)
            
        return queryset


class JournalUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = JournalEntrySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return JournalEntry.objects.filter(user=self.request.user)


class JournalFeaturedView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        yesterday = timezone.localdate() - timedelta(days=1)
        
        # Try to get yesterday's entry
        entry = JournalEntry.objects.filter(user=user, date=yesterday).first()
        
        # If no entry yesterday, get the most recent one
        if not entry:
            entry = JournalEntry.objects.filter(user=user).order_by('-date', '-created_at').first()
            
        if entry:
            serializer = JournalEntrySerializer(entry)
            return Response(serializer.data)
            
        return Response(None)


class JournalStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        
        total_entries = JournalEntry.objects.filter(user=user).count()
        
        # Get all distinct local dates sorted descending
        dates = list(JournalEntry.objects.filter(user=user)
                     .order_by('-date')
                     .values_list('date', flat=True)
                     .distinct())
                     
        day_streak = 0
        all_time_best = 0
        
        if dates:
            # Calculate max consecutive streak
            sorted_dates = sorted(dates)  # Ascending for max streak math
            current_run = 1
            max_run = 1
            
            for i in range(1, len(sorted_dates)):
                # Difference between consecutive dates
                if (sorted_dates[i] - sorted_dates[i-1]).days == 1:
                    current_run += 1
                else:
                    max_run = max(max_run, current_run)
                    current_run = 1
            max_run = max(max_run, current_run)
            all_time_best = max_run
            
            # Calculate current dynamic streak
            # It only counts if they wrote today OR yesterday
            today = timezone.localdate()
            if dates[0] == today or dates[0] == today - timedelta(days=1):
                day_streak = 1
                for i in range(1, len(dates)):
                    if (dates[i-1] - dates[i]).days == 1:
                        day_streak += 1
                    else:
                        break
                        
        return Response({
            'total_entries': total_entries,
            'day_streak': day_streak,
            'all_time_best': all_time_best
        })
