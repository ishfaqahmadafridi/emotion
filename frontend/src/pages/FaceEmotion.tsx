import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, AlertCircle, Loader2 } from 'lucide-react';
import { useAnalyzeFaceMutation } from '../store/services/emotionApi';

export default function FaceEmotion() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [analyzeFace, { data, isLoading, error }] = useAnalyzeFaceMutation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    try {
      await analyzeFace(file).unwrap();
    } catch (err) {
      console.error('Failed to analyze face', err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Facial Emotion Analysis</h1>
        <p className="text-gray-400">Upload an image to detect the dominant facial expression using our CNN model.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[var(--color-border)] rounded-xl p-8 text-center cursor-pointer hover:bg-[var(--color-border)]/20 hover:border-[var(--color-primary)] transition-all group"
          >
            <input 
              type="file" 
              className="hidden" 
              accept="image/*" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
            />
            {preview ? (
              <div className="relative aspect-square w-full max-w-[240px] mx-auto rounded-lg overflow-hidden border border-gray-700">
                <img src={preview} alt="Upload preview" className="object-cover w-full h-full" />
              </div>
            ) : (
              <div className="space-y-4 py-8">
                <div className="w-16 h-16 bg-gray-800 rounded-full mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8 text-gray-400" />
                </div>
                <div>
                  <p className="font-medium">Click to upload image</p>
                  <p className="text-sm text-gray-500 mt-1">JPEG, PNG up to 5MB</p>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={handleAnalyze}
            disabled={!file || isLoading}
            className="w-full bg-[var(--color-primary)] hover:bg-blue-600 text-white font-medium py-3 rounded-lg flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Analyze Emotion'}
          </button>
        </div>

        <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-6 flex flex-col">
          <h2 className="text-xl font-semibold mb-4">Results</h2>
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg flex gap-3 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>Failed to connect to the prediction engine. Ensure the Django backend is running.</p>
            </div>
          )}
          
          {!data && !error && !isLoading && (
            <div className="flex-1 flex items-center justify-center text-gray-500 text-sm italic">
              Upload an image and run analysis to see results here.
            </div>
          )}

          {data && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2 py-6 border-b border-gray-800">
                <p className="text-sm uppercase tracking-wider text-gray-400 font-semibold">Detected Emotion</p>
                <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500 capitalize pb-2">
                  {data.prediction}
                </div>
                <div className="text-gray-400 text-sm">
                  Confidence: {(data.confidence * 100).toFixed(1)}%
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Emotion Probabilities</h3>
                {data.probabilities && Object.entries(data.probabilities).map(([emotion, prob]) => (
                  <div key={emotion} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize">{emotion.replace(' (Mock)', '')}</span>
                      <span className="font-medium text-gray-400">{(prob * 100).toFixed(1)}%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(prob as number) * 100}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className={`h-full rounded-full ${emotion === data.prediction ? 'bg-blue-500' : 'bg-gray-600'}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}