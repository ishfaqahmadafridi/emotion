from django.db import models
from django.conf import settings

class PredictionLog(models.Model):
    MODEL_CHOICES = (
        ("face", "Face Recognition/Analysis"),
        ("nlp", "NLP Text Analysis"),
        ("speech", "Speech Emotion/Audio Analysis"),
    )
    
    STATUS_CHOICES = (
        ("success", "Success"),
        ("failed", "Failed"),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="predictions"
    )
    model_name = models.CharField(max_length=20, choices=MODEL_CHOICES)
    input_summary = models.CharField(max_length=255, blank=True)  # concise info of input (e.g. text snippet, audio filename, image resolution)
    prediction_result = models.JSONField(null=True, blank=True)
    confidence = models.FloatField(null=True, blank=True)
    execution_time_ms = models.FloatField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="success")
    error_message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.get_model_name_display()} - {self.status} ({self.created_at})"
