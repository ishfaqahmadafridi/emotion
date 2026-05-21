import { Outlet, Link, useLocation } from 'react-router-dom';
import { BrainCircuit, Mic, Camera, Type, LayoutDashboard, Settings, History, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MainLayout() {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Face Analysis', path: '/face', icon: Camera },
    { name: 'Text Sentiment', path: '/text', icon: Type },
    { name: 'Speech Emotion', path: '/speech', icon: Mic },
  ];

  return (
    <div className="flex h-screen bg-[var(--color-background)] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[var(--color-border)] bg-[var(--color-card)]/50 backdrop-blur-xl flex flex-col z-20">
        <div className="p-6 flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-xl">
            <BrainCircuit className="w-6 h-6 text-blue-400" />
          </div>
          <span className="font-bold text-xl tracking-tight">Emotion AI</span>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-2">
            Engines
          </div>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link 
                key={item.path} 
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative group overflow-hidden ${isActive ? 'text-white font-medium' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'}`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeTab" 
                    className="absolute inset-0 bg-blue-500/10 border border-blue-500/20 rounded-xl z-0"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                {isActive && (
                  <div className="absolute left-0 top-2 bottom-2 w-1 bg-blue-500 rounded-r-full z-10" />
                )}
                <Icon className={`w-5 h-5 relative z-10 transition-colors ${isActive ? 'text-blue-400' : 'group-hover:text-blue-400/70'}`} />
                <span className="relative z-10">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[var(--color-border)] space-y-2">
          <Link to="/history" className="flex w-full items-center gap-3 px-4 py-3 text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 rounded-xl transition-colors">
            <History className="w-5 h-5" />
            <span>History</span>
          </Link>
          <Link to="/settings" className="flex w-full items-center gap-3 px-4 py-3 text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 rounded-xl transition-colors">
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </Link>
          <button className="flex w-full items-center gap-3 px-4 py-3 text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 rounded-xl transition-colors text-sm mt-4">
            <HelpCircle className="w-4 h-4" />
            <span>Documentation</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-transparent pointer-events-none" />
        <div className="flex-1 overflow-y-auto z-10 p-8 pt-12">
          <Outlet />
        </div>
      </main>
    </div>
  );
}