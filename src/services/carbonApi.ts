import { API_CONFIG } from '@/config/api';

export interface Project {
  id: string;
  name: string;
  coordinates: string;
  carbon_tons: number;
  price_per_ton: number;
  currency: string;
  project_area?: number;
  forest_type?: string;
  monitoring_period_start?: string;
  monitoring_period_end?: string;
  created_at: string;
  satellite_image_url?: string;
}

export interface AnalysisResult {
  status: string;
  project_id: string;
  ndvi: {
    dates: string[];
    ndvi_values: number[];
    mean_ndvi: number;
    ndvi_trend: number;
    satellite: string;
    location: { lat: number; lon: number };
  };
  carbon_stock: {
    total_carbon_tons: number;
    carbon_per_hectare: number;
    area_hectares: number;
    vegetation_density: string;
    confidence_level: number;
  };
}

export interface NDVITimeSeriesData {
  project_id: string;
  satellite: string;
  time_series: Array<{
    date: string;
    ndvi: number;
    confidence: number;
    carbon_estimate: number;
  }>;
  summary: {
    mean_ndvi: number;
    trend: number;
    total_observations: number;
  };
}

export const carbonApi = {
  // Create a new project
  createProject: async (projectData: Omit<Project, 'id' | 'created_at'>): Promise<Project> => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/projects`, {
      method: 'POST',
      headers: API_CONFIG.DEFAULT_HEADERS,
      body: JSON.stringify(projectData),
    });
    if (!response.ok) throw new Error('Failed to create project');
    return response.json();
  },

  // Get all projects
  getProjects: async (): Promise<Project[]> => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/projects`);
    if (!response.ok) throw new Error('Failed to fetch projects');
    return response.json();
  },

  // Get single project
  getProject: async (projectId: string): Promise<Project> => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/projects/${projectId}`);
    if (!response.ok) throw new Error('Failed to fetch project');
    return response.json();
  },

  // Analyze project
  analyzeProject: async (projectId: string): Promise<AnalysisResult> => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/projects/${projectId}/analyze`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to analyze project');
    return response.json();
  },

  // Get NDVI data
  getNDVIData: async (projectId: string, startDate?: string, endDate?: string): Promise<NDVITimeSeriesData> => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const url = `${API_CONFIG.BASE_URL}/projects/${projectId}/ndvi${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch NDVI data');
    return response.json();
  },

  // Test satellite location
  testSatelliteLocation: async (lat: number, lon: number) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/satellite/test-location?lat=${lat}&lon=${lon}`);
    if (!response.ok) throw new Error('Failed to test location');
    return response.json();
  },

  // Get currencies
  getCurrencies: async () => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/currencies`);
    if (!response.ok) throw new Error('Failed to fetch currencies');
    return response.json();
  },

  // Download project report
  downloadReport: async (projectId: string): Promise<Blob> => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/projects/${projectId}/report`);
    if (!response.ok) throw new Error('Failed to download report');
    return response.blob();
  },
};