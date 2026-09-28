import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { CompilerIDE } from './pages/CompilerIDE';
import { AnalysisDashboard } from './pages/AnalysisDashboard';
import { HistoryPage } from './pages/HistoryPage';
import { DocumentationPage } from './pages/DocumentationPage';
import { AboutPage } from './pages/AboutPage';
import { apiService } from './services/api';
import { HealthStatus } from './types/compiler';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('compiler');
  const [health, setHealth] = useState<HealthStatus>({
    ai_status: 'Checking...',
    gcc_status: 'Checking...',
    python_status: 'Available',
    backend_status: 'Checking...',
    version: '1.0.0'
  });

  useEffect(() => {
    const fetchHealth = async () => {
      const h = await apiService.checkHealth();
      setHealth(h);
    };
    fetchHealth();
    const interval = setInterval(fetchHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleLoadHistoryCode = (code: string, prompt: string) => {
    setActiveTab('compiler');
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7] text-[#181028] flex flex-col font-sans">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} health={health} />
      
      <main className="flex-1">
        {activeTab === 'compiler' && <CompilerIDE />}
        {activeTab === 'analysis' && <AnalysisDashboard />}
        {activeTab === 'history' && <HistoryPage onLoadCode={handleLoadHistoryCode} />}
        {activeTab === 'docs' && <DocumentationPage />}
        {activeTab === 'viva' && <AboutPage />}
      </main>

      <footer className="border-t border-[#e8d8be] bg-[#fcf9f2] py-3.5 text-center text-xs text-[#52416b] font-mono shadow-inner">
        <span className="text-[#b45309] font-bold">NL2C Compiler</span> &bull; <span className="text-[#181028] font-semibold">Natural Language to C Code Compiler Using Generative AI</span> &bull; <span className="text-violet-700 font-bold">Compiler Design Mini Project</span>
      </footer>
    </div>
  );
};

export default App;
