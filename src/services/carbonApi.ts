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
  ndvi_summary?: {
    dates?: string[];
    ndvi_values?: number[];
    mean_ndvi?: number;
    ndvi_trend?: number;
    satellite?: string;
    location?: { lat: number; lon: number };
  };
  carbon_stock?: {
    total_carbon_tons?: number;
    carbon_per_hectare?: number;
    area_hectares?: number;
    vegetation_density?: string;
    confidence_level?: number;
    mean_ndvi?: number;
    forest_type?: string;
    date?: string;
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
    const data = await response.json();
    
    console.log('Raw analyzeProject response:', data);
    
    // Transform the response to match AnalysisResult interface
    return {
      status: data.status || 'success',
      project_id: data.project_id || projectId,
      ndvi_summary: data.ndvi_summary || data.ndvi,
      carbon_stock: {
        total_carbon_tons: data.carbon_stock?.total_carbon_tons || data.carbon_stock?.total_tons || 0,
        carbon_per_hectare: data.carbon_stock?.carbon_per_hectare || data.carbon_stock?.per_hectare || 0,
        area_hectares: data.carbon_stock?.area_hectares || 0,
        vegetation_density: data.carbon_stock?.vegetation_density || 'unknown',
        confidence_level: data.carbon_stock?.confidence_level || 0,
        mean_ndvi: data.carbon_stock?.mean_ndvi || data.ndvi_summary?.mean_ndvi || 0,
        forest_type: data.carbon_stock?.forest_type || 'tropical',
        date: data.carbon_stock?.date || new Date().toISOString().split('T')[0]
      }
    };
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
  testSatelliteLocation: async (lat: number, lon: number): Promise<AnalysisResult> => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/satellite/test-location?lat=${lat}&lon=${lon}`);
    if (!response.ok) throw new Error('Failed to test location');
    const data = await response.json();
    
    console.log('Raw testSatelliteLocation response:', data);
    
    // Transform the response to match AnalysisResult interface
    return {
      status: data.status || 'success',
      project_id: data.project_id || 'test',
      ndvi_summary: data.ndvi_summary || data.ndvi,
      carbon_stock: {
        total_carbon_tons: data.carbon_stock?.total_carbon_tons || data.carbon_stock?.total_tons || 0,
        carbon_per_hectare: data.carbon_stock?.carbon_per_hectare || data.carbon_stock?.per_hectare || 0,
        area_hectares: data.carbon_stock?.area_hectares || 0,
        vegetation_density: data.carbon_stock?.vegetation_density || 'unknown',
        confidence_level: data.carbon_stock?.confidence_level || 0,
        mean_ndvi: data.carbon_stock?.mean_ndvi || data.ndvi_summary?.mean_ndvi || 0,
        forest_type: data.carbon_stock?.forest_type || 'tropical',
        date: data.carbon_stock?.date || new Date().toISOString().split('T')[0]
      }
    };
  },

  // Get NDVI data by coordinates (for when we have coordinates but no project in backend)
  getNDVIDataByCoordinates: async (lat: number, lon: number, startDate?: string, endDate?: string): Promise<NDVITimeSeriesData> => {
    const params = new URLSearchParams();
    params.append('lat', lat.toString());
    params.append('lon', lon.toString());
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const response = await fetch(`${API_CONFIG.BASE_URL}/satellite/ndvi-timeseries?${params.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch NDVI data by coordinates');
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