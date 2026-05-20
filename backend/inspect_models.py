import os
import sys

# Ensure backend path is in sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.development")

import django
django.setup()

from apps.ml_models.services.model_loader import ModelLoader

loader = ModelLoader()

print("--- Inspecting Vectorizer & NLP model ---")
try:
    vectorizer = loader.get_nlp_vectorizer()
    nlp = loader.get_nlp_model()
    print("Vectorizer Type:", type(vectorizer))
    print("NLP Model Type:", type(nlp))
    if hasattr(vectorizer, "get_feature_names_out"):
        print("Vectorizer features length:", len(vectorizer.get_feature_names_out()))
    if hasattr(nlp, "classes_"):
        print("NLP Model classes:", nlp.classes_)
except Exception as e:
    print("Error inspecting NLP:", e)

print("\n--- Inspecting Face Encoder & Model ---")
try:
    face_enc = loader.get_face_encoder()
    print("Face Encoder Type:", type(face_enc))
    if hasattr(face_enc, "classes_"):
        print("Face classes:", face_enc.classes_)
    
    face_model = loader.get_face_model()
    print("Face Model Input Shape:", face_model.input_shape)
    print("Face Model Output Shape:", face_model.output_shape)
except Exception as e:
    print("Error inspecting Face:", e)

print("\n--- Inspecting Speech Encoder & Model ---")
try:
    speech_enc = loader.get_speech_encoder()
    print("Speech Encoder Type:", type(speech_enc))
    if hasattr(speech_enc, "classes_"):
        print("Speech classes:", speech_enc.classes_)
        
    speech_model = loader.get_speech_model()
    print("Speech Model Input Shape:", speech_model.input_shape)
    print("Speech Model Output Shape:", speech_model.output_shape)
except Exception as e:
    print("Error inspecting Speech:", e)
