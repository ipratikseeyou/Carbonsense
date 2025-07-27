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
  try {
    console.log(`Analyzing project ${projectId} with coordinates:`, coordinates);

    // Call the analyze endpoint
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ANALYZE_PROJECT(projectId)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        lat: coordinates.lat,
        lng: coordinates.lng
      })
    });

    if (!response.ok) {
      throw new Error(`Analysis failed: ${response.status} - ${response.statusText}`);
    }

    const result = await response.json();
    console.log('Analysis result:', result);

    // Store the analysis result in Supabase
    try {
      const { error } = await supabase
        .from('carbon_data')
        .insert({
          project_id: projectId,
          carbon_tons: result.carbon_stock?.total_tons || 0,
          confidence_score: result.confidence_score || 0,
          measurement_date: new Date().toISOString().split('T')[0]
        });

      if (error) {
        console.error('Failed to save analysis to Supabase:', error);
      }
    } catch (saveError) {
      console.warn('Could not save analysis to Supabase:', saveError);
    }

    return result;
  } catch (error) {
    console.error('Project analysis failed:', error);
    throw error;
  }
};