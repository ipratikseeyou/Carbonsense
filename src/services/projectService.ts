import { supabase } from '@/integrations/supabase/client';
import { API_CONFIG } from '@/config/api';

export interface CreateProjectData {
  name: string;
  location: string;
  carbon_credits: number;
  price_per_ton: number;
  currency: string;
  coordinates: string;
  area?: number;
  forest_type?: string;
  monitoring_start?: string;
  monitoring_end?: string;
  developer_name?: string;
  developer_contact?: string;
  lat?: number;
  lng?: number;
}

export const createProject = async (projectData: CreateProjectData) => {
  try {
    // Step 1: Save to Supabase first (primary source of truth)
    const supabaseData = {
      name: projectData.name,
      coordinates: projectData.coordinates,
      carbon_tons: projectData.carbon_credits,
      price_per_ton: projectData.price_per_ton,
      currency: projectData.currency || 'USD',
      satellite_image_url: null
    };

    console.log('Creating project in Supabase:', supabaseData);

    const { data: savedProject, error: supabaseError } = await supabase
      .from('projects')
      .insert(supabaseData)
      .select()
      .single();

    if (supabaseError) {
      console.error('Supabase error:', supabaseError);
      throw new Error(`Failed to save project: ${supabaseError.message}`);
    }

    console.log('Project saved to Supabase successfully:', savedProject);

    // Step 2: Sync with backend API (optional, for satellite data preparation)
    try {
      const backendData = {
        name: projectData.name,
        coordinates: projectData.coordinates,
        carbon_tons: projectData.carbon_credits,
        price_per_ton: projectData.price_per_ton,
        currency: projectData.currency || 'USD',
        project_area: projectData.area,
        forest_type: projectData.forest_type,
        monitoring_period_start: projectData.monitoring_start,
        monitoring_period_end: projectData.monitoring_end,
        developer_name: projectData.developer_name,
        developer_contact: projectData.developer_contact
      };

      console.log('Syncing with backend API:', backendData);

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROJECTS}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backendData)
      });

      if (response.ok) {
        console.log('Backend sync successful');
      } else {
        console.warn('Backend sync failed but project was saved to Supabase');
      }
    } catch (backendError) {
      // Log but don't fail the whole operation
      console.warn('Backend sync failed:', backendError);
    }

    return savedProject;
  } catch (error) {
    console.error('Project creation failed:', error);
    throw error;
  }
};

export const analyzeProject = async (projectId: string, coordinates: { lat: number; lng: number }) => {
  console.log('🚀 Starting enhanced project analysis');
  console.log(`📋 Project ID: ${projectId}`);
  console.log(`📍 Coordinates: lat=${coordinates.lat}, lng=${coordinates.lng}`);
  console.log(`🔧 Using API base URL: ${API_CONFIG.BASE_URL}`);

  // Validate inputs
  if (!projectId || typeof projectId !== 'string') {
    throw new Error(`Invalid project ID: ${projectId}`);
  }

  if (!coordinates.lat || !coordinates.lng || isNaN(coordinates.lat) || isNaN(coordinates.lng)) {
    throw new Error(`Invalid coordinates: lat=${coordinates.lat}, lng=${coordinates.lng}`);
  }

  try {
    // First, try project-specific analysis endpoint
    console.log('🎯 Attempting project-specific analysis...');
    const analyzeUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ANALYZE_PROJECT(projectId)}`;
    console.log(`📡 Analysis URL: ${analyzeUrl}`);
    
    const analyzeResponse = await fetch(analyzeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        lat: coordinates.lat,
        lng: coordinates.lng
      }),
    });

    console.log(`📊 Analysis response status: ${analyzeResponse.status} ${analyzeResponse.statusText}`);

    if (analyzeResponse.ok) {
      const result = await analyzeResponse.json();
      console.log('✅ Project analysis successful:', result);

      // Store analysis results in Supabase
      try {
        const { error } = await supabase
          .from('carbon_data')
          .insert({
            project_id: projectId,
            carbon_tons: result.carbon_stock?.total_tons || result.carbon_tons || 0,
            confidence_score: result.confidence_score || 0.8,
            measurement_date: new Date().toISOString().split('T')[0]
          });

        if (error) {
          console.warn('⚠️ Failed to store analysis in Supabase:', error);
        } else {
          console.log('✅ Analysis results stored in Supabase');
        }
      } catch (saveError) {
        console.warn('⚠️ Storage error:', saveError);
      }

      return result;
    } else {
      const errorText = await analyzeResponse.text();
      console.error(`❌ Project analysis failed: ${analyzeResponse.status} - ${errorText}`);
      
      // If 404, the project doesn't exist in backend, try satellite data fallback
      if (analyzeResponse.status === 404) {
        console.log('🔄 Project not found in backend, falling back to satellite data...');
        return await fallbackToSatelliteData(projectId, coordinates);
      } else {
        throw new Error(`Analysis failed: ${analyzeResponse.status} - ${errorText}`);
      }
    }

  } catch (error) {
    console.error('💥 Project analysis error:', error);
    
    // Try fallback to satellite data
    console.log('🔄 Attempting fallback to satellite data...');
    try {
      return await fallbackToSatelliteData(projectId, coordinates);
    } catch (fallbackError) {
      console.error('💥 Fallback also failed:', fallbackError);
      throw new Error(`Both analysis and fallback failed. Original error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
};

// Fallback function to use satellite data directly
const fallbackToSatelliteData = async (projectId: string, coordinates: { lat: number; lng: number }) => {
  console.log('🛰️ Using satellite data fallback');
  
  try {
    // Use satellite test endpoint directly
    const satelliteUrl = `${API_CONFIG.BASE_URL}/satellite/test-location?lat=${coordinates.lat}&lon=${coordinates.lng}`;
    console.log(`📡 Satellite URL: ${satelliteUrl}`);
    
    const response = await fetch(satelliteUrl);
    
    if (!response.ok) {
      throw new Error(`Satellite API failed: ${response.status}`);
    }
    
    const satelliteData = await response.json();
    console.log('📡 Satellite data received:', satelliteData);
    
    // Convert satellite data to analysis format
    const analysisResult = {
      carbon_stock: {
        total_tons: satelliteData.carbon_stock?.total_tons || 0,
        per_hectare: satelliteData.carbon_stock?.per_hectare || 0
      },
      ndvi_summary: {
        mean: satelliteData.ndvi_summary?.mean || 0,
        trend: satelliteData.ndvi_summary?.trend || 0
      },
      confidence_score: 0.8,
      data_source: 'satellite_fallback',
      measurement_date: new Date().toISOString()
    };

    // Store fallback results in Supabase
    try {
      const { error } = await supabase
        .from('carbon_data')
        .insert({
          project_id: projectId,
          carbon_tons: analysisResult.carbon_stock.total_tons,
          confidence_score: analysisResult.confidence_score,
          measurement_date: new Date().toISOString().split('T')[0]
        });

      if (error) {
        console.warn('⚠️ Failed to store fallback results in Supabase:', error);
      } else {
        console.log('✅ Fallback results stored in Supabase');
      }
    } catch (storageError) {
      console.warn('⚠️ Storage error:', storageError);
    }

    return analysisResult;
  } catch (error) {
    console.error('💥 Satellite fallback failed:', error);
    throw error;
  }
};