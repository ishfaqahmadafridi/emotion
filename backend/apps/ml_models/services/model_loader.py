import os
import joblib
import threading
from django.conf import settings

class ModelLoader:
    _instance = None
    _lock = threading.Lock()

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            with cls._lock:
                if not cls._instance:
                    cls._instance = super(ModelLoader, cls).__new__(cls)
                    cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if getattr(self, "_initialized", False):
            return
        self._initialized = True
        self._models = {}
        self._lock = threading.Lock()

    def _get_model_path(self, filename):
        return os.path.join(settings.ML_MODELS_DIR, filename)

    def load_keras_model(self, model_key, filename):
        if model_key in self._models:
            return self._models[model_key]

        with self._lock:
            if model_key in self._models:
                return self._models[model_key]

            # Lazy import Keras / TensorFlow so booting is fast
            from tensorflow.keras.models import load_model
            path = self._get_model_path(filename)
            if not os.path.exists(path):
                raise FileNotFoundError(f"Model file not found at {path}")
            
            self._models[model_key] = load_model(path)
            return self._models[model_key]

    def load_pickle_model(self, model_key, filename):
        if model_key in self._models:
            return self._models[model_key]

        with self._lock:
            if model_key in self._models:
                return self._models[model_key]

            path = self._get_model_path(filename)
            if not os.path.exists(path):
                raise FileNotFoundError(f"Model file not found at {path}")
            
            self._models[model_key] = joblib.load(path)
            return self._models[model_key]


    def get_face_model(self):
        return self.load_keras_model("face_model", "face_model.h5")

    def get_face_encoder(self):
        return self.load_pickle_model("face_encoder", "face_encoder.pkl")

    def get_nlp_model(self):
        return self.load_pickle_model("nlp_model", "nlp_model.pkl")

    def get_nlp_vectorizer(self):
        return self.load_pickle_model("nlp_vectorizer", "vectorizer.pkl")

    def get_speech_model(self):
        return self.load_keras_model("speech_model", "speech_model.h5")

    def get_speech_encoder(self):
        return self.load_pickle_model("speech_encoder", "speech_encoder.pkl")
