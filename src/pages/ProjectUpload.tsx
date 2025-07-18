
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
import { Upload, MapPin } from 'lucide-react';

const projectFormSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100, 'Name too long'),
  coordinates: z.string().regex(
    /^-?\d+\.?\d*,-?\d+\.?\d*$/,
    'Invalid coordinates format. Use: latitude,longitude (e.g., 40.7128,-74.0060)'
  ),
  carbon_tons: z.number().min(0.1, 'Carbon tons must be greater than 0'),
  price_per_ton: z.number().min(0).optional(),
  satellite_image_url: z.string().url().optional().or(z.literal('')),
});

type ProjectFormData = z.infer<typeof projectFormSchema>;

const ProjectUpload = () => {
  const navigate = useNavigate();
  
  // State to hold selected coordinates - using a meaningful default location (New York City)
  const [selectedLocation, setSelectedLocation] = useState({ lat: 40.7128, lng: -74.0060 });
  
  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: '',
      coordinates: '40.7128,-74.0060',
      carbon_tons: 0,
      price_per_ton: 25,
      satellite_image_url: '',
    },
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
          setSelectedLocation({ lat, lng });
        }
      }
    }
  }, [form]);

  const handleLocationSelect = (lat: number, lng: number) => {
    console.log(`Selected location: ${lat}, ${lng}`);
    setSelectedLocation({ lat, lng });
    const coordString = `${lat.toFixed(6)},${lng.toFixed(6)}`;
    form.setValue('coordinates', coordString);
    form.clearErrors('coordinates');
    
    // Show visual feedback
    toast({
      title: 'Location Updated',
      description: `Coordinates set to: ${coordString}`,
    });
  };

  const onSubmit = async (data: ProjectFormData) => {
    try {
      console.log('Submitting project with data:', data);
      
      const { error } = await supabase
        .from('projects')
        .insert([
          {
            name: data.name,
            coordinates: data.coordinates,
            carbon_tons: data.carbon_tons,
            price_per_ton: data.price_per_ton || 25,
            satellite_image_url: data.satellite_image_url || null,
          },
        ]);

      if (error) throw error;

      toast({
        title: 'Success!',
        description: 'Project uploaded successfully.',
      });

      navigate('/projects');
    } catch (error) {
      console.error('Error uploading project:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload project. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-satellite-blue/5">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Upload className="h-12 w-12 text-satellite-blue" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Upload New Project</h1>
            <p className="text-muted-foreground">
              Add a new carbon offset project to our satellite monitoring network
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Project Details
              </CardTitle>
              <CardDescription>
                Enter the details for your carbon offset project
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Amazon Rainforest Restoration" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="coordinates"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Location</FormLabel>
                        <FormControl>
                          <div className="space-y-4">
                            <MapLocationPicker
                              onLocationSelect={handleLocationSelect}
                              initialLocation={selectedLocation}
                            />
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              <span>Current coordinates: {form.watch('coordinates')}</span>
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="carbon_tons"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Carbon Tons</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.1"
                              placeholder="1000"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="price_per_ton"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price per Ton ($)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01"
                              placeholder="25.00"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="satellite_image_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Satellite Image URL (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://example.com/satellite-image.jpg" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/projects')}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      variant="satellite"
                      className="flex-1"
                      disabled={form.formState.isSubmitting}
                    >
                      {form.formState.isSubmitting ? 'Uploading...' : 'Upload Project'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProjectUpload;
