import React, { useState, useEffect } from 'react';
import { carbonApi, Project, AnalysisResult } from '@/services/carbonApi';
import NDVIChart from './NDVIChart';
import { Loader2, AlertCircle, MapPin, DollarSign, Calendar, Trees, Download, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

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
      const projectData = await carbonApi.getProject(projectId);
      setProject(projectData);
    } catch (err) {
      setError('Failed to load project');
      toast({
        title: 'Error',
        description: 'Failed to load project details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const runAnalysis = async () => {
    try {
      setAnalyzing(true);
      setError(null);
      const result = await carbonApi.analyzeProject(projectId);
      setAnalysis(result);
      toast({
        title: 'Analysis Complete',
        description: 'Satellite analysis has been completed successfully',
      });
    } catch (err) {
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
    try {
      setDownloading(true);
      const blob = await carbonApi.downloadReport(projectId);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project?.name || 'project'}-report.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Report Downloaded',
        description: 'Project report has been downloaded successfully',
      });
    } catch (err) {
      toast({
        title: 'Download Failed',
        description: 'Failed to download project report',
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Total Carbon</p>
                    <p className="text-2xl font-bold text-primary">
                      {analysis.carbon_stock.total_carbon_tons.toLocaleString()} tons
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Carbon per Hectare</p>
                    <p className="text-2xl font-bold text-secondary">
                      {analysis.carbon_stock.carbon_per_hectare.toFixed(2)} tons/ha
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Area</p>
                    <p className="text-2xl font-bold text-accent">
                      {analysis.carbon_stock.area_hectares.toLocaleString()} ha
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* NDVI Chart */}
          <NDVIChart 
            projectId={projectId}
            startDate={project.monitoring_period_start}
            endDate={project.monitoring_period_end}
          />
        </div>
      )}
    </div>
  );
};

export default ProjectDashboard;