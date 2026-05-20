import time
import numpy as np
from django.contrib.auth import get_user_model
from django.db import transaction

from ..models import PredictionLog
from .model_loader import ModelLoader
from .preprocessing_service import PreprocessingService

User = get_user_model()

class PredictionService:
    def __init__(self):
        self.loader = ModelLoader()

    def predict_nlp(self, text, user=None):
        """
        Executes inference for the NLP Text Classifier.
        """
        start_time = time.time()
        status = "success"
        error_msg = ""
        result = {}
        confidence = None

        try:
            # Load models
            vectorizer = self.loader.get_nlp_vectorizer()
            model = self.loader.get_nlp_model()

            # Preprocess text
            features = PreprocessingService.preprocess_text(text, vectorizer)

            # Check for feature dimension mismatch
            if hasattr(model, "n_features_in_"):
                expected_features = model.n_features_in_
                current_features = features.shape[1]
                if current_features < expected_features:
                    features = np.pad(features, ((0, 0), (0, expected_features - current_features)), mode='constant')
                elif current_features > expected_features:
                    features = features[:, :expected_features]

            # Inference
            prediction = model.predict(features)[0]
            
            # Retrieve class probabilities if supported
            probabilities = None
            if hasattr(model, "predict_proba"):
                probs = model.predict_proba(features)[0]
                classes = model.classes_
                probabilities = {str(c): float(p) for c, p in zip(classes, probs)}
                confidence = float(np.max(probs))

            # Format outputs
            result = {
                "prediction": str(prediction),
                "probabilities": probabilities,
            }
        except Exception as e:
            status = "failed"
            error_msg = str(e)
            result = {"error": error_msg}

        execution_time_ms = (time.time() - start_time) * 1000

        # Log prediction to DB
        with transaction.atomic():
            PredictionLog.objects.create(
                user=user,
                model_name="nlp",
                input_summary=text[:100],
                prediction_result=result,
                confidence=confidence,
                execution_time_ms=execution_time_ms,
                status=status,
                error_message=error_msg
            )

        if status == "failed":
            raise Exception(error_msg)

        return {
            "success": True,
            "model": "nlp",
            "prediction": result["prediction"],
            "probabilities": result["probabilities"],
            "confidence": confidence,
            "execution_time_ms": execution_time_ms
        }

    def predict_face(self, image_bytes, user=None):
        """
        Executes inference for the Face Recognition Model.
        """
        start_time = time.time()
        status = "success"
        error_msg = ""
        result = {}
        confidence = None

        try:
            # Load models
            model = self.loader.get_face_model()
            encoder = self.loader.get_face_encoder()

            # Get target shape from model
            target_shape = model.input_shape

            # Preprocess image
            features = PreprocessingService.preprocess_image(image_bytes, target_shape)

            # Inference
            raw_prediction = model.predict(features)[0]
            
            # Decode output class
            # raw_prediction is a vector of probabilities
            predicted_class_idx = int(np.argmax(raw_prediction))
            confidence = float(raw_prediction[predicted_class_idx])
            
            # Decode using label encoder if available, else use index
            if encoder and hasattr(encoder, "inverse_transform"):
                predicted_label = str(encoder.inverse_transform([predicted_class_idx])[0])
                all_classes = encoder.classes_
                probabilities = {str(c): float(p) for c, p in zip(all_classes, raw_prediction)}
            else:
                predicted_label = f"Class {predicted_class_idx}"
                probabilities = {f"Class {i}": float(p) for i, p in enumerate(raw_prediction)}

            result = {
                "prediction": predicted_label,
                "probabilities": probabilities
            }
        except Exception as e:
            status = "failed"
            error_msg = str(e)
            result = {"error": error_msg}

        execution_time_ms = (time.time() - start_time) * 1000

        # Log prediction to DB
        with transaction.atomic():
            PredictionLog.objects.create(
                user=user,
                model_name="face",
                input_summary=f"Image upload - length: {len(image_bytes)} bytes",
                prediction_result=result,
                confidence=confidence,
                execution_time_ms=execution_time_ms,
                status=status,
                error_message=error_msg
            )

        if status == "failed":
            raise Exception(error_msg)

        return {
            "success": True,
            "model": "face",
            "prediction": result["prediction"],
            "probabilities": result["probabilities"],
            "confidence": confidence,
            "execution_time_ms": execution_time_ms
        }

    def predict_speech(self, audio_bytes, user=None):
        """
        Executes inference for the Speech Classification Model.
        """
        start_time = time.time()
        status = "success"
        error_msg = ""
        result = {}
        confidence = None

        try:
            # Load models
            model = self.loader.get_speech_model()
            encoder = self.loader.get_speech_encoder()

            # Get target shape from model
            target_shape = model.input_shape

            # Preprocess audio
            features = PreprocessingService.preprocess_audio(audio_bytes, target_shape)

            # Inference
            raw_prediction = model.predict(features)[0]
            
            # Decode output class
            predicted_class_idx = int(np.argmax(raw_prediction))
            confidence = float(raw_prediction[predicted_class_idx])
            
            # Decode using label encoder if available
            if encoder and hasattr(encoder, "inverse_transform"):
                predicted_label = str(encoder.inverse_transform([predicted_class_idx])[0])
                all_classes = encoder.classes_
                probabilities = {str(c): float(p) for c, p in zip(all_classes, raw_prediction)}
            else:
                predicted_label = f"Class {predicted_class_idx}"
                probabilities = {f"Class {i}": float(p) for i, p in enumerate(raw_prediction)}

            result = {
                "prediction": predicted_label,
                "probabilities": probabilities
            }
        except Exception as e:
            status = "failed"
            error_msg = str(e)
            result = {"error": error_msg}

        execution_time_ms = (time.time() - start_time) * 1000

        # Log prediction to DB
        with transaction.atomic():
            PredictionLog.objects.create(
                user=user,
                model_name="speech",
                input_summary=f"Audio upload - length: {len(audio_bytes)} bytes",
                prediction_result=result,
                confidence=confidence,
                execution_time_ms=execution_time_ms,
                status=status,
                error_message=error_msg
            )

        if status == "failed":
            raise Exception(error_msg)

        return {
            "success": True,
            "model": "speech",
            "prediction": result["prediction"],
            "probabilities": result["probabilities"],
            "confidence": confidence,
            "execution_time_ms": execution_time_ms
        }
