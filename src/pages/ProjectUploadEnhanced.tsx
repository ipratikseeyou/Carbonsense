import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navigation from '@/components/Navigation';
import MapLocationPicker from '@/components/MapLocationPicker';
import ImageCoordinateExtractor from '@/components/ImageCoordinateExtractor';
import CurrencySelector from '@/components/CurrencySelector';
import { Upload, MapPin, Building, FileText, TreePine, Calendar, Shield } from 'lucide-react';
import { createProject } from '@/services/projectService';
import { getForestTypes, calculateCarbonCredits } from '@/utils/forestBiomassData';

const projectFormSchema = z.object({
  // Basic Information
  name: z.string().min(1, 'Project name is required').max(100, 'Name too long'),
  coordinates: z.string().regex(
    /^-?\d+\.?\d*,-?\d+\.?\d*$/,
    'Invalid coordinates format. Use: latitude,longitude (e.g., 40.7128,-74.0060)'
  ),
  satellite_image_url: z.string().url().optional().or(z.literal('')),
  
  // Project Details
  project_area: z.number().min(0.1, 'Project area must be greater than 0'),
  forest_type: z.string().min(1, 'Forest type is required'),
  
  // Carbon & Financial
  carbon_tons: z.number().min(0.1, 'Carbon tons must be greater than 0'),
  price_per_ton: z.number().min(0, 'Price must be positive'),
  currency: z.string().default('USD'),
  
  // Monitoring Period
  monitoring_period_start: z.string().min(1, 'Start date is required'),
  monitoring_period_end: z.string().min(1, 'End date is required'),
  last_verification_date: z.string().optional(),
  
  // Methodology & Verification
  baseline_methodology: z.string().default('IPCC AR6 Tier 1'),
  verification_standard: z.string().default('VCS v4.0'),
  uncertainty_percentage: z.number().min(0).max(100).default(5),
  
  // Stakeholders
  developer_name: z.string().min(1, 'Developer name is required'),
  developer_contact: z.string().email('Invalid email format'),
  land_tenure: z.string().min(1, 'Land tenure information is required'),
  reference_documents: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectFormSchema>;

const methodologies = [
  'IPCC AR6 Tier 1',
  'IPCC AR6 Tier 2',
  'IPCC AR6 Tier 3',
  'CDM AR-ACM0003',
  'VCS VM0007',
  'Custom Methodology',
];

const verificationStandards = [
  'VCS v4.0',
  'Gold Standard v3.0',
  'Climate Action Reserve',
  'Plan Vivo',
  'ISO 14064-2',
];

const ProjectUploadEnhanced = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('basic');
  
  // Get forest types from the biomass data utility
  const forestTypes = getForestTypes();
  
  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: '',
      coordinates: '0,0',
      carbon_tons: 0,
      price_per_ton: 25,
      currency: 'USD',
      satellite_image_url: '',
      project_area: 0,
      forest_type: '',
      monitoring_period_start: new Date().toISOString().split('T')[0],
      monitoring_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      baseline_methodology: 'IPCC AR6 Tier 1',
      verification_standard: 'VCS v4.0',
      uncertainty_percentage: 5,
      developer_name: '',
      developer_contact: '',
      land_tenure: '',
    },
  });

  // Watch for changes to auto-calculate carbon tons
  const watchedArea = form.watch('project_area');
  const watchedForestType = form.watch('forest_type');
  
  React.useEffect(() => {
    if (watchedArea > 0 && watchedForestType) {
      const calculatedCarbonTons = calculateCarbonCredits(watchedArea, watchedForestType);
      form.setValue('carbon_tons', calculatedCarbonTons);
    }
  }, [watchedArea, watchedForestType, form]);

  const handleLocationSelect = (lat: number, lng: number) => {
    const coordString = `${lat.toFixed(6)},${lng.toFixed(6)}`;
    form.setValue('coordinates', coordString);
    form.clearErrors('coordinates');
  };

  const onSubmit = async (data: ProjectFormData) => {
    try {
      console.log('Creating project with enhanced form data...');
      
      const projectData = {
        name: data.name,
        location: data.name, // Using name as location for now
        carbon_credits: data.carbon_tons,
        price_per_ton: data.price_per_ton,
        currency: data.currency,
        coordinates: data.coordinates,
        area: data.project_area,
        forest_type: data.forest_type,
        monitoring_start: data.monitoring_period_start,
        monitoring_end: data.monitoring_period_end,
        developer_name: data.developer_name,
        developer_contact: data.developer_contact,
        lat: parseFloat(data.coordinates.split(',')[0]),
        lng: parseFloat(data.coordinates.split(',')[1])
      };

      const savedProject = await createProject(projectData);

      toast({
        title: 'Success!',
        description: 'Project created successfully!',
      });

      navigate(`/projects/${savedProject.id}`);
    } catch (error) {
      console.error('Error creating project:', error);
      
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create project. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-satellite-blue/5">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Upload className="h-12 w-12 text-satellite-blue" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Create New Project</h1>
            <p className="text-muted-foreground">
              Add a comprehensive carbon offset project with satellite monitoring
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="carbon">Carbon & Finance</TabsTrigger>
                  <TabsTrigger value="verification">Verification</TabsTrigger>
                  <TabsTrigger value="stakeholders">Stakeholders</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Basic Information
                      </CardTitle>
                      <CardDescription>
                        Project name, location, and area details
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Project Name *</FormLabel>
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
                            <FormLabel>Project Location *</FormLabel>
                            <FormControl>
                              <MapLocationPicker
                                onLocationSelect={handleLocationSelect}
                                initialLocation={{ lat: 0, lng: 0 }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="mt-6">
                        <ImageCoordinateExtractor
                          onCoordinatesExtracted={handleLocationSelect}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="project_area"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Project Area (hectares) *</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  step="0.1"
                                  placeholder="150.5"
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
                          name="forest_type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Forest Type *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select forest type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {forestTypes.map((type) => (
                                    <SelectItem key={type} value={type}>
                                      {type}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
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
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="carbon" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TreePine className="h-5 w-5" />
                        Carbon & Financial Details
                      </CardTitle>
                      <CardDescription>
                        Carbon sequestration and pricing information (auto-calculated based on forest type)
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="carbon_tons"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Carbon Sequestration (tCO₂) *</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.1"
                                placeholder="Auto-calculated from forest type and area"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                            {watchedArea > 0 && watchedForestType && (
                              <p className="text-sm text-muted-foreground">
                                Auto-calculated: {calculateCarbonCredits(watchedArea, watchedForestType).toLocaleString()} tCO₂
                              </p>
                            )}
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="currency"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Currency *</FormLabel>
                              <FormControl>
                                <CurrencySelector 
                                  value={field.value} 
                                  onValueChange={field.onChange}
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
                              <FormLabel>Price per Ton *</FormLabel>
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

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="monitoring_period_start"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Monitoring Start *</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="monitoring_period_end"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Monitoring End *</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="last_verification_date"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Verification</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="verification" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Methodology & Verification
                      </CardTitle>
                      <CardDescription>
                        Standards and verification details
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="baseline_methodology"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Baseline Methodology *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select methodology" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {methodologies.map((method) => (
                                  <SelectItem key={method} value={method}>
                                    {method}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="verification_standard"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Verification Standard *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select standard" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {verificationStandards.map((standard) => (
                                  <SelectItem key={standard} value={standard}>
                                    {standard}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="uncertainty_percentage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Uncertainty Percentage (±%) *</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.1"
                                min="0"
                                max="100"
                                placeholder="5"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="stakeholders" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Building className="h-5 w-5" />
                        Stakeholders & References
                      </CardTitle>
                      <CardDescription>
                        Developer information and documentation
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="developer_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Developer Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="GreenGrow Carbon Ltd." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="developer_contact"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Developer Contact Email *</FormLabel>
                            <FormControl>
                              <Input 
                                type="email"
                                placeholder="contact@greengrow.com" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="land_tenure"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Land Tenure *</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Community lease until 2040"
                                className="min-h-[100px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="reference_documents"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Reference Documents (Optional)</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="https://example.com/methodology.pdf" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

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
                  {form.formState.isSubmitting ? 'Creating Project...' : 'Create Project'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default ProjectUploadEnhanced;
