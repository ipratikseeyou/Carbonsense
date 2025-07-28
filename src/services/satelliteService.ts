import { API_CONFIG } from '@/config/api';

// Types for satellite API response
export interface SatelliteData {
  ndvi: number;
  carbon_stock: number;
  forest_cover_percentage: number;
  confidence_score: number;
  measurement_date: string;
}

export interface SatelliteResponse {
  success: boolean;
  data: SatelliteData;
  message?: string;
}

// Error types
export class SatelliteApiError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'SatelliteApiError';
  }
}

// Parse coordinates from project coordinates string
export const parseCoordinates = (coordinates: string): { lat: number; lon: number } => {
  try {
    const coords = coordinates.split(',').map(coord => parseFloat(coord.trim()));
    if (coords.length !== 2 || coords.some(isNaN)) {
      throw new Error('Invalid coordinate format');
    }
    return { lat: coords[0], lon: coords[1] };
  } catch (error) {
    throw new SatelliteApiError('Invalid coordinates format. Expected "lat,lon"');
  }
};

// Debug function to test coordinates
export const testCoordinates = async (lat: number, lon: number) => {
  console.log(`🔍 Testing coordinates: ${lat}, ${lon}`);
  console.log(`🌍 Checking if coordinates have forest data...`);
  
  // Known good forest coordinates for testing
  const testCoords = { lat: -3.4653, lon: -62.2159 };
  console.log(`🧪 Test coordinates (Amazon): ${testCoords.lat}, ${testCoords.lon}`);
  
  return { original: { lat, lon }, test: testCoords };
};

// Fetch satellite data from the API with enhanced debugging
export const fetchSatelliteData = async (lat: number, lon: number): Promise<SatelliteData> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.REQUEST_TIMEOUT);

  try {
    console.log(`🚀 Starting satellite data fetch for coordinates: ${lat}, ${lon}`);
    
    // Validate coordinates
    if (!lat || !lon || isNaN(lat) || isNaN(lon)) {
      throw new SatelliteApiError(`Invalid coordinates: lat=${lat}, lon=${lon}`);
    }
    
    const url = `${API_CONFIG.BASE_URL}/satellite/test-location?lat=${lat}&lon=${lon}`;
    console.log(`📡 Fetching satellite data from: ${url}`);
    console.log(`⏰ Request timeout set to: ${API_CONFIG.REQUEST_TIMEOUT}ms`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    
    console.log(`📊 Response status: ${response.status} ${response.statusText}`);
    console.log(`📝 Response headers:`, Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Error Response:`, errorText);
      throw new SatelliteApiError(
        `Satellite API error: ${response.status} - ${errorText}`,
        response.status
      );
    }

    const result = await response.json();
    console.log(`✅ Raw API Response:`, JSON.stringify(result, null, 2));
    
    // Handle different response formats from the backend
    let satelliteData: SatelliteData;
    
    if (result.data_source) {
      // Handle direct satellite endpoint response
      console.log(`📡 Using direct satellite data format`);
      satelliteData = {
        ndvi: result.ndvi_summary?.mean || 0,
        carbon_stock: result.carbon_stock?.total_tons || 0,
        forest_cover_percentage: result.ndvi_summary?.mean * 100 || 0, // Convert NDVI to percentage
        confidence_score: 0.85, // Default confidence for direct satellite data
        measurement_date: new Date().toISOString()
      };
    } else if (result.success && result.data) {
      // Handle wrapped response format
      console.log(`📦 Using wrapped response format`);
      satelliteData = result.data;
    } else {
      // Handle unexpected format
      console.error(`❌ Unexpected response format:`, result);
      throw new SatelliteApiError('Invalid response format from satellite API');
    }

    // Validate satellite data
    console.log(`🔍 Validating satellite data:`, satelliteData);
    const { ndvi, carbon_stock, forest_cover_percentage, confidence_score } = satelliteData;
    
    if (typeof ndvi !== 'number' || typeof carbon_stock !== 'number' || 
        typeof forest_cover_percentage !== 'number' || typeof confidence_score !== 'number') {
      console.error(`❌ Invalid data types:`, {
        ndvi: typeof ndvi,
        carbon_stock: typeof carbon_stock,
        forest_cover_percentage: typeof forest_cover_percentage,
        confidence_score: typeof confidence_score
      });
      throw new SatelliteApiError('Invalid data format from satellite API');
    }

    console.log(`✅ Satellite data validated successfully:`, satelliteData);
    return satelliteData;
  } catch (error) {
    clearTimeout(timeoutId);
    
    console.error(`❌ Satellite data fetch failed:`, error);
    
    if (error instanceof SatelliteApiError) {
      throw error;
    }
    
    if (error instanceof Error && error.name === 'AbortError') {
      console.error(`⏰ Request timed out after ${API_CONFIG.REQUEST_TIMEOUT}ms`);
      throw new SatelliteApiError('Satellite API request timed out');
    }
    
    console.error(`💥 Unexpected error:`, error);
    throw new SatelliteApiError('Failed to fetch satellite data');
  }
};

// Get NDVI color based on value
export const getNDVIColor = (ndvi: number): string => {
  if (ndvi < 0.3) return 'text-red-500';
  if (ndvi < 0.6) return 'text-yellow-500';
  return 'text-green-500';
};

// Get NDVI status text
export const getNDVIStatus = (ndvi: number): string => {
  if (ndvi < 0.3) return 'Poor vegetation';
  if (ndvi < 0.6) return 'Moderate vegetation';
  return 'Excellent vegetation';
};

// Format confidence score as percentage
export const formatConfidence = (confidence: number): string => {
  return `${Math.round(confidence * 100)}%`;
};

// NDVI Time Series Data Types
interface NDVITimeSeriesData {
  dates: string[];
  ndvi_values: number[];
  mean_ndvi: number;
  ndvi_trend: number;
  confidence_scores: number[];
  analysis_period: {
    start_date: string;
    end_date: string;
  };
}

interface NDVITimeSeriesResponse {
  success: boolean;
  data: NDVITimeSeriesData;
  message?: string;
}

// Fetch NDVI time series data for a project
export const fetchNDVITimeSeries = async (
  projectId: string, 
  startDate?: string, 
  endDate?: string
): Promise<NDVITimeSeriesData> => {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const queryString = params.toString();
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROJECT_NDVI(projectId)}${queryString ? `?${queryString}` : ''}`;
    
    console.log('Fetching NDVI time series:', { projectId, startDate, endDate, url });
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.REQUEST_TIMEOUT);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: API_CONFIG.DEFAULT_HEADERS,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new SatelliteApiError(
        `NDVI API request failed: ${response.status} ${response.statusText}`,
        response.status
      );
    }
    
    const result: NDVITimeSeriesResponse = await response.json();
    
    if (!result.success || !result.data) {
      throw new SatelliteApiError(
        result.message || 'Invalid NDVI API response format'
      );
    }
    
    console.log('NDVI time series data received:', result.data);
    return result.data;
    
  } catch (error) {
    console.error('Error fetching NDVI time series:', error);
    
    if (error instanceof SatelliteApiError) {
      throw error;
    }
    
    if (error.name === 'AbortError') {
      throw new SatelliteApiError('NDVI request timeout');
    }
    
    throw new SatelliteApiError('Failed to fetch NDVI time series data');
  }
};

// Generate fallback NDVI data when API is unavailable
export const generateFallbackNDVIData = (
  projectId: string,
  startDate?: string,
  endDate?: string
): NDVITimeSeriesData => {
  const now = new Date();
  const start = startDate ? new Date(startDate) : new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  const end = endDate ? new Date(endDate) : now;
  
  const dates: string[] = [];
  const ndvi_values: number[] = [];
  const confidence_scores: number[] = [];
  
  // Generate monthly data points
  const current = new Date(start);
  while (current <= end) {
    dates.push(current.toISOString().split('T')[0]);
    
    // Generate realistic NDVI values with seasonal variation
    const month = current.getMonth();
    const seasonalBase = 0.6 + 0.2 * Math.sin((month - 3) * Math.PI / 6); // Peak in summer
    const noise = (Math.random() - 0.5) * 0.1;
    ndvi_values.push(Math.max(0.1, Math.min(0.9, seasonalBase + noise)));
    
    confidence_scores.push(0.7 + Math.random() * 0.2); // 70-90% confidence
    
    current.setMonth(current.getMonth() + 1);
  }
  
  const mean_ndvi = ndvi_values.reduce((sum, val) => sum + val, 0) / ndvi_values.length;
  
  // Calculate trend (simple linear regression slope)
  const n = ndvi_values.length;
  const sumX = (n * (n - 1)) / 2;
  const sumY = ndvi_values.reduce((sum, val) => sum + val, 0);
  const sumXY = ndvi_values.reduce((sum, val, i) => sum + val * i, 0);
  const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;
  
  const ndvi_trend = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  
  return {
    dates,
    ndvi_values,
    mean_ndvi,
    ndvi_trend,
    confidence_scores,
    analysis_period: {
      start_date: start.toISOString().split('T')[0],
      end_date: end.toISOString().split('T')[0]
    }
  };
};