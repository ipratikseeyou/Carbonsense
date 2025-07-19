
import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Leaf, DollarSign, ArrowRight, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const ProjectGrid = () => {
  const { data: projects, isLoading, error } = useQuery({
    queryKey: ['featured-projects'],
    queryFn: async () => {
      console.log('Fetching projects from Supabase');
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6);
      
      if (error) {
        console.error('Supabase error:', error);
        throw new Error(`Failed to fetch projects: ${error.message}`);
      }
      
      console.log('Fetched projects from Supabase:', data);
      return data || [];
    },
  });

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth'
    });
  };

  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'JPY': return '¥';
      case 'INR': return '₹';
      default: return '$';
    }
  };

  if (error) {
    console.error('Error fetching projects:', error);
    return (
      <section id="projects-section" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Featured Carbon Projects
            </h2>
            <p className="text-muted-foreground">
              Unable to load projects. Please check your connection and try again.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="projects-section" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Featured Carbon Projects
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Verified through satellite monitoring and AI-powered analysis
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {projects?.map((project) => (
                <Card key={project.id} className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-satellite-blue/20">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="secondary" className="bg-satellite-blue/10 text-satellite-blue">
                        Verified
                      </Badge>
                      {project.satellite_image_url && (
                        <div className="w-12 h-12 rounded-lg overflow-hidden">
                          <img 
                            src={project.satellite_image_url} 
                            alt={project.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                    <CardTitle className="text-xl group-hover:text-satellite-blue transition-colors">
                      {project.name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {project.coordinates}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Leaf className="h-4 w-4 text-green-500" />
                        <div>
                          <div className="text-sm text-muted-foreground">Carbon Tons</div>
                          <div className="font-semibold">{Number(project.carbon_tons).toLocaleString()}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-blue-500" />
                        <div>
                          <div className="text-sm text-muted-foreground">Price/Ton</div>
                          <div className="font-semibold">
                            {getCurrencySymbol('USD')}
                            {Number(project.price_per_ton || 25).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button asChild variant="outline" className="w-full group-hover:border-satellite-blue group-hover:text-satellite-blue">
                      <Link to={`/projects/${project.id}`}>
                        View Details
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <Button 
                onClick={scrollToBottom}
                variant="satellite" 
                size="lg"
              >
                Explore All Projects
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </>
        )}

        {/* Call to Action */}
        <div className="mt-16 text-center bg-gradient-to-r from-satellite-blue/10 to-transparent rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-foreground mb-4">
            Have a Carbon Project to Monitor?
          </h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Join our network of verified carbon offset projects. Get satellite monitoring, 
            AI-powered verification, and access to global carbon markets.
          </p>
          <Button asChild variant="satellite" size="lg">
            <Link to="/projects/upload">
              <Plus className="mr-2 h-4 w-4" />
              Upload Your Project
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ProjectGrid;
