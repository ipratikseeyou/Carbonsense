
import { makeApiRequest, API_CONFIG } from '@/config/api';
import { toast } from '@/hooks/use-toast';
import { isValidUUID } from './validateUUID';

export interface AnalysisResult {
  ndvi?: number;
  forest_cover?: number;
  carbon_estimate?: number;
  recommendations?: string;
  confidence_score?: number;
}

export interface ApiError {
  detail?: Array<{ msg: string; type: string }> | string;
  message?: string;
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
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'object' && error !== null) {
    const apiError = error as ApiError;
    
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
  
  return 'An unexpected error occurred. Please try again.';
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
    onStart();
    
    const response = await makeApiRequest(
      API_CONFIG.ENDPOINTS.ANALYZE_PROJECT(validProjectId),
      { method: 'POST' }
    );
    
    if (!response.ok) {
      let errorData: ApiError;
      try {
        errorData = await response.json();
      } catch {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }
      
      const errorMessage = parseApiError(errorData);
      throw new Error(errorMessage);
    }
    
    const result: AnalysisResult = await response.json();
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
    onStart();
    
    const response = await makeApiRequest(
      API_CONFIG.ENDPOINTS.DOWNLOAD_REPORT(validProjectId)
    );
    
    if (!response.ok) {
      let errorData: ApiError;
      try {
        errorData = await response.json();
      } catch {
        throw new Error(`Report generation failed: ${response.statusText}`);
      }
      
      const errorMessage = parseApiError(errorData);
      throw new Error(errorMessage);
    }
    
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
