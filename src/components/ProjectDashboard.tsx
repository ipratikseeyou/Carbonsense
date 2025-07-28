import React, { useState, useEffect } from 'react';
import { carbonApi, AnalysisResult } from '@/services/carbonApi';
import { supabase } from '@/integrations/supabase/client';
import NDVIChart from './NDVIChart';
import { Loader2, AlertCircle, MapPin, DollarSign, Calendar, Trees, Download, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

// Project interface for Supabase data
interface Project {
  id: string;
  name: string;
  coordinates: string;
  carbon_tons: number;
  price_per_ton?: number;
  currency?: string;
  satellite_image_url?: string;
  created_at?: string;
  monitoring_period_start?: string;
  monitoring_period_end?: string;
}

interface ProjectDashboardProps {
  projectId: string;
}

export const ProjectDashboard: React.FC<ProjectDashboardProps> = ({ projectId }) => {
  const [project, setProject] = useState<Project | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const loadProject = async () => {
    try {
      setLoading(true);
      console.log('Loading project from Supabase:', projectId);
      
      const { data: projectData, error: supabaseError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      console.log('Project data loaded from Supabase:', projectData);
      setProject(projectData);
      setError(null);
    } catch (err) {
      console.error('Failed to load project:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load project';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: `Failed to load project: ${errorMessage}`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const runAnalysis = async () => {
    if (!project?.coordinates) {
      setError('Project coordinates not available');
      return;
    }

    try {
      setAnalyzing(true);
      setError(null);
      
      console.log('Starting analysis for project:', projectId);
      console.log('Project coordinates:', project.coordinates);
      
      const [lat, lon] = project.coordinates.split(',').map(Number);
      console.log('Parsed coordinates:', { lat, lon });
      
      // Use testSatelliteLocation with coordinates since AWS backend doesn't have the project
      const result = await carbonApi.testSatelliteLocation(lat, lon);
      console.log('Analysis result:', result);
      
      setAnalysis(result);
      toast({
        title: 'Analysis Complete',
        description: 'Satellite analysis has been completed successfully',
      });
    } catch (err) {
      console.error('Analysis error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze project';
      setError(errorMessage);
      toast({
        title: 'Analysis Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const downloadReport = async () => {
    if (!project) {
      toast({
        title: 'Download Failed',
        description: 'Project data not available',
        variant: 'destructive',
      });
      return;
    }

    try {
      setDownloading(true);
      
      // Generate report using local project data and analysis results
      const { generateProjectPDF } = await import('@/utils/generateProjectPDF');
      
      // Convert analysis result to the format expected by generateProjectPDF
      const analysisForPdf = analysis ? {
        ndvi: analysis.ndvi_summary?.mean_ndvi,
        forest_cover: analysis.carbon_stock?.confidence_level ? analysis.carbon_stock.confidence_level * 100 : undefined,
        carbon_estimate: analysis.carbon_stock?.total_tons,
        confidence_score: analysis.carbon_stock?.confidence_level,
        recommendations: `Based on satellite analysis: ${analysis.carbon_stock?.vegetation_density || 'Standard vegetation density detected'}`
      } : undefined;
      
      const pdf = generateProjectPDF(project, analysisForPdf);
      pdf.save(`${project.name || 'project'}-report.pdf`);

      toast({
        title: 'Report Downloaded',
        description: 'Project report has been downloaded successfully',
      });
    } catch (err) {
      console.error('Report generation error:', err);
      toast({
        title: 'Download Failed',
        description: 'Failed to generate project report',
        variant: 'destructive',
      });
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <span className="text-destructive">{error}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!project) return null;

  const [lat, lon] = project.coordinates.split(',').map(Number);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Project Header */}
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">{project.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-semibold">{lat.toFixed(4)}°, {lon.toFixed(4)}°</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Trees className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Carbon Sequestered</p>
                <p className="font-semibold">{project.carbon_tons.toLocaleString()} tons</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Price per Ton</p>
                <p className="font-semibold">{project.currency} {project.price_per_ton}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-semibold">{new Date(project.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            {!analysis && (
              <Button
                onClick={runAnalysis}
                disabled={analyzing}
                className="flex items-center gap-2"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <BarChart3 className="h-4 w-4" />
                    Run Satellite Analysis
                  </>
                )}
              </Button>
            )}

            <Button
              onClick={downloadReport}
              disabled={downloading}
              variant="outline"
              className="flex items-center gap-2"
            >
              {downloading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Download Report
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <span className="text-destructive">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-8">
          {/* Carbon Stock Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trees className="h-5 w-5" />
                Carbon Stock Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(analysis.carbon_stock?.total_tons || 0) === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Satellite Data Available</h3>
                  <p className="text-muted-foreground mb-4">
                    Satellite analysis could not find sufficient vegetation data for this location. 
                    This may be due to:
                  </p>
                  <ul className="text-sm text-muted-foreground text-left max-w-md mx-auto">
                    <li>• Cloud cover during satellite passes</li>
                    <li>• Limited forest cover in the area</li>
                    <li>• Recent deforestation or land use changes</li>
                    <li>• Coordinates pointing to water bodies or urban areas</li>
                  </ul>
                  <Button 
                    onClick={runAnalysis} 
                    variant="outline" 
                    className="mt-4"
                    disabled={analyzing}
                  >
                    {analyzing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Retrying...
                      </>
                    ) : (
                      'Retry Analysis'
                    )}
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">Total Carbon</p>
                       <p className="text-2xl font-bold text-primary">
                         {(analysis.carbon_stock?.total_tons || 0).toLocaleString()} tons
                       </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">Carbon per Hectare</p>
                       <p className="text-2xl font-bold text-secondary">
                         {(analysis.carbon_stock?.per_hectare || 0).toFixed(2)} tons/ha
                       </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">Area</p>
                       <p className="text-2xl font-bold text-accent">
                         {(analysis.carbon_stock?.area_hectares || 0).toLocaleString()} ha
                       </p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>

          {/* NDVI Chart - only show if we have meaningful data */}
          {(analysis.carbon_stock?.total_tons || 0) > 0 && (
            <NDVIChart 
              projectId={projectId}
              coordinates={project.coordinates}
              startDate={project.monitoring_period_start}
              endDate={project.monitoring_period_end}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectDashboard;