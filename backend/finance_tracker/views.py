from rest_framework import viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from django.db.models import Sum
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
import numpy as np

from .models import Transaction
from .serializers import TransactionSerializer
from .ml.predict import predict_category
from .ml.budget_predictor import predict_budget_exceed
from .ml.voice_parser import parse_voice_text, extract_amount
from .ml.clustering import get_expense_persona, get_income_persona
from django.db.models.functions import TruncDate



from django.db.models import Avg, StdDev, Count

# =========================
# 🔥 ANOMALY DETECTION LOGIC  (90-day rolling window)
# =========================
def detect_anomaly(user, new_amount):
    """
    Flags an expense as anomalous if it exceeds mean + 2*std of the
    user's expenses in the LAST 90 DAYS only.

    Using a rolling window prevents a single old outlier from permanently
    inflating the baseline and suppressing future alerts.

    Requires at least 5 expenses in the window before activating.
    """
    window_start = datetime.now().date() - timedelta(days=90)

    stats = Transaction.objects.filter(
        user=user,
        transaction_type='EXPENSE',
        date__gte=window_start           # ← only recent 90 days
    ).aggregate(
        mean=Avg('amount'),
        std=StdDev('amount'),
        count=Count('id')
    )

    count = stats['count']
    mean  = stats['mean']
    std   = stats['std']

    # Need minimum data and valid stats inside the window
    if count < 5 or mean is None or std is None or float(std) == 0:
        return False


    return float(new_amount) > float(mean) + 2 * float(std)


class TransactionPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class TransactionViewSet(viewsets.ModelViewSet):
    """
    ViewSet handling all CRUD operations for the unified Finance Tracker Transaction protocol.
    """
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = TransactionPagination

    def get_queryset(self):
        # Extremely secure isolated querying logic
        qs = Transaction.objects.filter(user=self.request.user)
        txn_type = self.request.query_params.get('transaction_type')
        if txn_type:
            if txn_type.lower() == 'savings':
                qs = qs.filter(transaction_type='SAVING')
            else:
                qs = qs.filter(transaction_type=txn_type.upper())
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)

        txn_type = request.data.get("transaction_type", "EXPENSE")
        amount = request.data.get("amount")

        # Attach alert if anomaly detected
        if txn_type == 'EXPENSE' and detect_anomaly(request.user, amount):
            response.data["alert"] = "⚠️ Unusual expense detected"

        return response

    @action(detail=False, methods=['get'])
    def summary(self, request):
        qs = self.get_queryset()
        
        income = qs.filter(transaction_type='INCOME').aggregate(total=Sum('amount'))['total'] or 0
        expenses = qs.filter(transaction_type='EXPENSE').aggregate(total=Sum('amount'))['total'] or 0
        manual_savings = qs.filter(transaction_type='SAVING').aggregate(total=Sum('amount'))['total'] or 0
        
        income = float(income)
        expenses = float(expenses)
        manual_savings = float(manual_savings)
        
        savings = income - expenses - manual_savings
        
        saving_ratio = 0
        if income > 0:
            saving_ratio = round((savings / income) * 100, 1)
            
        return Response({
            "income": income,
            "expenses": expenses,
            "savings": savings,
            "saving_ratio": saving_ratio
        })

# =========================
# 🔥 AI API (ADD HERE)
# =========================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def predict_category_api(request):
    desc = request.GET.get('desc', '')

    if not desc:
        return Response({"error": "Description required"})

    result = predict_category(desc)
    amount = extract_amount(desc)

    return Response({
        "predicted_category": result["category"],
        "confidence": result["confidence"],
        "amount": amount
    })




# =========================
# 🔥 SPENDING INSIGHT API
# =========================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def spending_insight_api(request):
    user = request.user
    now = datetime.now()
    last_month_date = now - relativedelta(months=1)

    qs = Transaction.objects.filter(user=user)

    this_month = qs.filter(date__month=now.month, date__year=now.year).aggregate(total=Sum('amount'))['total'] or 0
    last_month = qs.filter(date__month=last_month_date.month, date__year=last_month_date.year).aggregate(total=Sum('amount'))['total'] or 0

    this_month = float(this_month)
    last_month = float(last_month)

    change = this_month - last_month

    if change > 0:
        msg = f"Spending increased by ₹{round(change, 2)}"
    elif change < 0:
        msg = f"Spending decreased by ₹{abs(round(change, 2))}"
    else:
        msg = "No major change in spending"

    return Response({"insight": msg})



# =========================
# 🔥 BUDGET PREDICTION API
# =========================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def budget_prediction_api(request):
    user = request.user
    monthly_budget = float(request.GET.get("budget", 0))

    if monthly_budget <= 0:
        return Response({"error": "Provide valid budget"})

    # Get daily expenses
    daily_data = (
        Transaction.objects
        .filter(user=user, transaction_type="EXPENSE")
        .annotate(day=TruncDate('date'))
        .values('day')
        .annotate(total=Sum('amount'))
        .order_by('day')
    )

    daily_expenses = [float(d['total']) for d in daily_data]

    result = predict_budget_exceed(daily_expenses, monthly_budget)

    return Response(result)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def parse_voice_api(request):
    text = request.data.get("text")

    if not text:
        return Response({"error": "Text is required"}, status=400)

    result = parse_voice_text(text)

    return Response(result)


# =========================
# 🔥 FINANCIAL PERSONA API
# =========================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def financial_persona_api(request):
    user = request.user

    # Get transactions
    expenses = Transaction.objects.filter(user=user, transaction_type='EXPENSE')
    incomes = Transaction.objects.filter(user=user, transaction_type='INCOME')

    # ML predictions
    expense_persona = get_expense_persona(expenses)
    income_persona = get_income_persona(incomes)

    return Response({
        "expense_persona": expense_persona,
        "income_persona": income_persona
    })

# =========================
# 🤖 CHATBOT API (Text)
# =========================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def chat_api(request):
    """
    Text chatbot endpoint.
    POST body: { "message": "...", "session_id": "...", "voice_output": bool }
    Returns:   { "reply": "...", "audio_base64": "..." | null }
    """
    from .chatboat.response_handler import handle_chat

    message      = request.data.get("message", "").strip()
    session_id   = request.data.get("session_id", "default")
    voice_output = bool(request.data.get("voice_output", False))

    if not message:
        return Response({"error": "Message is required"}, status=400)

    try:
        result = handle_chat(request.user, message, session_id, voice_output=voice_output)
        return Response(result)
    except Exception as e:
        return Response({"error": str(e)}, status=500)


# =========================
# 🎙️ VOICE CHAT API (Audio → Text → AI → Audio)
# =========================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def voice_chat_api(request):
    """
    Full voice pipeline endpoint:
      1. Accepts an audio file upload (WebM/WAV from the browser MediaRecorder)
      2. Transcribes audio → text using Google Speech Recognition
      3. Runs the full chatbot pipeline
      4. Returns the AI reply text + base64 TTS audio

    POST: multipart/form-data
      - audio      : audio file blob
      - session_id : session string
    Response: { "transcript": "...", "reply": "...", "audio_base64": "..." }
    """
    from .chatboat.response_handler import handle_chat
    from .chatboat.voice_handler    import transcribe_audio

    audio_file = request.FILES.get("audio")
    session_id = request.data.get("session_id", "default")

    if not audio_file:
        return Response({"error": "Audio file is required"}, status=400)

    try:
        # Step 1: Read raw audio bytes
        audio_bytes = audio_file.read()

        # Step 2: Transcribe audio → text
        transcript = transcribe_audio(audio_bytes, content_type=audio_file.content_type)

        if not transcript:
            return Response({"error": "Could not understand the audio. Please speak clearly."}, status=422)

        # Step 3 + 4: Run chatbot + generate TTS output
        result = handle_chat(request.user, transcript, session_id, voice_output=True)

        return Response({
            "transcript":   transcript,
            "reply":        result["reply"],
            "audio_base64": result["audio_base64"],
        })

    except Exception as e:
        return Response({"error": str(e)}, status=500)