
import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import { ArrowLeft, MapPin, Calendar, DollarSign, Leaf, Satellite, TrendingUp } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import ProjectAnalyzer from '@/components/ProjectAnalyzer';

const ProjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: project, isLoading, error } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      if (!id) throw new Error('No project ID provided');
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: carbonData } = useQuery({
    queryKey: ['carbon-data', id],
    queryFn: async () => {
      if (!id) return [];
      
      const { data, error } = await supabase
        .from('carbon_data')
        .select('*')
        .eq('project_id', id)
        .order('measurement_date', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const handleDelete = async () => {
    if (!project || !window.confirm('Are you sure you want to delete this project?')) return;

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', project.id);

      if (error) throw error;

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
            <p className="text-muted-foreground mt-4">Loading project details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!project) return null;

  const totalMeasurements = carbonData?.length || 0;
  const averageConfidence = carbonData?.length 
    ? carbonData.reduce((sum, data) => sum + (Number(data.confidence_score) || 0), 0) / carbonData.length
    : 0;

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
                    <CardTitle className="text-2xl mb-2">{project.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 text-base">
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
                    <div className="text-2xl font-bold">{Number(project.carbon_tons).toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Carbon Tons</div>
                  </div>

                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <DollarSign className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold">${Number(project.price_per_ton || 25).toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">Per Ton</div>
                  </div>

                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{totalMeasurements}</div>
                    <div className="text-sm text-muted-foreground">Measurements</div>
                  </div>

                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <Calendar className="h-6 w-6 text-orange-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold">
                      {new Date(project.created_at || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="text-sm text-muted-foreground">Created</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Carbon Measurements */}
            {carbonData && carbonData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Carbon Measurements</CardTitle>
                  <CardDescription>
                    Historical satellite measurements for this project
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {carbonData.slice(0, 5).map((data) => (
                      <div key={data.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <div>
                          <div className="font-medium">{Number(data.carbon_tons).toLocaleString()} tons CO₂</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(data.measurement_date).toLocaleDateString()}
                          </div>
                        </div>
                        {data.confidence_score && (
                          <Badge variant="outline">
                            {Number(data.confidence_score).toFixed(1)}% confidence
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground">Total Value</div>
                  <div className="text-xl font-bold">
                    ${(Number(project.carbon_tons) * Number(project.price_per_ton || 25)).toLocaleString()}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground">Average Confidence</div>
                  <div className="text-xl font-bold">
                    {averageConfidence > 0 ? `${averageConfidence.toFixed(1)}%` : 'N/A'}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground">Last Updated</div>
                  <div className="text-xl font-bold">
                    {new Date(project.created_at || '').toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild variant="outline" className="w-full">
                  <Link to={`/projects/${project.id}/edit`}>
                    Edit Project
                  </Link>
                </Button>
                
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={handleDelete}
                >
                  Delete Project
                </Button>
              </CardContent>
            </Card>

            <ProjectAnalyzer 
              projectId={project.id} 
              projectName={project.name} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
