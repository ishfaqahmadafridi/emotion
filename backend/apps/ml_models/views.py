from rest_framework import status, permissions, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.db.models import Avg, Count
from django.utils import timezone
from datetime import timedelta

from .models import PredictionLog
from .serializers import (
    NLPRequestSerializer,
    FileUploadRequestSerializer,
    PredictionLogSerializer
)
from .services.prediction_service import PredictionService

class PredictNLPView(APIView):
    permission_classes = (permissions.AllowAny,)
    parser_classes = (JSONParser,)

    def post(self, request):
        serializer = NLPRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        text = serializer.validated_data["text"]
        
        service = PredictionService()
        user = request.user if request.user.is_authenticated else None
        result = service.predict_nlp(text, user=user)
        return Response(result, status=status.HTTP_200_OK)


class PredictFaceView(APIView):
    permission_classes = (permissions.AllowAny,)
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request):
        serializer = FileUploadRequestSerializer(data=request.FILES)
        serializer.is_valid(raise_exception=True)
        uploaded_file = serializer.validated_data["file"]
        
        # Read file bytes
        image_bytes = uploaded_file.read()
        
        service = PredictionService()
        user = request.user if request.user.is_authenticated else None
        result = service.predict_face(image_bytes, user=user)
        return Response(result, status=status.HTTP_200_OK)


class PredictSpeechView(APIView):
    permission_classes = (permissions.AllowAny,)
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request):
        serializer = FileUploadRequestSerializer(data=request.FILES)
        serializer.is_valid(raise_exception=True)
        uploaded_file = serializer.validated_data["file"]
        
        # Read file bytes
        audio_bytes = uploaded_file.read()
        
        service = PredictionService()
        user = request.user if request.user.is_authenticated else None
        result = service.predict_speech(audio_bytes, user=user)
        return Response(result, status=status.HTTP_200_OK)


class PredictionHistoryView(generics.ListAPIView):
    serializer_class = PredictionLogSerializer
    permission_classes = (permissions.AllowAny,)

    def get_queryset(self):
        if self.request.user.is_authenticated:
            return PredictionLog.objects.filter(user=self.request.user).order_by('-created_at')
        return PredictionLog.objects.all().order_by('-created_at')


class MLStatsView(APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request):
        if request.user.is_authenticated:
            logs = PredictionLog.objects.filter(user=request.user)
        else:
            logs = PredictionLog.objects.all()
        
        # Aggregate calculations
        total_predictions = logs.count()
        avg_latency = logs.aggregate(Avg("execution_time_ms"))["execution_time_ms__avg"] or 0
        
        # Success and Failure count
        status_counts = logs.values("status").annotate(count=Count("status"))
        success_count = sum(item["count"] for item in status_counts if item["status"] == "success")
        failed_count = sum(item["count"] for item in status_counts if item["status"] == "failed")
        
        # Count by models
        model_counts = logs.values("model_name").annotate(count=Count("model_name"))
        model_stats = {
            "face": sum(item["count"] for item in model_counts if item["model_name"] == "face"),
            "nlp": sum(item["count"] for item in model_counts if item["model_name"] == "nlp"),
            "speech": sum(item["count"] for item in model_counts if item["model_name"] == "speech")
        }

        # Daily usage for the last 7 days
        today = timezone.now().date()
        daily_usage = []
        for i in range(6, -1, -1):
            date = today - timedelta(days=i)
            day_count = logs.filter(created_at__date=date).count()
            daily_usage.append({
                "date": date.strftime("%b %d"),
                "predictions": day_count
            })

        return Response({
            "total_predictions": total_predictions,
            "success_rate": round((success_count / total_predictions * 100), 1) if total_predictions > 0 else 100.0,
            "avg_latency_ms": round(avg_latency, 2),
            "model_stats": model_stats,
            "success_count": success_count,
            "failed_count": failed_count,
            "daily_usage": daily_usage
        }, status=status.HTTP_200_OK)
