
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Navigation from '@/components/Navigation';
import ProjectCard from '@/components/ProjectCard';
import { Search, Grid, List, Plus, DollarSign, Leaf } from 'lucide-react';
import { apiEndpoints } from '@/config/api';
import { toast } from '@/hooks/use-toast';

interface Project {
  id: string;
  name: string;
  coordinates: string;
  carbon_tons: number;
  price_per_ton?: number;
  area?: number;
  forest_type?: string;
  project_area?: number;
  methodology?: string;
  verification?: string;
  stakeholder?: string;
  developer?: string;
  satellite_image_url?: string;
  total_value?: number;
  created_at?: string;
  updated_at?: string;
  currency?: string;
  verification_standard?: string;
  developer_name?: string;
  baseline_methodology?: string;
  uncertainty_percentage?: number;
}

const ProjectDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  const { data: projects, isLoading, error, refetch } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      console.log('Fetching projects from AWS API');
      const response = await fetch(apiEndpoints.projects);
      if (!response.ok) throw new Error('Failed to fetch projects');
      const data = await response.json();
      console.log('Fetched projects:', data);
      return data;
    },
  });

  const filteredProjects = projects?.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.coordinates.includes(searchTerm)
  ) || [];

  const totalCarbonTons = projects?.reduce((sum, project) => sum + Number(project.carbon_tons), 0) || 0;
  const averagePrice = projects?.length 
    ? projects.reduce((sum, project) => sum + Number(project.price_per_ton || 25), 0) / projects.length
    : 0;

  const handleDelete = async (projectId: string) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;

    try {
      console.log(`Deleting project via AWS API: ${projectId}`);
      const response = await fetch(apiEndpoints.projectById(projectId), {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete project');

      toast({
        title: 'Success!',
        description: 'Project deleted successfully.',
      });

      // Refetch projects list
      refetch();
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
            <h1 className="text-2xl font-bold text-destructive">Error loading projects</h1>
            <p className="text-muted-foreground mt-2">Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-satellite-blue/5">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Project Dashboard</h1>
            <p className="text-muted-foreground">
              Manage and monitor your carbon offset projects
            </p>
          </div>
          
          <Button asChild variant="satellite" size="lg">
            <Link to="/projects/upload">
              <Plus className="h-4 w-4 mr-2" />
              Upload Project
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Total Projects</CardTitle>
              <Grid className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{projects?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Active monitoring</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Total Carbon Tons</CardTitle>
              <Leaf className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{totalCarbonTons.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">CO₂ equivalent</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Average Price</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">${averagePrice.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Per ton CO₂</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and View Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects by name or coordinates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Projects Grid/List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-satellite-blue mx-auto"></div>
            <p className="text-foreground mt-4">Loading projects...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Grid className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No projects found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'Try adjusting your search terms.' : 'Get started by uploading your first project.'}
              </p>
              {!searchTerm && (
                <Button asChild variant="satellite">
                  <Link to="/projects/upload">
                    <Plus className="h-4 w-4 mr-2" />
                    Upload Project
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {filteredProjects.map((project) => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                viewMode={viewMode}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDashboard;
