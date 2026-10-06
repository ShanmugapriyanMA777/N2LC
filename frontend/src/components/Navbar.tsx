import React, { useState } from 'react';
import { Cpu, Terminal, BarChart2, History, BookOpen, ShieldCheck, Settings, Globe, Check, RefreshCw } from 'lucide-react';
import { HealthStatus } from '../types/compiler';
import { getApiBaseUrl, setCustomApiUrl } from '../services/api';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  health: HealthStatus;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, health }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [customUrl, setCustomUrl] = useState(getApiBaseUrl());
  const [saveSuccess, setSaveSuccess] = useState(false);

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

  const handleSaveUrl = () => {
    setCustomApiUrl(customUrl);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setShowSettings(false);
      window.location.reload();
    }, 800);
  };

  return (
    <>
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

          {/* System Health Indicators & Settings Button */}
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <div className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 font-bold shadow-sm ${getHealthColor(health.ai_status)}`}>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>AI: {health.ai_status}</span>
            </div>

            <div className={`hidden lg:flex px-2.5 py-1 rounded-lg border items-center gap-1.5 font-bold shadow-sm ${getHealthColor(health.gcc_status)}`}>
              <span>GCC: {health.gcc_status.includes('Available') ? 'Available' : 'Fallback'}</span>
            </div>

            <button
              onClick={() => {
                setCustomUrl(getApiBaseUrl());
                setShowSettings(true);
              }}
              title="API Backend Settings"
              className="p-1.5 rounded-lg border border-[#e8d8be] bg-[#faf6ee] hover:bg-white text-[#52416b] hover:text-violet-900 transition-colors shadow-sm"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

        </div>
      </header>

      {/* Backend Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl border border-[#e8d8be] shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#f0e4d0]">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-violet-100 text-violet-800">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[#181028] text-base">Backend API URL</h3>
                  <p className="text-xs text-[#6b5887]">Connect your live cloud or local Python backend</p>
                </div>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-700 font-bold text-lg"
              >
                &times;
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#181028]">
                FastAPI Backend Endpoint:
              </label>
              <input
                type="text"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://your-backend.onrender.com/api"
                className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-[#d6c4a8] focus:outline-none focus:ring-2 focus:ring-violet-500/40 bg-[#faf8f4]"
              />
              <p className="text-[11px] text-[#7c6a95]">
                Default is <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-700">http://localhost:8000/api</code>. When deployed, enter your cloud URL (e.g. Render / Railway).
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  setCustomUrl('http://localhost:8000/api');
                }}
                className="text-xs text-[#7c6a95] hover:text-violet-800 underline flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Reset to Localhost
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveUrl}
                  className="px-4 py-1.5 text-xs font-bold bg-violet-700 hover:bg-violet-800 text-white rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
                >
                  {saveSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" /> Saved!
                    </>
                  ) : (
                    'Save & Reload'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
