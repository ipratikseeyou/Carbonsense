# Fix ProjectDetails Page for AWS Backend

## Replace the entire content of `src/pages/ProjectDetails.tsx` with:

```typescript
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import { ArrowLeft, MapPin, Calendar, DollarSign, Leaf, Satellite, TrendingUp, BarChart3, Download, Loader2, Building, Shield, TreePine } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { apiEndpoints } from '@/config/api';

const ProjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const { data: project, isLoading, error } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      if (!id) throw new Error('No project ID provided');
      
      console.log('Fetching project details for ID:', id);
      const response = await fetch(apiEndpoints.projectById(id));
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Project not found');
        }
        throw new Error('Failed to fetch project');
      }
      
      const data = await response.json();
      console.log('Fetched project:', data);
      return data;
    },
    enabled: !!id,
  });

  const handleAnalyzeProject = async () => {
    if (!id) return;
    
    setIsAnalyzing(true);
    try {
      console.log('Analyzing project:', id);
      const response = await fetch(apiEndpoints.analyzeProject(id), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to analyze project');

      const result = await response.json();
      console.log('Analysis result:', result);
      setAnalysisResult(result);
      
      toast({
        title: 'Analysis Complete!',
        description: 'Project has been analyzed with satellite data.',
      });
      
      // Refetch project data to get updated information
      window.location.reload();
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: 'Analysis Failed',
        description: 'Could not analyze project. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownloadReport = async () => {
    if (!id || !project) return;
    
    setIsDownloading(true);
    try {
      console.log('Downloading report for project:', id);
      const response = await fetch(apiEndpoints.projectReport(id));
      
      if (!response.ok) throw new Error('Failed to generate report');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.name.replace(/\s+/g, '-')}-report.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: 'Report Downloaded!',
        description: 'PDF report has been downloaded successfully.',
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: 'Download Failed',
        description: 'Could not generate report. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDelete = async () => {
    if (!project || !id || !window.confirm('Are you sure you want to delete this project?')) return;

    try {
      const response = await fetch(apiEndpoints.projectById(id), {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete project');

      toast({
        title: 'Success!',
        description: 'Project deleted successfully.',
      });

      navigate('/projects');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete project. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-satellite-blue/5">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive">Error loading project</h1>
            <p className="text-muted-foreground mt-2">
              {error.message === 'Project not found' ? 'Project not found.' : 'Failed to load project details.'}
            </p>
            <Button asChild className="mt-4">
              <Link to="/projects">Back to Projects</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-satellite-blue/5">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-satellite-blue mx-auto"></div>
            <p className="text-muted-foreground mt-4">Loading project details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!project) return null;

  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'JPY': return '¥';
      case 'INR': return '₹';
      default: return '$';
    }
  };

  const totalValue = (project.carbon_tons || 0) * (project.price_per_ton || 25);
  const currencySymbol = getCurrencySymbol(project.currency || 'USD');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-satellite-blue/5">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="sm" onClick={() => navigate('/projects')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Project Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">{project.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-2">
                      <MapPin className="h-4 w-4" />
                      {project.coordinates}
                    </CardDescription>
                  </div>
                  {project.satellite_image_url && (
                    <div className="w-32 h-32 rounded-lg overflow-hidden">
                      <img 
                        src={project.satellite_image_url} 
                        alt={project.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Leaf className="h-4 w-4" />
                        <span className="text-sm">Carbon Sequestration</span>
                      </div>
                      <p className="text-2xl font-semibold">{Number(project.carbon_tons).toLocaleString()} tCO₂</p>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <DollarSign className="h-4 w-4" />
                        <span className="text-sm">Price per Ton</span>
                      </div>
                      <p className="text-2xl font-semibold">
                        {currencySymbol}{Number(project.price_per_ton || 25).toFixed(2)}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <DollarSign className="h-4 w-4" />
                        <span className="text-sm">Total Value</span>
                      </div>
                      <p className="text-2xl font-semibold text-green-600">
                        {currencySymbol}{totalValue.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {project.project_area && (
                      <div>
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <TreePine className="h-4 w-4" />
                          <span className="text-sm">Project Area</span>
                        </div>
                        <p className="text-lg font-medium">{project.project_area} hectares</p>
                      </div>
                    )}

                    {project.forest_type && (
                      <div>
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <TreePine className="h-4 w-4" />
                          <span className="text-sm">Forest Type</span>
                        </div>
                        <p className="text-lg font-medium">{project.forest_type}</p>
                      </div>
                    )}

                    {project.developer_name && (
                      <div>
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <Building className="h-4 w-4" />
                          <span className="text-sm">Developer</span>
                        </div>
                        <p className="text-lg font-medium">{project.developer_name}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Verification & Methodology */}
            {(project.verification_standard || project.baseline_methodology) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Verification & Methodology
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {project.verification_standard && (
                    <div>
                      <p className="text-sm text-muted-foreground">Verification Standard</p>
                      <Badge variant="secondary" className="mt-1">
                        {project.verification_standard}
                      </Badge>
                    </div>
                  )}
                  
                  {project.baseline_methodology && (
                    <div>
                      <p className="text-sm text-muted-foreground">Baseline Methodology</p>
                      <Badge variant="outline" className="mt-1">
                        {project.baseline_methodology}
                      </Badge>
                    </div>
                  )}

                  {project.uncertainty_percentage && (
                    <div>
                      <p className="text-sm text-muted-foreground">Uncertainty</p>
                      <p className="text-lg font-medium">±{project.uncertainty_percentage}%</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Analysis Results */}
            {project.fire_count !== undefined && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Satellite className="h-5 w-5" />
                    Satellite Analysis Results
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Fire Incidents</p>
                      <p className="text-2xl font-semibold text-orange-600">{project.fire_count || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Temperature</p>
                      <p className="text-2xl font-semibold">{project.temperature || 'N/A'}°C</p>
                    </div>
                  </div>
                  
                  {project.weather_description && (
                    <div>
                      <p className="text-sm text-muted-foreground">Weather Conditions</p>
                      <p className="text-lg capitalize">{project.weather_description}</p>
                    </div>
                  )}
                  
                  {project.humidity && (
                    <div>
                      <p className="text-sm text-muted-foreground">Humidity</p>
                      <p className="text-lg">{project.humidity}%</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={handleAnalyzeProject} 
                  disabled={isAnalyzing}
                  className="w-full"
                  variant="satellite"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Satellite className="mr-2 h-4 w-4" />
                      Analyze with Satellite
                    </>
                  )}
                </Button>
                
                <Button 
                  onClick={handleDownloadReport}
                  disabled={isDownloading}
                  variant="outline"
                  className="w-full"
                >
                  {isDownloading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Download PDF Report
                    </>
                  )}
                </Button>
                
                <Button 
                  onClick={() => navigate(`/projects/${id}/edit`)}
                  variant="outline"
                  className="w-full"
                >
                  Edit Project
                </Button>
                
                <Button 
                  onClick={handleDelete}
                  variant="destructive"
                  className="w-full"
                >
                  Delete Project
                </Button>
              </CardContent>
            </Card>

            {/* Project Status */}
            <Card>
              <CardHeader>
                <CardTitle>Project Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge variant="secondary" className="bg-green-500/10 text-green-600">
                      Active
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Created</span>
                    <span className="text-sm">
                      {new Date(project.created_at || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {project.updated_at && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Last Updated</span>
                      <span className="text-sm">
                        {new Date(project.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
```

## Key Changes Made:

1. **Removed Supabase** - All data fetching now uses AWS API endpoints
2. **Fixed Project Fetching** - Uses `apiEndpoints.projectById(id)` to get project details
3. **Analyze Function** - Makes POST request to `/projects/{id}/analyze` endpoint
4. **PDF Download** - Fetches from `/projects/{id}/report` endpoint  
5. **Delete Function** - Uses DELETE method on project endpoint
6. **Currency Support** - Displays proper currency symbols
7. **Enhanced Error Handling** - Better error messages and loading states
8. **Analysis Results Display** - Shows fire count, temperature, weather data after analysis

## Testing Instructions:

1. Create a new project
2. You should be redirected to the project details page
3. Click "Analyze with Satellite" - this will fetch NASA FIRMS and weather data
4. Once analyzed, click "Download PDF Report" to get the comprehensive report
5. The project should show analysis results (fire incidents, temperature, etc.)

This implementation is fully integrated with your AWS backend and should resolve all the issues with project details not loading and analysis/PDF functionality.
