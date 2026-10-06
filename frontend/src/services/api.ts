import { AnalyzeResult, CompileResult, ExecuteResult, HealthStatus, HistoryItem } from '../types/compiler';

export const getApiBaseUrl = (): string => {
  const custom = typeof window !== 'undefined' ? localStorage.getItem('nl2c_backend_url') : null;
  if (custom && custom.trim()) {
    return custom.trim().replace(/\/$/, '');
  }
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim()) {
    return envUrl.trim().replace(/\/$/, '');
  }
  // If running on a live domain (like Vercel), use the live Render backend by default
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'https://nl2c-backend.onrender.com/api';
  }
  return 'http://localhost:8000/api';
};

export const setCustomApiUrl = (url: string): void => {
  if (typeof window !== 'undefined') {
    if (url.trim()) {
      localStorage.setItem('nl2c_backend_url', url.trim().replace(/\/$/, ''));
    } else {
      localStorage.removeItem('nl2c_backend_url');
    }
  }
};

const handleFetchError = (err: any, endpoint: string): never => {
  const baseUrl = getApiBaseUrl();
  if (err.name === 'TypeError' && (err.message.includes('fetch') || err.message.includes('NetworkError') || err.message.includes('Failed to fetch'))) {
    throw new Error(
      `Cannot reach backend at "${baseUrl}". Please verify the backend is deployed/running and accessible.`
    );
  }
  throw err;
};

export const apiService = {
  async checkHealth(): Promise<HealthStatus> {
    const url = getApiBaseUrl();
    try {
      const res = await fetch(`${url}/health`);
      if (!res.ok) throw new Error('Health check failed');
      return await res.json();
    } catch (err) {
      return {
        ai_status: 'Disconnected',
        gcc_status: 'Unknown',
        python_status: 'Available',
        backend_status: 'Offline (Checking...)',
        version: '1.0.0'
      };
    }
  },

  async generateCode(prompt: string): Promise<{ code: string; explanation: string; status: string }> {
    const url = getApiBaseUrl();
    try {
      const res = await fetch(`${url}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ detail: 'Generation failed' }));
        throw new Error(errorData.detail || 'Code generation failed');
      }
      return await res.json();
    } catch (err) {
      return handleFetchError(err, '/generate');
    }
  },

  async analyzeCode(code: string): Promise<AnalyzeResult> {
    const url = getApiBaseUrl();
    try {
      const res = await fetch(`${url}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ detail: 'Analysis failed' }));
        throw new Error(errorData.detail || 'Compiler analysis failed');
      }
      return await res.json();
    } catch (err) {
      return handleFetchError(err, '/analyze');
    }
  },

  async compileCode(code: string): Promise<CompileResult> {
    const url = getApiBaseUrl();
    try {
      const res = await fetch(`${url}/compile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ detail: 'Compilation failed' }));
        throw new Error(errorData.detail || 'GCC Compilation failed');
      }
      return await res.json();
    } catch (err) {
      return handleFetchError(err, '/compile');
    }
  },

  async executeCode(code: string, stdin: string): Promise<ExecuteResult> {
    const url = getApiBaseUrl();
    try {
      const res = await fetch(`${url}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, stdin })
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ detail: 'Execution failed' }));
        throw new Error(errorData.detail || 'Program execution failed');
      }
      return await res.json();
    } catch (err) {
      return handleFetchError(err, '/execute');
    }
  },

  async fixCode(code: string, error: string): Promise<{ corrected_code: string; explanation: string; diff_summary: string }> {
    const url = getApiBaseUrl();
    try {
      const res = await fetch(`${url}/fix`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, error })
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ detail: 'AI Fix failed' }));
        throw new Error(errorData.detail || 'AI Code correction failed');
      }
      return await res.json();
    } catch (err) {
      return handleFetchError(err, '/fix');
    }
  },

  async getHistory(): Promise<HistoryItem[]> {
    const url = getApiBaseUrl();
    try {
      const res = await fetch(`${url}/history`);
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  async clearHistory(): Promise<boolean> {
    const url = getApiBaseUrl();
    try {
      const res = await fetch(`${url}/history`, { method: 'DELETE' });
      return res.ok;
    } catch {
      return false;
    }
  }
};
