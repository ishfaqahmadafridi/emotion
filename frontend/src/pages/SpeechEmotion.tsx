import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mic, Upload, AlertCircle, Loader2, Square } from 'lucide-react';
import { useAnalyzeSpeechMutation } from '../store/services/emotionApi';

export default function SpeechEmotion() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<'upload' | 'record'>('upload');
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  
  const [analyzeSpeech, { data, isLoading, error }] = useAnalyzeSpeechMutation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };

      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        // Create a File object from the Blob
        const audioFile = new File([audioBlob], 'voice_note.wav', { type: 'audio/wav' });
        setFile(audioFile);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      setFile(null); // Clear previous file
    } catch (err) {
      console.error('Microphone access denied or error:', err);
      alert("Microphone access is required to record audio.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state === "recording") {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  };

  const clearFile = () => {
    setFile(null);
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
        <p className="text-gray-400">Process audio files or record Voice notes to extract acoustic features and determine speech tonality.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          {/* Mode Switcher */}
          <div className="flex bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg p-1">
            <button 
              onClick={() => setMode('upload')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-colors ${mode === 'upload' ? 'bg-[var(--color-primary)] text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
            >
              <Upload className="w-4 h-4" /> Upload
            </button>
            <button 
              onClick={() => setMode('record')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-colors ${mode === 'record' ? 'bg-[var(--color-primary)] text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
            >
              <Mic className="w-4 h-4" /> Record
            </button>
          </div>

          <div className="border-2 border-dashed border-[var(--color-border)] rounded-xl min-h-[240px] flex items-center justify-center transition-all bg-[var(--color-card)] relative overflow-hidden">
            {mode === 'upload' ? (
              <div 
                onClick={() => !file && fileInputRef.current?.click()}
                className={`w-full h-full p-8 text-center flex flex-col items-center justify-center ${!file ? 'cursor-pointer hover:bg-[var(--color-border)]/20 hover:border-[var(--color-primary)] group' : ''}`}
              >
                <input type="file" className="hidden" accept="audio/*" ref={fileInputRef} onChange={handleFileChange} />
                {file ? (
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-[var(--color-primary)]/20 rounded-full mx-auto flex items-center justify-center text-[var(--color-primary)]">
                      <Mic className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{file.name}</p>
                      <p className="text-sm text-gray-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button onClick={clearFile} className="text-xs text-red-400 hover:text-red-300 underline mt-2 block mx-auto">Remove</button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-gray-800 rounded-full mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Upload className="w-8 h-8 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-medium">Upload Audio File</p>
                      <p className="text-sm text-gray-500 mt-1">WAV, MP3, M4A up to 10MB</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-full p-8 flex flex-col items-center justify-center">
                {isRecording ? (
                  <div className="space-y-6 text-center w-full">
                    <div className="flex justify-center">
                      <motion.div 
                        animate={{ scale: [1, 1.2, 1] }} 
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center text-red-500"
                      >
                        <div className="w-8 h-8 bg-red-500 rounded-full"></div>
                      </motion.div>
                    </div>
                    <p className="text-red-400 font-medium animate-pulse">Recording logic in progress...</p>
                    <button 
                      onClick={stopRecording}
                      className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full flex items-center gap-2 mx-auto transition-colors"
                    >
                      <Square className="w-4 h-4 fill-current" /> Stop Recording
                    </button>
                  </div>
                ) : file ? (
                  <div className="space-y-4 text-center">
                    <div className="w-16 h-16 bg-emerald-500/20 rounded-full mx-auto flex items-center justify-center text-emerald-500">
                      <Mic className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{file.name}</p>
                      <p className="text-sm text-gray-500 mt-1 pl-1">Recorded Audio ready</p>
                    </div>
                    <div className="flex gap-3 justify-center mt-2">
                       <button onClick={startRecording} className="text-xs text-blue-400 hover:text-blue-300 underline">Record Again</button>
                       <button onClick={clearFile} className="text-xs text-red-400 hover:text-red-300 underline">Remove</button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 text-center">
                    <div className="w-16 h-16 bg-[var(--color-primary)]/20 rounded-full mx-auto flex items-center justify-center">
                      <Mic className="w-8 h-8 text-[var(--color-primary)]" />
                    </div>
                    <div>
                      <p className="font-medium">Record Voice Note</p>
                      <p className="text-sm text-gray-500 mt-1">Press below to start microphone</p>
                    </div>
                    <button 
                      onClick={startRecording}
                      className="bg-[var(--color-primary)] hover:bg-blue-600 text-white px-6 py-2 rounded-full flex items-center gap-2 mx-auto transition-colors"
                    >
                      <Mic className="w-4 h-4" /> Start Recording
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!file || isLoading || isRecording}
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
              <div className="text-center space-y-2 py-6 border-b border-gray-800">
                <p className="text-sm uppercase tracking-wider text-gray-400 font-semibold">Tonality Detected</p>
                <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 capitalize pb-2">
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
                        className={`h-full rounded-full ${emotion === data.prediction ? 'bg-purple-500' : 'bg-gray-600'}`}
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