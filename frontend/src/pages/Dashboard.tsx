import { motion } from 'framer-motion';
import { Camera, Type, Mic, ArrowRight, Activity, Cpu, Database } from 'lucide-react';
import { Link } from 'react-router-dom';

const cards = [
  {
    title: 'Facial Emotion',
    description: 'Real-time or image-based facial expression analysis using Keras CNN.',
    icon: Camera,
    path: '/face',
    color: 'from-blue-500/20 to-blue-500/0',
    border: 'border-blue-500/20',
    badge: 'Vision'
  },
  {
    title: 'Text Sentiment',
    description: 'NLP inference using Logistic Regression and TF-IDF for emotional text context.',
    icon: Type,
    path: '/text',
    color: 'from-emerald-500/20 to-emerald-500/0',
    border: 'border-emerald-500/20',
    badge: 'NLP'
  },
  {
    title: 'Speech Tonality',
    description: 'Audio acoustic feature extraction mapping directly to vocal emotional cues.',
    icon: Mic,
    path: '/speech',
    color: 'from-purple-500/20 to-purple-500/0',
    border: 'border-purple-500/20',
    badge: 'Audio'
  }
];

const stats = [
  { label: 'Total Inferences', value: '1.2M+', icon: Activity, trend: '+12% this week' },
  { label: 'Model Latency (Avg)', value: '45ms', icon: Cpu, trend: '-5ms optimization' },
  { label: 'System Uptime', value: '99.99%', icon: Database, trend: 'All systems operational' },
];

export default function Dashboard() {
  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-12">
      {/* Header Section */}
      <section className="space-y-4">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="h-2 w-8 bg-blue-500 rounded-full" />
          <h2 className="text-blue-500 font-semibold tracking-wider uppercase text-sm">Enterprise Interface</h2>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-5xl font-extrabold tracking-tight"
        >
          Emotion <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Inference Gateway</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-gray-400 max-w-3xl"
        >
          Centralized AI hub utilizing separate service layers to prevent UI blocking. 
          Select a multi-modal analysis engine below to process facial, text, or auditory data.
        </motion.p>
      </section>

      {/* Stats Section */}
      <div className="grid md:grid-cols-3 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-6 flex items-center space-x-4"
            >
              <div className="p-3 bg-gray-800/50 rounded-xl border border-gray-700">
                <Icon className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <div className="flex items-baseline gap-2">
                  <h4 className="text-2xl font-bold text-gray-100">{stat.value}</h4>
                </div>
                <p className="text-xs text-blue-400 mt-1">{stat.trend}</p>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Main Grid Section */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold border-b border-[var(--color-border)] pb-4">
          Active Inference Engines
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          {cards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.path}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
              >
                <Link to={card.path} className="block group h-full">
                  <div className={`h-full bg-[var(--color-card)] rounded-2xl border ${card.border} p-6 relative overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]`}>
                    <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 rounded-xl bg-gray-800/80 flex items-center justify-center border border-gray-700 shadow-inner group-hover:bg-gray-800 transition-colors">
                          <Icon className="w-6 h-6 text-gray-300 group-hover:text-white transition-colors" />
                        </div>
                        <span className="text-xs font-semibold px-2 py-1 bg-gray-800 text-gray-300 rounded-md border border-gray-700">
                          {card.badge}
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-bold mb-2 group-hover:text-white transition-colors">{card.title}</h3>
                      <p className="text-sm text-gray-400 leading-relaxed flex-1 mb-6">{card.description}</p>
                      
                      <div className="mt-auto pt-4 border-t border-[var(--color-border)] flex items-center text-sm font-semibold text-[var(--color-primary)] group-hover:text-blue-400 transition-colors">
                        Launch Engine <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  );
}