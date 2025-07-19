
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Navigation from '@/components/Navigation';
import { Search, Grid, List, Plus, MapPin, DollarSign, Leaf, Satellite, Shield, Zap } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type Project = Tables<'projects'>;

const ProjectDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { data: projects, isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Real-time subscription for projects
  useEffect(() => {
    const channel = supabase
      .channel('projects-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects'
        },
        () => {
          // Refetch projects when changes occur
          window.location.reload();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredProjects = projects?.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.coordinates.includes(searchTerm)
  ) || [];

  const totalCarbonTons = projects?.reduce((sum, project) => sum + Number(project.carbon_tons), 0) || 0;
  const averagePrice = projects?.length 
    ? projects.reduce((sum, project) => sum + Number(project.price_per_ton || 25), 0) / projects.length
    : 0;

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-space-navy via-space-navy-light to-primary/10"></div>
        <Navigation />
        <div className="relative z-10 container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">Error loading projects</h1>
            <p className="text-white/70 mt-2">Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
      {/* Premium Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-space-navy via-space-navy-light to-primary/10"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-primary/5"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 right-20 animate-float">
        <div className="glass-card p-4 animate-gentle-bounce">
          <Grid className="h-8 w-8 text-primary-glow animate-color-shift" />
        </div>
      </div>
      
      <div className="absolute bottom-32 left-16 animate-float" style={{ animationDelay: '1.5s' }}>
        <div className="glass-card p-3 animate-gentle-bounce">
          <Satellite className="h-6 w-6 text-earth-green-light animate-color-shift" />
        </div>
      </div>

      <Navigation />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Premium Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 animate-soft-scale">
          <div>
            <div className="inline-flex items-center gap-3 glass-panel backdrop-blur-xl border border-primary/20 rounded-full px-6 py-3 mb-4 animate-gentle-bounce">
              <Shield className="w-4 h-4 text-primary-glow" />
              <span className="text-white text-sm font-premium-mono font-medium">
                Premium Dashboard • Real-time Monitoring • AI-Powered
              </span>
              <Zap className="w-4 h-4 text-gold-warm animate-color-shift" />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-premium-serif font-bold text-white mb-2 animate-gentle-bounce">
              Project <span className="bg-gradient-copper bg-clip-text text-transparent">Dashboard</span>
            </h1>
            <p className="text-lg text-white/80 font-premium-sans">
              Manage and monitor your premium carbon offset projects
            </p>
          </div>
          
          <Button asChild variant="premium" size="xl" className="shadow-copper animate-gentle-bounce mt-6 md:mt-0">
            <Link to="/projects/upload">
              <Plus className="h-5 w-5 mr-2" />
              Upload Project
            </Link>
          </Button>
        </div>

        {/* Premium Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { title: "Total Projects", value: projects?.length || 0, icon: Grid, gradient: "from-primary to-primary-glow", desc: "Active monitoring" },
            { title: "Total Carbon Tons", value: totalCarbonTons.toLocaleString(), icon: Leaf, gradient: "from-earth-green to-earth-teal", desc: "CO₂ equivalent" },
            { title: "Average Price", value: `$${averagePrice.toFixed(2)}`, icon: DollarSign, gradient: "from-copper to-gold-warm", desc: "Per ton CO₂" }
          ].map((stat, index) => (
            <Card key={stat.title} className="glass-card backdrop-blur-xl border-primary/20 hover:border-primary/30 transition-all duration-400 animate-soft-scale hover:scale-105" style={{ animationDelay: `${index * 0.1}s` }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-premium-sans font-medium text-white/90">{stat.title}</CardTitle>
                <div className={`p-2 rounded-full bg-gradient-to-r ${stat.gradient} animate-gentle-bounce`}>
                  <stat.icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-premium-serif font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-1`}>
                  {stat.value}
                </div>
                <p className="text-xs text-white/70 font-premium-sans">{stat.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Premium Search and Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 animate-soft-scale">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
            <Input
              placeholder="Search projects by name or coordinates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 glass-panel border-primary/20 text-white placeholder:text-white/50 focus:border-primary/50 transition-all duration-300 hover:scale-[1.01] bg-white/5"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'premium' : 'glass'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="animate-gentle-bounce text-white"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'premium' : 'glass'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="animate-gentle-bounce text-white"
              style={{ animationDelay: '0.1s' }}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Projects Grid/List */}
        {isLoading ? (
          <div className="text-center py-12 animate-soft-scale">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-glow mx-auto mb-4"></div>
            <p className="text-white/70 font-premium-sans">Loading premium projects...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <Card className="glass-card backdrop-blur-xl border-primary/20 text-center py-12 animate-soft-scale">
            <CardContent>
              <div className="p-4 rounded-full bg-gradient-copper mx-auto mb-4 w-fit animate-gentle-bounce">
                <Grid className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-xl font-premium-serif font-semibold text-white mb-2">No projects found</h3>
              <p className="text-white/70 font-premium-sans mb-4">
                {searchTerm ? 'Try adjusting your search terms.' : 'Get started by uploading your first premium project.'}
              </p>
              {!searchTerm && (
                <Button asChild variant="premium" className="shadow-copper animate-gentle-bounce">
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
            {filteredProjects.map((project, index) => (
              <Card key={project.id} className="glass-card backdrop-blur-xl border-primary/20 hover:border-primary/30 hover:shadow-premium-lg transition-all duration-400 animate-soft-scale hover:scale-105" style={{ animationDelay: `${index * 0.05}s` }}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg font-premium-serif text-white">{project.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1 text-white/70">
                        <MapPin className="h-3 w-3 animate-gentle-bounce" />
                        <span className="font-premium-mono text-sm">{project.coordinates}</span>
                      </CardDescription>
                    </div>
                    {project.satellite_image_url && (
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted glass-panel animate-gentle-bounce">
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
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70 font-premium-sans">Carbon Tons:</span>
                      <span className="font-premium-mono font-medium text-earth-green-light">{Number(project.carbon_tons).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70 font-premium-sans">Price per Ton:</span>
                      <span className="font-premium-mono font-medium text-gold-warm">${Number(project.price_per_ton || 25).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70 font-premium-sans">Created:</span>
                      <span className="font-premium-mono font-medium text-white/80">
                        {new Date(project.created_at || '').toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <Button asChild variant="glass" className="w-full hover:border-primary/50 animate-gentle-bounce text-white">
                    <Link to={`/projects/${project.id}`}>
                      View Details
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDashboard;
