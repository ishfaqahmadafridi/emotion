import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, AlertCircle, Loader2 } from 'lucide-react';
import { useAnalyzeTextMutation } from '../store/services/emotionApi';

export default function TextEmotion() {
  const [text, setText] = useState('');
  const [analyzeText, { data, isLoading, error }] = useAnalyzeTextMutation();

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    try {
      await analyzeText({ text }).unwrap();
    } catch (err) {
      console.error('Failed to analyze text', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Text Sentiment Analysis</h1>
        <p className="text-gray-400">Enter text to evaluate its emotional context and polarity using our NLP engine.</p>
      </div>

      <div className="grid md:grid-cols-[1fr_300px] gap-6">
        <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-4 flex flex-col gap-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste context here. (e.g. 'I am incredibly excited about the new product launch!')"
            className="w-full h-48 bg-transparent text-gray-200 placeholder-gray-600 resize-none outline-none focus:ring-0"
          />
          <div className="flex justify-end pt-2 border-t border-[var(--color-border)]">
            <button
              onClick={handleAnalyze}
              disabled={!text.trim() || isLoading}
              className="bg-[var(--color-primary)] hover:bg-blue-600 text-white font-medium px-6 py-2 rounded-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Analyze Text
            </button>
          </div>
        </div>

        <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-6 flex flex-col">
          <h2 className="text-xl font-semibold mb-4">Inference Result</h2>
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg flex gap-3 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>Backend connection failed. Is the API server running?</p>
            </div>
          )}
          
          {!data && !error && !isLoading && (
            <div className="flex-1 flex items-center justify-center text-center text-gray-500 text-sm italic">
              Submit text to see the predicted sentiment and polarity score.
            </div>
          )}

          {data && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col h-full justify-center space-y-8"
            >
              <div className="text-center space-y-2">
                <p className="text-sm uppercase tracking-wider text-gray-400 font-semibold">Classification</p>
                <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500 capitalize">
                  {data.emotion}
                </div>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-lg space-y-2 border border-gray-700/50">
                <div className="flex justify-between text-xs font-medium text-gray-400">
                  <span>Negative (-1)</span>
                  <span>Positive (+1)</span>
                </div>
                <div className="h-2 w-full bg-gray-700 rounded-full relative">
                  <div className="absolute top-1/2 -translate-y-1/2 left-[50%] h-4 w-0.5 bg-gray-500 z-10" />
                  <motion.div 
                    initial={{ left: '50%' }}
                    animate={{ left: `${(data.score + 1) * 50}%` }}
                    transition={{ type: 'spring', stiffness: 100 }}
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)] -translate-x-1/2"
                  />
                </div>
                <div className="text-center pt-2 text-sm font-semibold">
                  Score: {data.score.toFixed(3)}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}