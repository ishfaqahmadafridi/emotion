import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mic, Upload, AlertCircle, Loader2 } from 'lucide-react';
import { useAnalyzeSpeechMutation } from '../store/services/emotionApi';

export default function SpeechEmotion() {
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [analyzeSpeech, { data, isLoading, error }] = useAnalyzeSpeechMutation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    try {
      await analyzeSpeech(file).unwrap();
    } catch (err) {
      console.error('Failed to analyze speech', err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Vocal Emotion Recognition</h1>
        <p className="text-gray-400">Process audio files to extract acoustic features and determine speech tonality.</p>
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
              accept="audio/*" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
            />
            {file ? (
              <div className="space-y-4 py-8">
                <div className="w-16 h-16 bg-[var(--color-primary)]/20 rounded-full mx-auto flex items-center justify-center text-[var(--color-primary)]">
                  <Mic className="w-8 h-8" />
                </div>
                <div>
                  <p className="font-medium text-white">{file.name}</p>
                  <p className="text-sm text-gray-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 py-8">
                <div className="w-16 h-16 bg-gray-800 rounded-full mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8 text-gray-400" />
                </div>
                <div>
                  <p className="font-medium">Upload Audio File</p>
                  <p className="text-sm text-gray-500 mt-1">WAV, MP3 up to 10MB</p>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={handleAnalyze}
            disabled={!file || isLoading}
            className="w-full bg-[var(--color-primary)] hover:bg-blue-600 text-white font-medium py-3 rounded-lg flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Analyze Audio'}
          </button>
        </div>

        <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-6 flex flex-col">
          <h2 className="text-xl font-semibold mb-4">Results</h2>
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg flex gap-3 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>Prediction failed. Verify the backend and model files are available.</p>
            </div>
          )}
          
          {!data && !error && !isLoading && (
            <div className="flex-1 flex items-center justify-center text-gray-500 text-sm italic">
              Awaiting audio file submission to show emotion spectrum.
            </div>
          )}

          {data && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2 py-6">
                <p className="text-sm uppercase tracking-wider text-gray-400 font-semibold">Tonality Detected</p>
                <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 capitalize">
                  {data.emotion}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Match Accuracy</span>
                  <span className="font-medium">{(data.confidence * 100).toFixed(1)}%</span>
                </div>
                <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${data.confidence * 100}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full bg-purple-500 rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}