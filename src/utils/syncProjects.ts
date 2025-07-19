
import { supabase } from '@/integrations/supabase/client';
import { apiEndpoints } from '@/config/api';
import { toast } from '@/hooks/use-toast';

export interface SyncResult {
  success: boolean;
  projectId: string;
  error?: string;
}

export interface SyncSummary {
  total: number;
  successful: number;
  failed: number;
  results: SyncResult[];
}

/**
 * Sync existing Supabase projects to AWS backend
 */
export async function syncExistingProjectsToAWS(): Promise<SyncSummary> {
  console.log('🔄 Starting sync of existing projects to AWS...');
  
  try {
    // Fetch all projects from Supabase
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*');

    if (error) {
      console.error('Failed to fetch projects from Supabase:', error);
      throw new Error(`Failed to fetch projects: ${error.message}`);
    }

    const results: SyncResult[] = [];
    let successful = 0;
    let failed = 0;

    console.log(`📊 Found ${projects?.length || 0} projects to sync`);

    // Sync each project to AWS
    for (const project of projects || []) {
      try {
        console.log(`🔄 Syncing project ${project.id}...`);
        
        const response = await fetch(apiEndpoints.projects, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(project),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ Failed to sync project ${project.id}:`, errorText);
          results.push({
            success: false,
            projectId: project.id,
            error: errorText,
          });
          failed++;
        } else {
          console.log(`✅ Successfully synced project ${project.id}`);
          results.push({
            success: true,
            projectId: project.id,
          });
          successful++;
        }
      } catch (error) {
        console.error(`❌ Error syncing project ${project.id}:`, error);
        results.push({
          success: false,
          projectId: project.id,
          error: error.message,
        });
        failed++;
      }
    }

    const summary: SyncSummary = {
      total: projects?.length || 0,
      successful,
      failed,
      results,
    };

    console.log('📈 Sync complete:', summary);
    return summary;
  } catch (error) {
    console.error('💥 Error during sync operation:', error);
    throw error;
  }
}

/**
 * Verify data consistency between Supabase and AWS
 */
export async function verifyDataConsistency(): Promise<{
  supabaseCount: number;
  awsCount: number;
  consistent: boolean;
  missingInAws: string[];
}> {
  try {
    console.log('🔍 Verifying data consistency...');
    
    // Get Supabase projects
    const { data: supabaseProjects, error: supabaseError } = await supabase
      .from('projects')
      .select('id');

    if (supabaseError) {
      throw new Error(`Supabase query failed: ${supabaseError.message}`);
    }

    // Get AWS projects
    const awsResponse = await fetch(apiEndpoints.projects);
    if (!awsResponse.ok) {
      throw new Error(`AWS API failed: ${awsResponse.status}`);
    }
    
    const awsProjects = await awsResponse.json();
    
    const supabaseIds = new Set(supabaseProjects?.map(p => p.id) || []);
    const awsIds = new Set(awsProjects?.map(p => p.id) || []);
    
    const missingInAws = Array.from(supabaseIds).filter(id => !awsIds.has(id));
    
    const result = {
      supabaseCount: supabaseIds.size,
      awsCount: awsIds.size,
      consistent: missingInAws.length === 0 && supabaseIds.size === awsIds.size,
      missingInAws,
    };
    
    console.log('📊 Consistency check result:', result);
    return result;
  } catch (error) {
    console.error('💥 Error during consistency check:', error);
    throw error;
  }
}

/**
 * Sync a single project to AWS with retry logic
 */
export async function syncSingleProject(projectId: string, maxRetries: number = 3): Promise<boolean> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Syncing project ${projectId} (attempt ${attempt}/${maxRetries})`);
      
      // Get project from Supabase
      const { data: project, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (error) {
        throw new Error(`Failed to fetch project: ${error.message}`);
      }

      // Sync to AWS
      const response = await fetch(apiEndpoints.projects, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(project),
      });

      if (!response.ok) {
        throw new Error(`AWS sync failed: ${await response.text()}`);
      }

      console.log(`✅ Project ${projectId} synced successfully`);
      return true;
    } catch (error) {
      console.error(`❌ Attempt ${attempt} failed for project ${projectId}:`, error);
      
      if (attempt === maxRetries) {
        console.error(`💥 All ${maxRetries} attempts failed for project ${projectId}`);
        return false;
      }
      
      // Exponential backoff
      const delay = Math.pow(2, attempt) * 1000;
      console.log(`⏳ Waiting ${delay}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return false;
}
