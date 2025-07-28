import { supabase } from '@/integrations/supabase/client';
import { API_CONFIG } from '@/config/api';

export interface SyncResult {
  success: boolean;
  projectId: string;
  backendId?: string;
  error?: string;
}

export interface ProjectSyncStatus {
  supabaseExists: boolean;
  backendExists: boolean;
  backendId?: string;
  lastSync?: string;
  needsSync: boolean;
}

// Check if project exists in both Supabase and backend
export const checkProjectSyncStatus = async (projectId: string): Promise<ProjectSyncStatus> => {
  console.log(`🔍 Checking sync status for project: ${projectId}`);

  try {
    // Check Supabase
    const { data: supabaseProject, error: supabaseError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    const supabaseExists = !supabaseError && !!supabaseProject;
    console.log(`📁 Supabase exists: ${supabaseExists}`);

    if (!supabaseExists) {
      return {
        supabaseExists: false,
        backendExists: false,
        needsSync: false
      };
    }

    // Check backend
    let backendExists = false;
    let backendId = undefined;

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/projects/${projectId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const backendProject = await response.json();
        backendExists = true;
        backendId = backendProject.id;
        console.log(`🔗 Backend exists: ${backendExists}, ID: ${backendId}`);
      } else {
        console.log(`🔗 Backend exists: false (${response.status})`);
      }
    } catch (backendError) {
      console.warn('⚠️ Backend check failed:', backendError);
    }

    return {
      supabaseExists,
      backendExists,
      backendId,
      needsSync: !backendExists
    };
  } catch (error) {
    console.error('❌ Sync status check failed:', error);
    return {
      supabaseExists: false,
      backendExists: false,
      needsSync: true
    };
  }
};

// Sync project from Supabase to backend
export const syncProjectToBackend = async (projectId: string, retries: number = 3): Promise<SyncResult> => {
  console.log(`🔄 Syncing project ${projectId} to backend (retries left: ${retries})`);

  try {
    // Get project data from Supabase
    const { data: project, error: fetchError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (fetchError || !project) {
      throw new Error(`Project not found in Supabase: ${fetchError?.message}`);
    }

    console.log('📋 Project data from Supabase:', project);

    // Parse coordinates
    const [lat, lon] = project.coordinates.split(',').map(coord => parseFloat(coord.trim()));
    
    const backendData = {
      id: project.id, // Use Supabase UUID as backend ID
      name: project.name,
      coordinates: project.coordinates,
      carbon_tons: project.carbon_tons,
      price_per_ton: project.price_per_ton || 25,
      currency: 'USD', // Default currency since not all projects may have this field
      latitude: lat,
      longitude: lon,
      created_at: project.created_at,
      sync_source: 'supabase'
    };

    console.log('📤 Sending to backend:', backendData);

    // Send to backend with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch(`${API_CONFIG.BASE_URL}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendData),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Project synced successfully:', result);
      
      return {
        success: true,
        projectId,
        backendId: result.id || projectId
      };
    } else {
      const errorText = await response.text();
      console.error(`❌ Backend sync failed: ${response.status} - ${errorText}`);
      
      // Retry on certain errors
      if (retries > 0 && (response.status >= 500 || response.status === 429)) {
        console.log(`🔄 Retrying sync in 2 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return await syncProjectToBackend(projectId, retries - 1);
      }
      
      throw new Error(`Backend sync failed: ${response.status} - ${errorText}`);
    }
  } catch (error) {
    console.error('💥 Project sync error:', error);
    
    if (error instanceof Error && error.name === 'AbortError') {
      const timeoutError = 'Sync request timed out';
      
      if (retries > 0) {
        console.log(`🔄 Retrying after timeout...`);
        await new Promise(resolve => setTimeout(resolve, 3000));
        return await syncProjectToBackend(projectId, retries - 1);
      }
      
      return {
        success: false,
        projectId,
        error: timeoutError
      };
    }
    
    return {
      success: false,
      projectId,
      error: error instanceof Error ? error.message : 'Unknown sync error'
    };
  }
};

// Ensure project is synced before analysis
export const ensureProjectSync = async (projectId: string): Promise<{ synced: boolean; backendId?: string; error?: string }> => {
  console.log(`🎯 Ensuring project ${projectId} is synced`);

  try {
    const status = await checkProjectSyncStatus(projectId);
    
    if (status.backendExists) {
      console.log('✅ Project already synced');
      return { synced: true, backendId: status.backendId };
    }
    
    if (status.needsSync) {
      console.log('🔄 Project needs sync, attempting now...');
      const syncResult = await syncProjectToBackend(projectId);
      
      if (syncResult.success) {
        console.log('✅ Project sync completed');
        return { synced: true, backendId: syncResult.backendId };
      } else {
        console.error('❌ Project sync failed:', syncResult.error);
        return { synced: false, error: syncResult.error };
      }
    }
    
    return { synced: false, error: 'Project not found in Supabase' };
  } catch (error) {
    console.error('💥 Sync ensure failed:', error);
    return { 
      synced: false, 
      error: error instanceof Error ? error.message : 'Unknown sync error' 
    };
  }
};

// Batch sync multiple projects
export const batchSyncProjects = async (projectIds: string[]): Promise<SyncResult[]> => {
  console.log(`📦 Batch syncing ${projectIds.length} projects`);
  
  const results: SyncResult[] = [];
  const batchSize = 3; // Process in small batches
  
  for (let i = 0; i < projectIds.length; i += batchSize) {
    const batch = projectIds.slice(i, i + batchSize);
    console.log(`📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(projectIds.length / batchSize)}`);
    
    const batchPromises = batch.map(async (projectId) => {
      try {
        return await syncProjectToBackend(projectId);
      } catch (error) {
        return {
          success: false,
          projectId,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    });
    
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
    
    // Add delay between batches
    if (i + batchSize < projectIds.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  const successful = results.filter(r => r.success).length;
  console.log(`📊 Batch sync complete: ${successful}/${results.length} successful`);
  
  return results;
};