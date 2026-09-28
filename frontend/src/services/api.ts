import { AnalyzeResult, CompileResult, ExecuteResult, HealthStatus, HistoryItem } from '../types/compiler';

const API_BASE_URL = 'http://localhost:8000/api';

export const apiService = {
  async checkHealth(): Promise<HealthStatus> {
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
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
    const res = await fetch(`${API_BASE_URL}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ detail: 'Generation failed' }));
      throw new Error(errorData.detail || 'Code generation failed');
    }
    return await res.json();
  },

  async analyzeCode(code: string): Promise<AnalyzeResult> {
    const res = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ detail: 'Analysis failed' }));
      throw new Error(errorData.detail || 'Compiler analysis failed');
    }
    return await res.json();
  },

  async compileCode(code: string): Promise<CompileResult> {
    const res = await fetch(`${API_BASE_URL}/compile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ detail: 'Compilation failed' }));
      throw new Error(errorData.detail || 'GCC Compilation failed');
    }
    return await res.json();
  },

  async executeCode(code: string, stdin: string): Promise<ExecuteResult> {
    const res = await fetch(`${API_BASE_URL}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, stdin })
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ detail: 'Execution failed' }));
      throw new Error(errorData.detail || 'Program execution failed');
    }
    return await res.json();
  },

  async fixCode(code: string, error: string): Promise<{ corrected_code: string; explanation: string; diff_summary: string }> {
    const res = await fetch(`${API_BASE_URL}/fix`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, error })
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ detail: 'AI Fix failed' }));
      throw new Error(errorData.detail || 'AI Code correction failed');
    }
    return await res.json();
  },

  async getHistory(): Promise<HistoryItem[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/history`);
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  async clearHistory(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/history`, { method: 'DELETE' });
      return res.ok;
    } catch {
      return false;
    }
  }
};
