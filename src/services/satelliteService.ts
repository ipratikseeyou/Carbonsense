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