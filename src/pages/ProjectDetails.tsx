import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import { ArrowLeft, MapPin, Calendar, DollarSign, Leaf, Satellite, BarChart3, Download, Loader2, Building, Shield, TreePine, Edit, Trash2, Calculator } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { isValidUUID } from '@/utils/validateUUID';
import { supabase } from '@/integrations/supabase/client';
import { useCurrencyConversion } from '@/hooks/useCurrencyConversion';
import { generateProjectPDF } from '@/utils/generateProjectPDF';
import { getBiomassPerHectare, getCalculationBreakdown, getForestBiomassData } from '@/utils/forestBiomassData';

interface AnalysisResult {
  ndvi?: number;
  forest_cover?: number;
  carbon_estimate?: number;
  recommendations?: string;
  confidence_score?: number;
}

const ProjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const { getSymbol } = useCurrencyConversion();

  const { data: project, isLoading, error, refetch } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      if (!id || !isValidUUID(id)) {
        throw new Error('Invalid project ID');
      }
      
      console.log(`Fetching project details from Supabase: ${id}`);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Supabase error:', error);
        if (error.code === 'PGRST116') {
          throw new Error('Project not found');
        }
        throw new Error(`Failed to fetch project: ${error.message}`);
      }
      
      console.log('Fetched project data from Supabase:', data);
      return data;
    },
    enabled: !!id && isValidUUID(id),
  });

  const handleDownloadReport = async () => {
    if (!project) return;
    
    setIsDownloading(true);
    
    try {
      console.log('Generating professional PDF report for project:', project.id);
      
      // Generate the professional PDF using the new utility
      const pdf = generateProjectPDF(project, analysisResult || undefined);
      
      // Create blob and download
      const pdfBlob = pdf.output('blob');
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.name.replace(/\s+/g, '-').toLowerCase()}-professional-report.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: 'Professional PDF Report Downloaded!',
        description: 'Comprehensive project analysis report has been generated and downloaded.',
      });
      
    } catch (error) {
      console.error('Error generating professional PDF:', error);
      toast({
        title: 'Download Failed',
        description: 'Could not generate professional PDF report. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleAnalyzeProject = async () => {
    setIsAnalyzing(true);
    
    // Simulate analysis - in a real app, this would call your analysis API
    setTimeout(() => {
      const mockResult: AnalysisResult = {
        ndvi: 0.75 + Math.random() * 0.2,
        forest_cover: 80 + Math.random() * 15,
        carbon_estimate: project ? Number(project.carbon_tons) * (0.9 + Math.random() * 0.2) : 0,
        recommendations: "Forest coverage is excellent. Consider expanding monitoring to adjacent areas.",
        confidence_score: 0.85 + Math.random() * 0.1
      };
      
      setAnalysisResult(mockResult);
      setIsAnalyzing(false);
      
      toast({
        title: 'Analysis Complete!',
        description: 'Project analysis has been completed successfully.',
      });
    }, 2000);
  };

  const handleDelete = async () => {
    if (!project || !window.confirm('Are you sure you want to delete this project?')) return;

    try {
      console.log(`Deleting project from Supabase: ${project.id}`);
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', project.id);

      if (error) {
        throw new Error(`Failed to delete project: ${error.message}`);
      }

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

  // Early return for invalid UUID
  if (!id || !isValidUUID(id)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-satellite-blue/5">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive">Invalid Project ID</h1>
            <p className="text-muted-foreground mt-2">The project ID format is not valid. Please check the URL.</p>
            <Button asChild className="mt-4">
              <Link to="/projects">Back to Projects</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-satellite-blue/5">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive">Error loading project</h1>
            <p className="text-muted-foreground mt-2">Project not found or failed to load.</p>
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
            <p className="text-foreground mt-4">Loading project details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!project) return null;

  const currency = 'USD';
  const currencySymbol = getSymbol(currency);
  const totalValue = (project.carbon_tons || 0) * (project.price_per_ton || 25);

  // Get forest-specific biomass data (with fallback for missing properties)
  const forestType = (project as any).forest_type || 'Mixed temperate forest';
  const biomassPerHa = getBiomassPerHectare(forestType);
  const forestBiomassData = getForestBiomassData(forestType);
  
  // Get calculation breakdown if project area is available
  const projectArea = (project as any).project_area || 100; // Default 100 hectares
  const calculationBreakdown = getCalculationBreakdown(projectArea, forestType);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-satellite-blue/5">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/projects')} 
            className="text-foreground border-border hover:text-foreground hover:bg-accent"
          >
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
                    <CardTitle className="text-2xl mb-2 text-foreground">{project.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 text-base text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {project.coordinates}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="bg-satellite-blue/10 text-satellite-blue">
                    <Satellite className="h-3 w-3 mr-1" />
                    Monitored
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                {project.satellite_image_url && (
                  <div className="mb-6">
                    <img 
                      src={project.satellite_image_url} 
                      alt={project.name}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <Leaf className="h-6 w-6 text-green-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-foreground">{Number(project.carbon_tons).toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Carbon Tons</div>
                  </div>

                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <DollarSign className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-foreground">
                      {currencySymbol}{Number(project.price_per_ton || 25).toFixed(2)}
                    </div>
                    <div className="text-sm text-muted-foreground">Per Ton</div>
                  </div>

                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <TreePine className="h-6 w-6 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-foreground">
                      {(project as any).project_area || '100'}
                    </div>
                    <div className="text-sm text-muted-foreground">Hectares</div>
                  </div>

                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <Calendar className="h-6 w-6 text-orange-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-foreground">
                      {new Date(project.created_at || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="text-sm text-muted-foreground">Created</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Forest Biomass Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <TreePine className="h-5 w-5" />
                  Forest & Biomass Information
                </CardTitle>
                <CardDescription>IPCC-based forest biomass data and carbon calculations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Forest Type</div>
                      <div className="text-lg font-semibold text-foreground">{forestType}</div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Biomass per Hectare</div>
                      <div className="text-lg font-semibold text-green-600">{biomassPerHa} t/ha</div>
                      {forestBiomassData && (
                        <div className="text-xs text-muted-foreground">
                          Source: {forestBiomassData.source} ({forestBiomassData.year})
                        </div>
                      )}
                    </div>
                  </div>

                  {calculationBreakdown && (
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Calculation Formula</div>
                        <div className="text-xs font-mono bg-muted p-2 rounded">
                          {calculationBreakdown.formula}
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Calculated Carbon Credits</div>
                        <div className="text-lg font-semibold text-blue-600">
                          {calculationBreakdown.carbonCredits.toLocaleString()} tCO₂e
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Based on {calculationBreakdown.area} ha × {calculationBreakdown.forestCoverage}% coverage
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-foreground">Project Details</CardTitle>
                <CardDescription>Comprehensive project information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Verification & Standards
                    </h4>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Standard:</span>
                        <span className="font-medium text-foreground">VCS v4.0</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Methodology:</span>
                        <span className="font-medium text-foreground">VM0015</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Financial Details
                    </h4>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Currency:</span>
                        <span className="font-medium text-foreground">{currency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Value:</span>
                        <span className="font-medium text-green-600">{currencySymbol}{totalValue.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {analysisResult && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <BarChart3 className="h-5 w-5" />
                    Analysis Results
                  </CardTitle>
                  <CardDescription>
                    Latest AI-powered analysis of this project
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {analysisResult.ndvi && (
                        <div className="p-3 bg-green-50 rounded-lg">
                          <div className="text-sm text-muted-foreground">NDVI Score</div>
                          <div className="text-2xl font-bold text-green-600">
                            {Number(analysisResult.ndvi).toFixed(3)}
                          </div>
                        </div>
                      )}
                      {analysisResult.forest_cover && (
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <div className="text-sm text-muted-foreground">Forest Cover</div>
                          <div className="text-2xl font-bold text-blue-600">
                            {Number(analysisResult.forest_cover).toFixed(1)}%
                          </div>
                        </div>
                      )}
                    </div>
                    {analysisResult.recommendations && (
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <div className="text-sm font-medium mb-2 text-foreground">Recommendations</div>
                        <p className="text-sm text-muted-foreground">{analysisResult.recommendations}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground">Project Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground">Total Value</div>
                  <div className="text-xl font-bold text-foreground">
                    {currencySymbol}{totalValue.toLocaleString()}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground">Status</div>
                  <div className="text-xl font-bold text-green-600">
                    Active
                  </div>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground">Last Updated</div>
                  <div className="text-xl font-bold text-foreground">
                    {new Date(project.created_at || '').toLocaleDateString()}
                  </div>
                </div>

                {calculationBreakdown && (
                  <div>
                    <div className="text-sm text-muted-foreground">Carbon Calculation</div>
                    <div className="text-sm font-mono bg-muted p-2 rounded mt-1">
                      {calculationBreakdown.area}ha × {calculationBreakdown.biomassPerHa}t/ha
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-foreground">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={handleAnalyzeProject}
                  disabled={isAnalyzing}
                  variant="satellite"
                  className="w-full"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Analyze Project
                    </>
                  )}
                </Button>

                <Button 
                  onClick={handleDownloadReport}
                  disabled={isDownloading}
                  variant="earth"
                  className="w-full"
                >
                  {isDownloading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating Professional PDF...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Download Professional Report
                    </>
                  )}
                </Button>

                <Button asChild variant="outline" className="w-full">
                  <Link to={`/projects/${project.id}/edit`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Project
                  </Link>
                </Button>
                
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Project
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
