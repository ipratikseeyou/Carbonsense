
import { makeApiRequest, API_CONFIG } from '@/config/api';
import { toast } from '@/hooks/use-toast';

export interface AnalysisResult {
  ndvi?: number;
  forest_cover?: number;
  carbon_estimate?: number;
  recommendations?: string;
  confidence_score?: number;
}

export const analyzeProject = async (
  projectId: string,
  onStart: () => void,
  onComplete: (result: AnalysisResult) => void,
  onError: (error: string) => void
): Promise<void> => {
  try {
    onStart();
    
    const response = await makeApiRequest(
      API_CONFIG.ENDPOINTS.ANALYZE_PROJECT(projectId),
      { method: 'POST' }
    );
    
    if (!response.ok) {
      throw new Error(`Analysis failed: ${response.statusText}`);
    }
    
    const result: AnalysisResult = await response.json();
    onComplete(result);
    
    toast({
      title: 'Analysis Complete!',
      description: 'Project analysis has been completed successfully.',
    });
    
  } catch (error) {
    console.error('Error analyzing project:', error);
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Failed to analyze project. Make sure your backend is running.';
    
    onError(errorMessage);
    
    toast({
      title: 'Analysis Failed',
      description: errorMessage,
      variant: 'destructive',
    });
  }
};

export const downloadProjectReport = async (
  projectId: string,
  projectName: string,
  onStart: () => void,
  onComplete: () => void,
  onError: (error: string) => void
): Promise<void> => {
  try {
    onStart();
    
    const response = await makeApiRequest(
      API_CONFIG.ENDPOINTS.DOWNLOAD_REPORT(projectId)
    );
    
    if (!response.ok) {
      throw new Error(`Report generation failed: ${response.statusText}`);
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
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Failed to download report. Make sure your backend is running.';
    
    onError(errorMessage);
    
    toast({
      title: 'Download Failed',
      description: errorMessage,
      variant: 'destructive',
    });
  }
};
