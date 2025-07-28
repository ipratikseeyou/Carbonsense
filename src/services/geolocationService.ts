import { API_CONFIG } from '@/config/api';
import { supabase } from '@/integrations/supabase/client';

// Enhanced coordinate types and interfaces
export interface Coordinates {
  lat: number;
  lon: number;
}

export interface BoundingBox {
  northeast: Coordinates;
  southwest: Coordinates;
}

export interface GeolocationAnalysis {
  centerPoint: Coordinates;
  boundingBox?: BoundingBox;
  gridPoints: Coordinates[];
  bufferRadius: number; // in kilometers
  analysisType: 'point' | 'grid' | 'polygon';
  estimatedArea: number; // in hectares
}

export interface EnhancedSatelliteData {
  ndvi: {
    mean: number;
    std: number;
    min: number;
    max: number;
    trend: number;
  };
  carbon_stock: {
    total_tons: number;
    per_hectare: number;
    confidence: number;
  };
  forest_cover: {
    percentage: number;
    area_hectares: number;
    quality_score: number;
  };
  data_sources: string[];
  grid_analysis?: GridAnalysisResult[];
  confidence_score: number;
  measurement_date: string;
  coverage_quality: 'excellent' | 'good' | 'partial' | 'poor';
}

export interface GridAnalysisResult {
  coordinates: Coordinates;
  ndvi: number;
  carbon_estimate: number;
  forest_coverage: number;
  data_quality: number;
}

// Generate analysis grid for larger projects
export const generateAnalysisGrid = (
  centerPoint: Coordinates,
  bufferKm: number,
  gridResolution: number = 1 // km between grid points
): Coordinates[] => {
  const points: Coordinates[] = [];
  const latDegreePerKm = 1 / 111; // Approximate degrees per km
  const lonDegreePerKm = 1 / (111 * Math.cos(centerPoint.lat * Math.PI / 180));
  
  const latBuffer = bufferKm * latDegreePerKm;
  const lonBuffer = bufferKm * lonDegreePerKm;
  
  const latStart = centerPoint.lat - latBuffer;
  const latEnd = centerPoint.lat + latBuffer;
  const lonStart = centerPoint.lon - lonBuffer;
  const lonEnd = centerPoint.lon + lonBuffer;
  
  const latStep = gridResolution * latDegreePerKm;
  const lonStep = gridResolution * lonDegreePerKm;
  
  for (let lat = latStart; lat <= latEnd; lat += latStep) {
    for (let lon = lonStart; lon <= lonEnd; lon += lonStep) {
      points.push({ lat: Number(lat.toFixed(6)), lon: Number(lon.toFixed(6)) });
    }
  }
  
  return points;
};

// Calculate bounding box from center point and buffer
export const calculateBoundingBox = (
  centerPoint: Coordinates,
  bufferKm: number
): BoundingBox => {
  const latDegreePerKm = 1 / 111;
  const lonDegreePerKm = 1 / (111 * Math.cos(centerPoint.lat * Math.PI / 180));
  
  const latBuffer = bufferKm * latDegreePerKm;
  const lonBuffer = bufferKm * lonDegreePerKm;
  
  return {
    northeast: {
      lat: centerPoint.lat + latBuffer,
      lon: centerPoint.lon + lonBuffer
    },
    southwest: {
      lat: centerPoint.lat - latBuffer,
      lon: centerPoint.lon - lonBuffer
    }
  };
};

// Estimate project area from coordinates
export const estimateProjectArea = (
  coordinates: Coordinates | Coordinates[],
  bufferKm?: number
): number => {
  if (Array.isArray(coordinates)) {
    // For polygon/multi-point analysis, calculate area
    // Simplified calculation - in practice, use more sophisticated algorithms
    return coordinates.length * 100; // Rough estimate
  } else {
    // For single point with buffer
    const radius = bufferKm || 1;
    return Math.PI * Math.pow(radius, 2) * 100; // Convert km² to hectares
  }
};

// Validate if coordinates have potential forest data
export const validateForestCoordinates = async (
  coordinates: Coordinates
): Promise<{ valid: boolean; confidence: number; reason?: string }> => {
  try {
    // Quick validation check using satellite endpoint
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/satellite/test-location?lat=${coordinates.lat}&lon=${coordinates.lon}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }
    );

    if (!response.ok) {
      return { valid: false, confidence: 0, reason: 'No satellite data available' };
    }

    const data = await response.json();
    const ndvi = data.ndvi_summary?.mean || 0;
    
    if (ndvi > 0.3) {
      return { valid: true, confidence: 0.8 };
    } else if (ndvi > 0.1) {
      return { valid: true, confidence: 0.5, reason: 'Low vegetation detected' };
    } else {
      return { valid: false, confidence: 0.2, reason: 'Minimal vegetation detected' };
    }
  } catch (error) {
    return { valid: false, confidence: 0, reason: 'Validation failed' };
  }
};

// Enhanced multi-point analysis
export const performEnhancedAnalysis = async (
  geolocation: GeolocationAnalysis
): Promise<EnhancedSatelliteData> => {
  console.log('🌍 Starting enhanced geolocation analysis');
  console.log(`📍 Analysis type: ${geolocation.analysisType}`);
  console.log(`📏 Buffer radius: ${geolocation.bufferRadius}km`);
  console.log(`📊 Grid points: ${geolocation.gridPoints.length}`);

  const results: GridAnalysisResult[] = [];
  const dataSources: string[] = [];

  try {
    if (geolocation.analysisType === 'point') {
      // Single point analysis with multiple data sources
      const pointResult = await analyzeSinglePoint(geolocation.centerPoint);
      results.push({
        coordinates: geolocation.centerPoint,
        ndvi: pointResult.ndvi_summary?.mean || 0,
        carbon_estimate: pointResult.carbon_stock?.total_tons || 0,
        forest_coverage: (pointResult.ndvi_summary?.mean || 0) * 100,
        data_quality: 0.8
      });
      dataSources.push('sentinel-2');
    } else if (geolocation.analysisType === 'grid') {
      // Grid-based analysis for larger areas
      const gridResults = await analyzeGridPoints(geolocation.gridPoints);
      results.push(...gridResults);
      dataSources.push('sentinel-2', 'landsat-8');
    }

    // Aggregate results
    const aggregatedData = aggregateAnalysisResults(results, geolocation.estimatedArea);
    
    // Store comprehensive results
    await storeEnhancedResults(geolocation, aggregatedData);

    return aggregatedData;
  } catch (error) {
    console.error('❌ Enhanced analysis failed:', error);
    throw error;
  }
};

// Analyze single point with multiple data sources
const analyzeSinglePoint = async (coordinates: Coordinates) => {
  const url = `${API_CONFIG.BASE_URL}/satellite/test-location?lat=${coordinates.lat}&lon=${coordinates.lon}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Satellite API failed: ${response.status}`);
  }
  
  return await response.json();
};

// Analyze multiple grid points with batch processing
const analyzeGridPoints = async (gridPoints: Coordinates[]): Promise<GridAnalysisResult[]> => {
  const batchSize = 5; // Process in batches to avoid overwhelming the API
  const results: GridAnalysisResult[] = [];
  
  for (let i = 0; i < gridPoints.length; i += batchSize) {
    const batch = gridPoints.slice(i, i + batchSize);
    const batchPromises = batch.map(async (point) => {
      try {
        const data = await analyzeSinglePoint(point);
        return {
          coordinates: point,
          ndvi: data.ndvi_summary?.mean || 0,
          carbon_estimate: data.carbon_stock?.total_tons || 0,
          forest_coverage: (data.ndvi_summary?.mean || 0) * 100,
          data_quality: 0.7
        };
      } catch (error) {
        console.warn(`⚠️ Grid point analysis failed for ${point.lat}, ${point.lon}:`, error);
        return {
          coordinates: point,
          ndvi: 0,
          carbon_estimate: 0,
          forest_coverage: 0,
          data_quality: 0
        };
      }
    });
    
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
    
    // Add delay between batches to avoid rate limiting
    if (i + batchSize < gridPoints.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results;
};

// Aggregate grid analysis results
const aggregateAnalysisResults = (
  results: GridAnalysisResult[],
  totalArea: number
): EnhancedSatelliteData => {
  const validResults = results.filter(r => r.data_quality > 0);
  
  if (validResults.length === 0) {
    throw new Error('No valid data points found in analysis');
  }
  
  const ndviValues = validResults.map(r => r.ndvi);
  const carbonValues = validResults.map(r => r.carbon_estimate);
  const forestValues = validResults.map(r => r.forest_coverage);
  
  const ndviMean = ndviValues.reduce((a, b) => a + b, 0) / ndviValues.length;
  const ndviStd = Math.sqrt(
    ndviValues.reduce((acc, val) => acc + Math.pow(val - ndviMean, 2), 0) / ndviValues.length
  );
  
  const totalCarbon = carbonValues.reduce((a, b) => a + b, 0);
  const avgForestCoverage = forestValues.reduce((a, b) => a + b, 0) / forestValues.length;
  
  const coverageQuality = validResults.length / results.length;
  let qualityRating: 'excellent' | 'good' | 'partial' | 'poor';
  
  if (coverageQuality > 0.9) qualityRating = 'excellent';
  else if (coverageQuality > 0.7) qualityRating = 'good';
  else if (coverageQuality > 0.5) qualityRating = 'partial';
  else qualityRating = 'poor';

  return {
    ndvi: {
      mean: ndviMean,
      std: ndviStd,
      min: Math.min(...ndviValues),
      max: Math.max(...ndviValues),
      trend: 0.01 // Placeholder for trend calculation
    },
    carbon_stock: {
      total_tons: totalCarbon,
      per_hectare: totalCarbon / totalArea,
      confidence: coverageQuality
    },
    forest_cover: {
      percentage: avgForestCoverage,
      area_hectares: (avgForestCoverage / 100) * totalArea,
      quality_score: coverageQuality
    },
    data_sources: ['sentinel-2', 'landsat-8'],
    grid_analysis: results,
    confidence_score: coverageQuality,
    measurement_date: new Date().toISOString(),
    coverage_quality: qualityRating
  };
};

// Store enhanced analysis results
const storeEnhancedResults = async (
  geolocation: GeolocationAnalysis,
  data: EnhancedSatelliteData
) => {
  try {
    // Store in carbon_data table with enhanced metadata
    const { error } = await supabase
      .from('carbon_data')
      .insert({
        carbon_tons: data.carbon_stock.total_tons,
        confidence_score: data.confidence_score,
        measurement_date: new Date().toISOString().split('T')[0]
      });

    if (error) {
      console.warn('⚠️ Failed to store enhanced results:', error);
    } else {
      console.log('✅ Enhanced analysis results stored');
    }
  } catch (error) {
    console.warn('⚠️ Storage error:', error);
  }
};