// CycleWeave API Client
// Configure this URL to point to your deployed FastAPI backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${response.status}`);
    }

    if (response.status === 204) {
      return { data: null, error: null };
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    return { data: null, error: (error as Error).message };
  }
}

// LCA API
export const lcaApi = {
  create: (data: any) =>
    apiRequest('/api/lca/', { method: 'POST', body: JSON.stringify(data) }),
  
  list: (skip = 0, limit = 100) =>
    apiRequest(`/api/lca/?skip=${skip}&limit=${limit}`),
  
  get: (id: string) =>
    apiRequest(`/api/lca/${id}`),
  
  update: (id: string, data: any) =>
    apiRequest(`/api/lca/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  
  delete: (id: string) =>
    apiRequest(`/api/lca/${id}`, { method: 'DELETE' }),
  
  simulate: (id: string, changes: any) =>
    apiRequest(`/api/lca/${id}/simulate`, { method: 'POST', body: JSON.stringify(changes) }),
};

// Scanner API
export const scannerApi = {
  analyze: (imageBase64?: string, imageUrl?: string) =>
    apiRequest('/api/scanner/analyze', {
      method: 'POST',
      body: JSON.stringify({ imageBase64, imageUrl }),
    }),
  
  upload: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/scanner/upload`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }
      
      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  },
  
  list: (skip = 0, limit = 50) =>
    apiRequest(`/api/scanner/?skip=${skip}&limit=${limit}`),
  
  get: (id: string) =>
    apiRequest(`/api/scanner/${id}`),
  
  applyToLca: (scanId: string, lcaId: string) =>
    apiRequest(`/api/scanner/${scanId}/apply/${lcaId}`, { method: 'POST' }),
};

// Doctor API
export const doctorApi = {
  analyze: (lcaId: string) =>
    apiRequest('/api/doctor/analyze', {
      method: 'POST',
      body: JSON.stringify({ lcaId }),
    }),
  
  list: (skip = 0, limit = 50) =>
    apiRequest(`/api/doctor/?skip=${skip}&limit=${limit}`),
  
  get: (id: string) =>
    apiRequest(`/api/doctor/${id}`),
  
  getForLca: (lcaId: string) =>
    apiRequest(`/api/doctor/lca/${lcaId}`),
  
  applyImprovement: (analysisId: string, improvementId: string) =>
    apiRequest(`/api/doctor/${analysisId}/apply/${improvementId}`, { method: 'POST' }),
};

// Passport API
export const passportApi = {
  generate: (lcaId: string, doctorAnalysisId?: string) =>
    apiRequest('/api/passport/', {
      method: 'POST',
      body: JSON.stringify({ lcaId, doctorAnalysisId }),
    }),
  
  list: (skip = 0, limit = 50) =>
    apiRequest(`/api/passport/?skip=${skip}&limit=${limit}`),
  
  get: (id: string) =>
    apiRequest(`/api/passport/${id}`),
  
  getFull: (id: string) =>
    apiRequest(`/api/passport/${id}/full`),
  
  getForLca: (lcaId: string) =>
    apiRequest(`/api/passport/lca/${lcaId}`),
  
  delete: (id: string) =>
    apiRequest(`/api/passport/${id}`, { method: 'DELETE' }),
};

// Health check
export const healthCheck = () => apiRequest('/health');
