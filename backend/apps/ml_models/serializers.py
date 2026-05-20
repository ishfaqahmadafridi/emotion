from rest_framework import serializers
from .models import PredictionLog

class NLPRequestSerializer(serializers.Serializer):
    text = serializers.CharField(required=True, min_length=2, max_length=5000)


class FileUploadRequestSerializer(serializers.Serializer):
    file = serializers.FileField(required=True)


class PredictionLogSerializer(models_serializer := serializers.ModelSerializer):
    user_email = serializers.EmailField(source="user.email", read_only=True)
    model_name_display = serializers.CharField(source="get_model_name_display", read_only=True)

    class Meta:
        model = PredictionLog
        fields = (
            "id",
            "user",
            "user_email",
            "model_name",
            "model_name_display",
            "input_summary",
            "prediction_result",
            "confidence",
            "execution_time_ms",
            "status",
            "error_message",
            "created_at"
        )
        read_only_fields = fields
