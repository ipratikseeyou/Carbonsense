import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, TrendingUp, Zap, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type Project = Tables<'projects'>;

const ProjectGrid = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-muted rounded-t-lg"></div>
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded mb-4"></div>
                  <div className="h-3 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Verified Carbon Projects
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Satellite-monitored projects with real-time carbon sequestration data and ML-powered verification
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="group hover:shadow-satellite transition-all duration-300 overflow-hidden">
              <div className="relative">
                {project.satellite_image_url ? (
                  <img 
                    src={project.satellite_image_url} 
                    alt={project.name}
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-earth-sky flex items-center justify-center">
                    <div className="text-white text-center">
                      <Eye className="h-8 w-8 mx-auto mb-2 opacity-60" />
                      <p className="text-sm opacity-80">Satellite View</p>
                    </div>
                  </div>
                )}
                
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  <Badge variant="secondary" className="bg-carbon-positive/90 text-white border-0">
                    <Zap className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
              </div>

              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-lg font-semibold">{project.name}</span>
                  <TrendingUp className="h-5 w-5 text-carbon-positive" />
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{project.coordinates}</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-2xl font-bold text-carbon-positive">
                      {project.carbon_tons.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">Tons CO₂</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary">
                      ${project.price_per_ton || 25}
                    </p>
                    <p className="text-sm text-muted-foreground">Per Ton</p>
                  </div>
                </div>

                <div className="pt-4 space-y-2">
                  <Button variant="satellite" className="w-full">
                    View Details
                  </Button>
                  <Button variant="outline" className="w-full">
                    Purchase Offsets
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {projects.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-muted/50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <MapPin className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Projects Available</h3>
            <p className="text-muted-foreground">
              Projects will appear here once they're added to the database.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProjectGrid;