import { motion } from 'framer-motion';
import { Camera, Type, Mic, ArrowRight, Activity, Cpu, AlertTriangle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useGetMLStatsQuery } from '../store/services/emotionApi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

const cards = [
  { title: 'Facial Emotion', icon: Camera, path: '/face', color: 'from-blue-500/20 to-blue-500/0', border: 'border-blue-500/20', badge: 'Vision' },
  { title: 'Text Sentiment', icon: Type, path: '/text', color: 'from-emerald-500/20 to-emerald-500/0', border: 'border-emerald-500/20', badge: 'NLP' },
  { title: 'Speech Tonality', icon: Mic, path: '/speech', color: 'from-purple-500/20 to-purple-500/0', border: 'border-purple-500/20', badge: 'Audio' }
];

export default function Dashboard() {
  const { data: stats, isLoading, error } = useGetMLStatsQuery(undefined, {
    pollingInterval: 5000 // Poll every 5s for real-time feel
  });

  const modelChartData = stats ? [
    { name: 'Face', uses: stats.model_stats.face, color: '#3b82f6' },
    { name: 'NLP', uses: stats.model_stats.nlp, color: '#10b981' },
    { name: 'Speech', uses: stats.model_stats.speech, color: '#a855f7' }
  ] : [];

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-12">
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
          Emotion <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Analytics Dashboard</span>
        </motion.h1>
      </section>

      {/* Engines shortcuts */}
      <div className="flex gap-4">
        {cards.map((card) => (
          <Link key={card.path} to={card.path} className={`flex-1 flex items-center bg-[var(--color-card)] border ${card.border} p-4 rounded-xl hover:bg-gray-800 transition`}>
            <card.icon className="w-5 h-5 mr-3 text-gray-400" />
            <span className="font-semibold text-sm">{card.title}</span>
            <ArrowRight className="w-4 h-4 ml-auto text-gray-500 opacity-50" />
          </Link>
        ))}
      </div>

      {isLoading && <div className="text-center text-gray-400 py-12 animate-pulse">Loading analytics...</div>}
      {error && <div className="text-center text-red-400 py-12">Failed to load stats. Check backend connection.</div>}

      {stats && (
        <>
          {/* Top Level Real Stats */}
          <div className="grid md:grid-cols-4 gap-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-6 relative overflow-hidden">
              <Activity className="absolute right-[-10%] top-[-10%] w-24 h-24 text-blue-500/10 rotate-12" />
              <p className="text-sm font-medium text-gray-500">Total Inferences</p>
              <h4 className="text-3xl font-bold text-gray-100 mt-2">{stats.total_predictions}</h4>
              <p className="text-xs text-blue-400 mt-2">Real-time Count</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-6 relative overflow-hidden">
              <CheckCircle className="absolute right-[-10%] top-[-10%] w-24 h-24 text-emerald-500/10 rotate-12" />
              <p className="text-sm font-medium text-gray-500">Successful Predictions</p>
              <h4 className="text-3xl font-bold text-gray-100 mt-2">{stats.success_count}</h4>
              <p className="text-xs text-emerald-400 mt-2">{stats.success_rate}% Success Rate</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-6 relative overflow-hidden">
              <AlertTriangle className="absolute right-[-10%] top-[-10%] w-24 h-24 text-red-500/10 rotate-12" />
              <p className="text-sm font-medium text-gray-500">Failed / Errors</p>
              <h4 className="text-3xl font-bold text-gray-100 mt-2">{stats.failed_count}</h4>
              <p className="text-xs text-red-400 mt-2">Needs Review</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-6 relative overflow-hidden">
              <Cpu className="absolute right-[-10%] top-[-10%] w-24 h-24 text-purple-500/10 rotate-12" />
              <p className="text-sm font-medium text-gray-500">Avg Latency</p>
              <h4 className="text-3xl font-bold text-gray-100 mt-2">{stats.avg_latency_ms} <span className="text-lg text-gray-500 font-normal">ms</span></h4>
              <p className="text-xs text-purple-400 mt-2">Model Execution Time</p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Line Graph: Daily Usage */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-6">Recent Usage (7 Days)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.daily_usage}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                    <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                      itemStyle={{ color: '#60a5fa' }}
                    />
                    <Line type="monotone" dataKey="predictions" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Histogram/Bar Chart: Model Distribution */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-6">Model Popularity</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={modelChartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip 
                      cursor={{ fill: '#374151', opacity: 0.4 }}
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                    />
                    <Bar dataKey="uses" radius={[6, 6, 0, 0]}>
                      {modelChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
}