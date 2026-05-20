import io
import numpy as np
from PIL import Image
import soundfile as sf
import librosa

class PreprocessingService:
    @staticmethod
    def preprocess_text(text, vectorizer):
        """
        Cleans and vectorizes text using the loaded vectorizer.
        """
        cleaned_text = str(text).strip().lower()
        # Vectorize using the scikit-learn vectorizer (typically TfidfVectorizer or CountVectorizer)
        vector = vectorizer.transform([cleaned_text])
        # Convert sparse matrix to dense array if needed
        if hasattr(vector, "toarray"):
            vector = vector.toarray()
        return vector

    @staticmethod
    def preprocess_image(image_bytes, target_shape):
        """
        Loads image, resizes it dynamically based on the model's target shape, and normalizes it.
        target_shape is typically (None, height, width, channels) or (height, width)
        """
        # Load image via PIL
        image = Image.open(io.BytesIO(image_bytes))
        
        # Ensure RGB
        if image.mode != "RGB":
            image = image.convert("RGB")
            
        # Parse target dimensions
        # target_shape is e.g. (None, 224, 224, 3) or (224, 224, 3)
        h, w = 160, 160  # Default fallback
        c = 3
        if target_shape:
            # Filter out None from shape
            clean_shape = [dim for dim in target_shape if dim is not None]
            if len(clean_shape) >= 2:
                h, w = clean_shape[0], clean_shape[1]
            if len(clean_shape) == 3:
                c = clean_shape[2]
                
        # Resize image
        image = image.resize((w, h))
        
        # Convert to numpy array
        img_array = np.array(image, dtype=np.float32)
        
        # Normalize to [0, 1] or appropriate range
        img_array /= 255.0
        
        # Handle grayscale if channels == 1
        if c == 1:
            img_array = np.mean(img_array, axis=-1, keepdims=True)
            
        # Add batch dimension: (1, height, width, channels)
        img_array = np.expand_dims(img_array, axis=0)
        return img_array

    @staticmethod
    def preprocess_audio(audio_bytes, target_shape):
        """
        Loads audio from bytes, extracts MFCCs or appropriate features,
        and reshapes to match target_shape of the speech model.
        """
        # Read audio bytes using soundfile and librosa
        audio_file = io.BytesIO(audio_bytes)
        y, sr = librosa.load(audio_file, sr=None)
        
        # Extract features (e.g. MFCCs)
        # Default target feature size if not specified
        feature_size = 40
        if target_shape:
            clean_shape = [dim for dim in target_shape if dim is not None]
            if len(clean_shape) > 0:
                feature_size = clean_shape[-1]
                
        # Extract MFCCs
        mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=feature_size)
        
        # Take the mean across the time steps to form a static feature vector (or keep time steps if model requires sequential)
        # Let's inspect what the model expects: 
        # Case A: Model expects (None, 40) - static mean MFCCs
        # Case B: Model expects (None, time_steps, 40) - sequential MFCCs
        # Case C: Model expects (None, 40, 1) - CNN input
        
        # Compute mean across time
        mfccs_processed = np.mean(mfccs.T, axis=0)  # Shape: (feature_size,)
        
        # Format based on target shape dimensions
        if target_shape:
            clean_shape = [dim for dim in target_shape if dim is not None]
            num_dims = len(clean_shape)
            
            if num_dims == 1:
                # Expects (feature_size,)
                features = np.expand_dims(mfccs_processed, axis=0)
            elif num_dims == 2:
                # Expects (time_steps, feature_size) -> let's pad/truncate raw mfccs
                time_steps = clean_shape[0]
                # mfccs shape is (feature_size, raw_time_steps) -> transpose to (raw_time_steps, feature_size)
                transposed = mfccs.T
                if transposed.shape[0] < time_steps:
                    # Pad
                    padded = np.zeros((time_steps, feature_size))
                    padded[:transposed.shape[0], :] = transposed
                    features = np.expand_dims(padded, axis=0)
                else:
                    # Truncate
                    features = np.expand_dims(transposed[:time_steps, :], axis=0)
            elif num_dims == 3:
                # Expects e.g. (feature_size, time_steps, 1) or similar. 
                # Let's default to (1, feature_size, 1) or shape matching input
                # For safety: reshape to match the exact tuple shapes
                # We can construct target shape list and pad/tile mfccs_processed
                # Or if it's (feature_size, 1), expand dims
                features = mfccs_processed
                for dim in clean_shape:
                    if dim == 1:
                        features = np.expand_dims(features, axis=-1)
                features = np.expand_dims(features, axis=0)
            else:
                features = np.expand_dims(mfccs_processed, axis=0)
        else:
            features = np.expand_dims(mfccs_processed, axis=0)
            
        return features.astype(np.float32)
