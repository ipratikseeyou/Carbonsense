
// API Configuration
export const API_CONFIG = {
  // Backend URL - update this based on your environment
  BACKEND_URL: process.env.NODE_ENV === 'production' 
    ? 'https://your-production-backend.com' 
    : 'http://localhost:8002',
  
  // API Endpoints
  ENDPOINTS: {
    ANALYZE_PROJECT: (projectId: string) => `/projects/${projectId}/analyze`,
    DOWNLOAD_REPORT: (projectId: string) => `/projects/${projectId}/report`,
  },
  
  // Request configuration
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
  
  // Timeout configuration
  REQUEST_TIMEOUT: 30000, // 30 seconds
};

// Helper function for making API requests
export const makeApiRequest = async (
  endpoint: string, 
  options: RequestInit = {}
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.REQUEST_TIMEOUT);
  
  try {
    const response = await fetch(`${API_CONFIG.BACKEND_URL}${endpoint}`, {
      ...options,
      headers: {
        ...API_CONFIG.DEFAULT_HEADERS,
        ...options.headers,
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};
