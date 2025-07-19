import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import { ArrowLeft, MapPin, Calendar, DollarSign, Leaf, Satellite, BarChart3, Download, Loader2, Building, Shield, TreePine, Edit, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { isValidUUID } from '@/utils/validateUUID';
import { supabase } from '@/integrations/supabase/client';
import { useCurrencyConversion } from '@/hooks/useCurrencyConversion';
import jsPDF from 'jspdf';

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
      // Create new PDF document
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.width;
      const margin = 20;
      let yPosition = margin;
      
      // Helper function to add text with word wrapping
      const addText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 12) => {
        pdf.setFontSize(fontSize);
        const lines = pdf.splitTextToSize(text, maxWidth);
        pdf.text(lines, x, y);
        return y + (lines.length * fontSize * 0.5);
      };
      
      // Header
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Carbon Project Report', margin, yPosition);
      yPosition += 15;
      
      // Project name
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      yPosition = addText(project.name, margin, yPosition, pageWidth - 2 * margin, 16);
      yPosition += 10;
      
      // Location
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      yPosition = addText(`Location: ${project.coordinates}`, margin, yPosition, pageWidth - 2 * margin);
      yPosition += 10;
      
      // Project Summary Section
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Project Summary', margin, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      const currencySymbol = getSymbol('USD');
      const totalValue = (project.carbon_tons || 0) * (project.price_per_ton || 25);
      
      const summaryData = [
        `Carbon Sequestration: ${Number(project.carbon_tons).toLocaleString()} tCO₂`,
        `Price per Ton: ${currencySymbol}${Number(project.price_per_ton || 25).toFixed(2)}`,
        `Total Project Value: ${currencySymbol}${totalValue.toLocaleString()}`,
        `Created: ${new Date(project.created_at || '').toLocaleDateString()}`,
        `Status: Active`
      ];
      
      summaryData.forEach(item => {
        yPosition = addText(item, margin, yPosition, pageWidth - 2 * margin, 10);
        yPosition += 5;
      });
      
      yPosition += 10;
      
      // Analysis Results Section (if available)
      if (analysisResult) {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Analysis Results', margin, yPosition);
        yPosition += 10;
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        
        if (analysisResult.ndvi) {
          yPosition = addText(`NDVI Score: ${Number(analysisResult.ndvi).toFixed(3)}`, margin, yPosition, pageWidth - 2 * margin, 10);
          yPosition += 5;
        }
        
        if (analysisResult.forest_cover) {
          yPosition = addText(`Forest Cover: ${Number(analysisResult.forest_cover).toFixed(1)}%`, margin, yPosition, pageWidth - 2 * margin, 10);
          yPosition += 5;
        }
        
        if (analysisResult.carbon_estimate) {
          yPosition = addText(`Carbon Estimate: ${Number(analysisResult.carbon_estimate).toLocaleString()} tCO₂`, margin, yPosition, pageWidth - 2 * margin, 10);
          yPosition += 5;
        }
        
        if (analysisResult.recommendations) {
          yPosition += 5;
          pdf.setFont('helvetica', 'bold');
          yPosition = addText('Recommendations:', margin, yPosition, pageWidth - 2 * margin, 10);
          yPosition += 3;
          pdf.setFont('helvetica', 'normal');
          yPosition = addText(analysisResult.recommendations, margin, yPosition, pageWidth - 2 * margin, 10);
        }
        
        yPosition += 10;
      }
      
      // Verification Details Section
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Verification & Standards', margin, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      const verificationData = [
        'Verification Standard: VCS v4.0',
        'Methodology: VM0015',
        'Currency: USD'
      ];
      
      verificationData.forEach(item => {
        yPosition = addText(item, margin, yPosition, pageWidth - 2 * margin, 10);
        yPosition += 5;
      });
      
      // Footer
      const footerY = pdf.internal.pageSize.height - 20;
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'italic');
      pdf.text(`Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, margin, footerY);
      pdf.text('CarbonTrack Platform - Satellite-Powered Carbon Monitoring', pageWidth - margin - 80, footerY);
      
      // Generate PDF blob and download
      const pdfBlob = pdf.output('blob');
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.name.replace(/\s+/g, '-').toLowerCase()}-report.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: 'PDF Report Downloaded!',
        description: 'Project report has been downloaded successfully as PDF.',
      });
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Download Failed',
        description: 'Could not generate PDF report. Please try again.',
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
                    <div className="text-2xl font-bold text-foreground">N/A</div>
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
                      Generating PDF...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF Report
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
