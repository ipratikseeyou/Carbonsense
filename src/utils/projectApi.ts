
import { makeApiRequest, API_CONFIG } from '@/config/api';
import { toast } from '@/hooks/use-toast';
import { isValidUUID } from './validateUUID';
import { syncSingleProject } from './syncProjects';

export interface AnalysisResult {
  ndvi?: number;
  forest_cover?: number;
  carbon_estimate?: number;
  recommendations?: string;
  confidence_score?: number;
  analysis_id?: string;
  processed_at?: string;
}

export interface ApiError {
  detail?: Array<{ msg: string; type: string }> | string;
  message?: string;
  error?: string;
}

const validateProjectId = (projectId: string | undefined): string => {
  if (!projectId) {
    throw new Error('Project ID is required');
  }
  
  if (!isValidUUID(projectId)) {
    throw new Error('Invalid project ID format. Please check the URL or select a valid project.');
  }
  
  return projectId;
};

const parseApiError = (error: unknown): string => {
  console.error('API Error details:', error);
  
  if (error instanceof Error) {
    if (error.name === 'AbortError') {
      return 'Request timed out. Please try again.';
    }
    return error.message;
  }
  
  if (typeof error === 'object' && error !== null) {
    const apiError = error as ApiError;
    
    if (apiError.error) {
      return apiError.error;
    }
    
    if (Array.isArray(apiError.detail)) {
      return apiError.detail[0]?.msg || 'An error occurred with the request';
    }
    
    if (typeof apiError.detail === 'string') {
      return apiError.detail;
    }
    
    if (apiError.message) {
      return apiError.message;
    }
  }
  
  return 'An unexpected error occurred. Please check your connection and try again.';
};

const handleProjectNotFound = async (projectId: string): Promise<boolean> => {
  console.log(`Project ${projectId} not found in AWS. Attempting to sync...`);
  
  toast({
    title: 'Syncing Project',
    description: 'Project not found in analysis backend. Attempting to sync...',
  });
  
  const syncSuccess = await syncSingleProject(projectId);
  
  if (syncSuccess) {
    toast({
      title: 'Project Synced',
      description: 'Project has been synchronized successfully. Please try again.',
    });
    return true;
  } else {
    toast({
      title: 'Sync Failed',
      description: 'Unable to sync project. Please contact support.',
      variant: 'destructive',
    });
    return false;
  }
};

export const analyzeProject = async (
  projectId: string | undefined,
  onStart: () => void,
  onComplete: (result: AnalysisResult) => void,
  onError: (error: string) => void
): Promise<void> => {
  try {
    // Validate project ID first
    const validProjectId = validateProjectId(projectId);
    console.log(`Starting analysis for project: ${validProjectId}`);
    onStart();
    
    const response = await makeApiRequest(
      API_CONFIG.ENDPOINTS.ANALYZE_PROJECT(validProjectId),
      { method: 'POST' }
    );
    
    if (!response.ok) {
      // Handle 404 - project not found in AWS
      if (response.status === 404) {
        const synced = await handleProjectNotFound(validProjectId);
        if (synced) {
          // Retry after successful sync
          const retryResponse = await makeApiRequest(
            API_CONFIG.ENDPOINTS.ANALYZE_PROJECT(validProjectId),
            { method: 'POST' }
          );
          
          if (!retryResponse.ok) {
            throw new Error(`Analysis failed after sync: ${retryResponse.status} ${retryResponse.statusText}`);
          }
          
          const result: AnalysisResult = await retryResponse.json();
          console.log('Analysis result (after sync):', result);
          onComplete(result);
          
          toast({
            title: 'Analysis Complete!',
            description: 'Project analysis completed successfully after sync.',
          });
          return;
        } else {
          throw new Error('Project not found and sync failed. Please try uploading the project again.');
        }
      }
      
      let errorData: ApiError;
      try {
        errorData = await response.json();
        console.error('Analysis API error response:', errorData);
      } catch {
        throw new Error(`Analysis failed: ${response.status} ${response.statusText}`);
      }
      
      const errorMessage = parseApiError(errorData);
      throw new Error(errorMessage);
    }
    
    const result: AnalysisResult = await response.json();
    console.log('Analysis result:', result);
    onComplete(result);
    
    toast({
      title: 'Analysis Complete!',
      description: 'Project analysis has been completed successfully.',
    });
    
  } catch (error) {
    console.error('Error analyzing project:', error);
    const errorMessage = parseApiError(error);
    
    onError(errorMessage);
    
    toast({
      title: 'Analysis Failed',
      description: errorMessage,
      variant: 'destructive',
    });
  }
};

export const downloadProjectReport = async (
  projectId: string | undefined,
  projectName: string,
  onStart: () => void,
  onComplete: () => void,
  onError: (error: string) => void
): Promise<void> => {
  try {
    // Validate project ID first
    const validProjectId = validateProjectId(projectId);
    console.log(`Starting report download for project: ${validProjectId}`);
    onStart();
    
    const response = await makeApiRequest(
      API_CONFIG.ENDPOINTS.DOWNLOAD_REPORT(validProjectId)
    );
    
    if (!response.ok) {
      // Handle 404 - project not found in AWS
      if (response.status === 404) {
        const synced = await handleProjectNotFound(validProjectId);
        if (synced) {
          // Retry after successful sync
          const retryResponse = await makeApiRequest(
            API_CONFIG.ENDPOINTS.DOWNLOAD_REPORT(validProjectId)
          );
          
          if (!retryResponse.ok) {
            throw new Error(`Report generation failed after sync: ${retryResponse.status} ${retryResponse.statusText}`);
          }
          
          // Handle PDF download for retry response
          const blob = await retryResponse.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${projectName.replace(/\s+/g, '-').toLowerCase()}-report.pdf`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          
          onComplete();
          
          toast({
            title: 'Report Downloaded!',
            description: 'Project report downloaded successfully after sync.',
          });
          return;
        } else {
          throw new Error('Project not found and sync failed. Please try uploading the project again.');
        }
      }
      
      let errorData: ApiError;
      try {
        errorData = await response.json();
        console.error('Download API error response:', errorData);
      } catch {
        throw new Error(`Report generation failed: ${response.status} ${response.statusText}`);
      }
      
      const errorMessage = parseApiError(errorData);
      throw new Error(errorMessage);
    }
    
    // Handle PDF download
    const contentType = response.headers.get('content-type');
    console.log('Response content type:', contentType);
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.replace(/\s+/g, '-').toLowerCase()}-report.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    onComplete();
    
    toast({
      title: 'Report Downloaded!',
      description: 'Project report has been downloaded successfully.',
    });
    
  } catch (error) {
    console.error('Error downloading report:', error);
    const errorMessage = parseApiError(error);
    
    onError(errorMessage);
    
    toast({
      title: 'Download Failed',
      description: errorMessage,
      variant: 'destructive',
    });
  }
};
