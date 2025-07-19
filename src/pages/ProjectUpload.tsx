import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from '@/components/ui/use-toast';
import Navigation from '@/components/Navigation';
import MapLocationPicker from '@/components/MapLocationPicker';
import { Upload, MapPin, Satellite, Shield, Zap } from 'lucide-react';
const projectFormSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100, 'Name too long'),
  coordinates: z.string().regex(/^-?\d+\.?\d*,-?\d+\.?\d*$/, 'Invalid coordinates format. Use: latitude,longitude (e.g., 40.7128,-74.0060)'),
  carbon_tons: z.number().min(0.1, 'Carbon tons must be greater than 0'),
  price_per_ton: z.number().min(0).optional(),
  satellite_image_url: z.string().url().optional().or(z.literal(''))
});
type ProjectFormData = z.infer<typeof projectFormSchema>;
const ProjectUpload = () => {
  const navigate = useNavigate();

  // State to hold selected coordinates - using a meaningful default location (New York City)
  const [selectedLocation, setSelectedLocation] = useState({
    lat: 40.7128,
    lng: -74.0060
  });
  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: '',
      coordinates: '40.7128,-74.0060',
      carbon_tons: 0,
      price_per_ton: 25,
      satellite_image_url: ''
    }
  });

  // Parse initial location from form if available
  useEffect(() => {
    const coords = form.getValues('coordinates');
    if (coords && coords !== '0,0') {
      const coordsParts = coords.split(',');
      if (coordsParts.length === 2) {
        const lat = parseFloat(coordsParts[0].trim());
        const lng = parseFloat(coordsParts[1].trim());
        if (!isNaN(lat) && !isNaN(lng)) {
          setSelectedLocation({
            lat,
            lng
          });
        }
      }
    }
  }, [form]);
  const handleLocationSelect = (lat: number, lng: number) => {
    console.log(`Selected location: ${lat}, ${lng}`);
    setSelectedLocation({
      lat,
      lng
    });
    const coordString = `${lat.toFixed(6)},${lng.toFixed(6)}`;
    form.setValue('coordinates', coordString);
    form.clearErrors('coordinates');

    // Show visual feedback
    toast({
      title: 'Location Updated',
      description: `Coordinates set to: ${coordString}`
    });
  };
  const onSubmit = async (data: ProjectFormData) => {
    try {
      console.log('Submitting project with data:', data);
      const {
        error
      } = await supabase.from('projects').insert([{
        name: data.name,
        coordinates: data.coordinates,
        carbon_tons: data.carbon_tons,
        price_per_ton: data.price_per_ton || 25,
        satellite_image_url: data.satellite_image_url || null
      }]);
      if (error) throw error;
      toast({
        title: 'Success!',
        description: 'Project uploaded successfully.'
      });
      navigate('/projects');
    } catch (error) {
      console.error('Error uploading project:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload project. Please try again.',
        variant: 'destructive'
      });
    }
  };
  return <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
      {/* Premium Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-space-navy via-space-navy-light to-primary/10"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-primary/5"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 right-20 animate-float">
        <div className="glass-card p-4 animate-gentle-bounce">
          <Upload className="h-8 w-8 text-primary-glow animate-color-shift" />
        </div>
      </div>
      
      <div className="absolute bottom-32 left-16 animate-float" style={{
      animationDelay: '1.5s'
    }}>
        <div className="glass-card p-3 animate-gentle-bounce">
          <Satellite className="h-6 w-6 text-copper animate-color-shift" />
        </div>
      </div>

      <Navigation />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Premium Header */}
          <div className="text-center mb-8 animate-soft-scale">
            <div className="inline-flex items-center gap-3 glass-panel backdrop-blur-xl border border-primary/20 rounded-full px-6 py-3 mb-6 animate-gentle-bounce">
              <Shield className="w-4 h-4 text-primary-glow" />
              <span className="text-white text-sm font-premium-mono font-medium">
                Premium Project Upload • Satellite Verified • AI-Powered
              </span>
              <Zap className="w-4 h-4 text-gold-warm animate-color-shift" />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-premium-serif font-bold text-white mb-4 animate-gentle-bounce">
              Upload New <span className="bg-gradient-copper bg-clip-text text-transparent">Project</span>
            </h1>
            <p className="text-lg text-white/80 font-premium-sans max-w-lg mx-auto">
              Add a new carbon offset project to our premium satellite monitoring network
            </p>
          </div>

          {/* Premium Form Card */}
          <Card className="glass-card backdrop-blur-xl border-primary/20 hover:border-primary/30 transition-all duration-400 animate-soft-scale">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-3 font-premium-serif text-2xl text-slate-800">
                <div className="p-2 rounded-full bg-gradient-copper animate-gentle-bounce">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                Project Details
              </CardTitle>
              <CardDescription className="font-premium-sans text-slate-800">
                Enter the details for your premium carbon offset project
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField control={form.control} name="name" render={({
                  field
                }) => <FormItem>
                        <FormLabel className="text-white font-premium-sans font-medium">Project Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Amazon Rainforest Restoration" {...field} className="glass-panel border-primary/20 text-white placeholder:text-white/50 focus:border-primary/50 transition-all duration-300 hover:scale-[1.01] bg-white/5" />
                        </FormControl>
                        <FormMessage className="text-red-300" />
                      </FormItem>} />

                  <FormField control={form.control} name="coordinates" render={({
                  field
                }) => <FormItem>
                        <FormLabel className="text-white font-premium-sans font-medium">Project Location</FormLabel>
                        <FormControl>
                          <div className="space-y-4">
                            <div className="glass-panel rounded-xl p-4 border-primary/20 hover:border-primary/30 transition-all duration-300 bg-white/10">
                              <MapLocationPicker onLocationSelect={handleLocationSelect} initialLocation={selectedLocation} />
                            </div>
                            <div className="flex items-center gap-2 text-sm glass-panel rounded-lg px-3 py-2 border-primary/10 bg-white/95">
                              <MapPin className="h-4 w-4 text-primary animate-gentle-bounce" />
                              <span className="font-premium-mono text-space-navy font-medium">Current coordinates: {form.watch('coordinates')}</span>
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-300" />
                      </FormItem>} />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="carbon_tons" render={({
                    field
                  }) => <FormItem>
                          <FormLabel className="text-white font-premium-sans font-medium">Carbon Tons</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.1" placeholder="1000" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} className="glass-panel border-primary/20 text-white placeholder:text-white/50 focus:border-earth-green-light/50 transition-all duration-300 hover:scale-[1.01] bg-white/5" />
                          </FormControl>
                          <FormMessage className="text-red-300" />
                        </FormItem>} />

                    <FormField control={form.control} name="price_per_ton" render={({
                    field
                  }) => <FormItem>
                          <FormLabel className="text-white font-premium-sans font-medium">Price per Ton ($)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder="25.00" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} className="glass-panel border-primary/20 text-white placeholder:text-white/50 focus:border-gold-warm/50 transition-all duration-300 hover:scale-[1.01] bg-white/5" />
                          </FormControl>
                          <FormMessage className="text-red-300" />
                        </FormItem>} />
                  </div>

                  <FormField control={form.control} name="satellite_image_url" render={({
                  field
                }) => <FormItem>
                        <FormLabel className="text-white font-premium-sans font-medium">Satellite Image URL (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/satellite-image.jpg" {...field} className="glass-panel border-primary/20 text-white placeholder:text-white/50 focus:border-primary/50 transition-all duration-300 hover:scale-[1.01] bg-white/5" />
                        </FormControl>
                        <FormMessage className="text-red-300" />
                      </FormItem>} />

                  <div className="flex gap-4 pt-4">
                    <Button type="button" variant="glass" onClick={() => navigate('/projects')} className="flex-1 hover:border-white/30 animate-gentle-bounce text-white">
                      Cancel
                    </Button>
                    <Button type="submit" variant="premium" className="flex-1 shadow-copper animate-gentle-bounce" style={{
                    animationDelay: '0.2s'
                  }} disabled={form.formState.isSubmitting}>
                      {form.formState.isSubmitting ? 'Uploading...' : 'Upload Project'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>;
};
export default ProjectUpload;