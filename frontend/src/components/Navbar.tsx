import React from 'react';
import { Cpu, Terminal, BarChart2, History, BookOpen, ShieldCheck } from 'lucide-react';
import { HealthStatus } from '../types/compiler';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  health: HealthStatus;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, health }) => {
  const navItems = [
    { id: 'compiler', label: 'Compiler IDE', icon: Terminal },
    { id: 'analysis', label: 'Analysis Dashboard', icon: BarChart2 },
    { id: 'history', label: 'History', icon: History },
    { id: 'docs', label: 'Documentation', icon: BookOpen },
    { id: 'viva', label: 'Viva Guide', icon: ShieldCheck },
  ];

  const getHealthColor = (status: string) => {
    if (status.includes('Connected') || status.includes('Available') || status.includes('Running')) {
      return 'text-emerald-800 border-emerald-300 bg-emerald-50';
    }
    if (status.includes('Not Configured') || status.includes('Missing')) {
      return 'text-amber-800 border-amber-300 bg-amber-50';
    }
    return 'text-rose-800 border-rose-300 bg-rose-50';
  };

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-[#e8d8be] px-4 py-3 shadow-sm bg-white/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-violet-700 via-purple-700 to-amber-500 text-white shadow-md border border-amber-300/60">
            <Cpu className="w-6 h-6 text-amber-200 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-violet-950 via-purple-900 to-amber-700">
                NL2C COMPILER
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300/80 font-mono font-bold shadow-sm">
                v1.0 AI-Compiler
              </span>
            </div>
            <p className="text-xs text-[#52416b] font-medium hidden sm:block">
              Natural Language to C Code Compiler Using Generative AI
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1.5 bg-[#faf6ee] p-1.5 rounded-xl border border-[#e8d8be] shadow-inner">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-violet-950 border border-amber-400/80 shadow-sm ring-1 ring-amber-400/40'
                    : 'text-[#52416b] hover:text-violet-950 hover:bg-white/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-600' : 'text-violet-700'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* System Health Indicators */}
        <div className="hidden lg:flex items-center gap-2 font-mono text-[11px]">
          <div className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 font-bold shadow-sm ${getHealthColor(health.ai_status)}`}>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>AI: {health.ai_status}</span>
          </div>

          <div className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 font-bold shadow-sm ${getHealthColor(health.gcc_status)}`}>
            <span>GCC: {health.gcc_status.includes('Available') ? 'Available' : 'Fallback'}</span>
          </div>
        </div>

      </div>
    </header>
  );
};

export default Navbar;
