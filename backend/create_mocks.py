import pickle
import numpy as np
from sklearn.preprocessing import LabelEncoder
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.linear_model import LogisticRegression
import os

try:
    from tensorflow.keras.models import Sequential
    from tensorflow.keras.layers import Dense, Flatten, Input
    
    def create_dummy_keras_model(input_shape, num_classes, path):
        model = Sequential([
            Input(shape=input_shape),
            Flatten(),
            Dense(num_classes, activation='softmax')
        ])
        model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
        model.save(path)
        print(f"Created {path}")

    # Ensure backend path is used
    models_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'apps', 'ml_models', 'ml', 'trained_models')
    os.makedirs(models_dir, exist_ok=True)

    # 1. vectorizer.pkl
    vect = CountVectorizer()
    vectorizer_path = os.path.join(models_dir, 'vectorizer.pkl')
    vect.fit(["dummy text for fitting"])
    with open(vectorizer_path, 'wb') as f:
        pickle.dump(vect, f)
    print(f"Created {vectorizer_path}")

    # 2. face_model.h5
    # typical shapes: 48x48x1 or 224x224x3. We will try 224x224x3 as it is standard ResNet/VGG
    face_model_path = os.path.join(models_dir, 'face_model.h5')
    create_dummy_keras_model((48, 48, 1), 7, face_model_path)

    # 3. speech_model.h5
    speech_model_path = os.path.join(models_dir, 'speech_model.h5')
    create_dummy_keras_model((162, 1), 6, speech_model_path) # Example

    # 4. speech_encoder.pkl
    speech_enc_path = os.path.join(models_dir, 'speech_encoder.pkl')
    enc = LabelEncoder()
    enc.fit(["angry", "calm", "fearful", "happy", "sad", "disgust"])
    with open(speech_enc_path, 'wb') as f:
        pickle.dump(enc, f)
    print(f"Created {speech_enc_path}")

except Exception as e:
    import traceback
    traceback.print_exc()
