from django.urls import path
from .views import (
    PredictNLPView,
    PredictFaceView,
    PredictSpeechView,
    PredictionHistoryView,
    MLStatsView
)

urlpatterns = [
    path("predict-nlp/", PredictNLPView.as_view(), name="ml_predict_nlp"),
    path("predict-face/", PredictFaceView.as_view(), name="ml_predict_face"),
    path("predict-speech/", PredictSpeechView.as_view(), name="ml_predict_speech"),
    path("history/", PredictionHistoryView.as_view(), name="ml_history"),
    path("stats/", MLStatsView.as_view(), name="ml_stats"),
]
