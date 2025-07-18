
// API Configuration
export const API_CONFIG = {
  // Backend URL - uses environment variable or AWS Lambda as fallback
  BACKEND_URL: import.meta.env.VITE_API_URL || 'https://s8fm2o7873.execute-api.us-east-1.amazonaws.com/Prod',
  
  // API Endpoints
  ENDPOINTS: {
    ANALYZE_PROJECT: (projectId: string) => `/projects/${projectId}/analyze`,
    DOWNLOAD_REPORT: (projectId: string) => `/projects/${projectId}/report`,
  },
  
  // Request configuration
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
  
  // Timeout configuration - increased for cloud-based APIs
  REQUEST_TIMEOUT: 60000, // 60 seconds for cloud processing
};

// Helper function for making API requests
export const makeApiRequest = async (
  endpoint: string, 
  options: RequestInit = {}
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.REQUEST_TIMEOUT);
  
  console.log(`Making API request to: ${API_CONFIG.BACKEND_URL}${endpoint}`);
  
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
    console.log(`API response status: ${response.status}`);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('API request failed:', error);
    throw error;
  }
};
