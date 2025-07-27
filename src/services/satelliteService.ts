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

// Fetch satellite data from the API
export const fetchSatelliteData = async (lat: number, lon: number): Promise<SatelliteData> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.REQUEST_TIMEOUT);

  try {
    const url = `${API_CONFIG.BASE_URL}/satellite/test-location?lat=${lat}&lon=${lon}`;
    console.log(`Fetching satellite data from: ${url}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new SatelliteApiError(
        `Satellite API error: ${response.status} - ${errorText}`,
        response.status
      );
    }

    const result: SatelliteResponse = await response.json();
    
    if (!result.success || !result.data) {
      throw new SatelliteApiError(result.message || 'Invalid response from satellite API');
    }

    // Validate response data
    const { ndvi, carbon_stock, forest_cover_percentage, confidence_score } = result.data;
    
    if (typeof ndvi !== 'number' || typeof carbon_stock !== 'number' || 
        typeof forest_cover_percentage !== 'number' || typeof confidence_score !== 'number') {
      throw new SatelliteApiError('Invalid data format from satellite API');
    }

    return result.data;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof SatelliteApiError) {
      throw error;
    }
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new SatelliteApiError('Satellite API request timed out');
    }
    
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