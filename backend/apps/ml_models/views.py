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
    permission_classes = (permissions.IsAuthenticated,)
    parser_classes = (JSONParser,)

    def post(self, request):
        serializer = NLPRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        text = serializer.validated_data["text"]
        
        service = PredictionService()
        result = service.predict_nlp(text, user=request.user)
        return Response(result, status=status.HTTP_200_OK)


class PredictFaceView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request):
        serializer = FileUploadRequestSerializer(data=request.FILES)
        serializer.is_valid(raise_exception=True)
        uploaded_file = serializer.validated_data["file"]
        
        # Read file bytes
        image_bytes = uploaded_file.read()
        
        service = PredictionService()
        result = service.predict_face(image_bytes, user=request.user)
        return Response(result, status=status.HTTP_200_OK)


class PredictSpeechView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request):
        serializer = FileUploadRequestSerializer(data=request.FILES)
        serializer.is_valid(raise_exception=True)
        uploaded_file = serializer.validated_data["file"]
        
        # Read file bytes
        audio_bytes = uploaded_file.read()
        
        service = PredictionService()
        result = service.predict_speech(audio_bytes, user=request.user)
        return Response(result, status=status.HTTP_200_OK)


class PredictionHistoryView(generics.ListAPIView):
    serializer_class = PredictionLogSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        # Return only the current user's logs
        return PredictionLog.objects.filter(user=self.request.user)


class MLStatsView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        user_logs = PredictionLog.objects.filter(user=request.user)
        
        # Aggregate calculations
        total_predictions = user_logs.count()
        avg_latency = user_logs.aggregate(Avg("execution_time_ms"))["execution_time_ms__avg"] or 0
        
        # Success and Failure count
        status_counts = user_logs.values("status").annotate(count=Count("status"))
        success_count = sum(item["count"] for item in status_counts if item["status"] == "success")
        failed_count = sum(item["count"] for item in status_counts if item["status"] == "failed")
        
        # Count by models
        model_counts = user_logs.values("model_name").annotate(count=Count("model_name"))
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
            # Filter logs on this date
            day_count = user_logs.filter(created_at__date=date).count()
            daily_usage.append({
                "date": date.strftime("%Y-%m-%d"),
                "predictions": day_count
            })

        return Response({
            "total_predictions": total_predictions,
            "success_rate": (success_count / total_predictions * 100) if total_predictions > 0 else 100.0,
            "avg_latency_ms": round(avg_latency, 2),
            "model_stats": model_stats,
            "success_count": success_count,
            "failed_count": failed_count,
            "daily_usage": daily_usage
        }, status=status.HTTP_200_OK)
