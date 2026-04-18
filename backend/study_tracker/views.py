from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Category, StudyLog
from .serializers import CategorySerializer, StudyLogSerializer

# Get all categories
@api_view(['GET'])
def get_categories(request):
    categories = Category.objects.all()
    serializer = CategorySerializer(categories, many=True)
    return Response(serializer.data)

# Create new category
@api_view(['POST'])
def create_category(request):
    serializer = CategorySerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)
    
# Get all logs
@api_view(['GET'])
def get_all_logs(request):
    # select_related prevents the N+1 query problem by joining the Category table SQL
    logs = StudyLog.objects.select_related('category').all()
    serializer = StudyLogSerializer(logs, many=True)
    return Response(serializer.data)

# Get logs by category
@api_view(['GET'])
def get_logs(request, category_id):
    logs = StudyLog.objects.filter(category_id=category_id)
    serializer = StudyLogSerializer(logs, many=True)
    return Response(serializer.data)

# Add new study log
@api_view(['POST'])
def create_log(request):
    serializer = StudyLogSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)

# Update existing study log
@api_view(['PATCH'])
def update_log(request, log_id):
    try:
        log = StudyLog.objects.get(id=log_id)
    except StudyLog.DoesNotExist:
        return Response({'error': 'Study log not found'}, status=404)
        
    serializer = StudyLogSerializer(log, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=200)
    return Response(serializer.errors, status=400)