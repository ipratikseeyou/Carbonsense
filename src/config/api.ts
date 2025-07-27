// API Configuration
export const API_CONFIG = {
  // Backend URL - consolidated to working endpoint
  BASE_URL: 'https://9xi0ugbkzh.execute-api.us-east-1.amazonaws.com/Prod',
  
  // API Endpoints
  ENDPOINTS: {
    PROJECTS: '/projects',
    PROJECT_DETAIL: (id: string) => `/projects/${id}`,
    ANALYZE_PROJECT: (projectId: string) => `/projects/${projectId}/analyze`,
    DOWNLOAD_REPORT: (projectId: string) => `/projects/${projectId}/report`,
    PROJECT_NDVI: (projectId: string) => `/projects/${projectId}/ndvi`,
    SATELLITE_DATA: (lat: number, lon: number) => `/satellite/test-location?lat=${lat}&lon=${lon}`,
    CURRENCIES: '/currencies',
    API_STATUS: '/api-status'
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
  
  console.log(`Making API request to: ${API_CONFIG.BASE_URL}${endpoint}`);
  
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
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

// Legacy API endpoints for backward compatibility
const baseUrl = API_CONFIG.BASE_URL.endsWith('/') ? API_CONFIG.BASE_URL.slice(0, -1) : API_CONFIG.BASE_URL;

export const apiEndpoints = {
  // Projects endpoints
  projects: `${baseUrl}/projects`,
  projectById: (id: number | string) => `${baseUrl}/projects/${id}`,
  analyzeProject: (id: number | string) => `${baseUrl}/projects/${id}/analyze`,
  projectReport: (id: number | string) => `${baseUrl}/projects/${id}/report`,
  
  // Currency endpoint
  currencies: `${baseUrl}/currencies`,
  
  // Satellite endpoint
  satelliteData: (lat: number, lon: number) => `${baseUrl}/satellite/test-location?lat=${lat}&lon=${lon}`,
  
  // Health check
  health: `${baseUrl}/`,
};
