// ✅ Auto-detect environment and set appropriate API base URL
const getApiBaseUrl = () => {
  // In production (Vercel), use relative URLs to same domain
  if (import.meta.env.PROD) {
    return '/api';
  }
  
  // In development, use environment variable or default to localhost
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
};

const API_BASE_URL = getApiBaseUrl();

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    console.log('🔧 Making request to:', url);
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        let errorMessage = 'API request failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        
        const error = new Error(errorMessage);
        error.status = response.status;
        throw error;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to server. Please check if the server is running.');
      }
      throw error;
    }
  }

  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

export default new ApiService();
