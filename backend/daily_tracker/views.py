from rest_framework import generics, permissions
from django.utils import timezone
from datetime import timedelta

from .models import DailyTask
from .serializers import DailyTaskSerializer


# ✅ GET + POST → /api/tasks/
class TaskListCreateView(generics.ListCreateAPIView):
    serializer_class = DailyTaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        date_param = self.request.query_params.get('date')

        # 🔍 If date is passed → filter by that date
        if date_param:
            return DailyTask.objects.filter(user=user, date=date_param)

        # 🔥 Default → today's tasks
        today = timezone.now().date()
        queryset = DailyTask.objects.filter(user=user, date=today)

        # 🔁 If no tasks today → clone from yesterday (only recurring)
        if not queryset.exists():
            yesterday = today - timedelta(days=1)
            prev_tasks = DailyTask.objects.filter(
                user=user,
                date=yesterday,
                is_recurring=True
            )

            for task in prev_tasks:
                DailyTask.objects.create(
                    user=user,
                    title=task.title,
                    description=task.description,
                    date=today,
                    status='PENDING',
                    is_recurring=task.is_recurring,
                    notes=""
                )

            queryset = DailyTask.objects.filter(user=user, date=today)

        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# ✅ PATCH + DELETE → /api/tasks/{id}/
class TaskUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = DailyTaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # 🔐 Ensure user can access only their tasks
        return DailyTask.objects.filter(user=self.request.user)