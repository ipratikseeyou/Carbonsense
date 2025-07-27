import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Satellite, TrendingUp, Leaf, BarChart3 } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { NDVIIndicator } from '@/components/NDVIIndicator';
import { fetchSatelliteData, parseCoordinates, SatelliteApiError } from '@/services/satelliteService';
import { toast } from '@/hooks/use-toast';

const SatelliteVisualization = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [satelliteData, setSatelliteData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Fetch project data
  const { data: project, isLoading: projectLoading, error: projectError } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      if (!id) throw new Error('Project ID is required');
      
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

  // Mock historical data for visualization
  const mockHistoricalData = [
    { month: 'Jan', ndvi: 0.65, carbon: 120, forestCover: 78 },
    { month: 'Feb', ndvi: 0.68, carbon: 125, forestCover: 79 },
    { month: 'Mar', ndvi: 0.72, carbon: 132, forestCover: 81 },
    { month: 'Apr', ndvi: 0.69, carbon: 128, forestCover: 80 },
    { month: 'May', ndvi: 0.74, carbon: 135, forestCover: 83 },
    { month: 'Jun', ndvi: 0.71, carbon: 130, forestCover: 82 },
  ];

  const pieData = [
    { name: 'Forest Cover', value: satelliteData?.forest_cover_percentage || 82, fill: 'hsl(var(--primary))' },
    { name: 'Other Land', value: 100 - (satelliteData?.forest_cover_percentage || 82), fill: 'hsl(var(--muted))' },
  ];

  const handleAnalyzeProject = async () => {
    if (!project?.coordinates) {
      toast({
        title: "Error",
        description: "Project coordinates are required for satellite analysis",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const { lat, lon } = parseCoordinates(project.coordinates);
      const data = await fetchSatelliteData(lat, lon);
      setSatelliteData(data);
      toast({
        title: "Analysis Complete",
        description: "Satellite data has been successfully analyzed",
      });
    } catch (error) {
      console.error('Satellite analysis failed:', error);
      if (error instanceof SatelliteApiError) {
        toast({
          title: "Analysis Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Analysis Failed",
          description: "Failed to fetch satellite data. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (projectLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (projectError || !project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load project data. Please try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={() => navigate(`/projects/${id}`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Project
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">{project.name}</h1>
          <p className="text-muted-foreground">Satellite Data Visualization</p>
        </div>
      </div>

      {/* Analysis Controls */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Satellite className="h-5 w-5" />
            Satellite Analysis
          </CardTitle>
          <CardDescription>
            Fetch real-time satellite data for this project location
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button 
              onClick={handleAnalyzeProject} 
              disabled={isAnalyzing}
              className="flex items-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Satellite className="h-4 w-4" />
                  Analyze Current Data
                </>
              )}
            </Button>
            {satelliteData && (
              <Badge variant="outline" className="text-green-600">
                Last analyzed: {new Date(satelliteData.measurement_date).toLocaleDateString()}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Current Data Overview */}
      {satelliteData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">NDVI Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <NDVIIndicator 
                ndvi={satelliteData.ndvi}
                confidence={satelliteData.confidence_score}
                forestCover={satelliteData.forest_cover_percentage}
                carbonEstimate={satelliteData.carbon_stock}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Leaf className="h-4 w-4" />
                Forest Coverage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {satelliteData.forest_cover_percentage.toFixed(1)}%
              </div>
              <p className="text-sm text-muted-foreground">Total forest coverage</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Carbon Stock
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {satelliteData.carbon_stock.toFixed(1)} tCO₂
              </div>
              <p className="text-sm text-muted-foreground">Estimated carbon stock</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Visualization Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* NDVI Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              NDVI Trend Analysis
            </CardTitle>
            <CardDescription>6-month vegetation health trend</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockHistoricalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="ndvi" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Forest Cover Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Forest Cover Distribution</CardTitle>
            <CardDescription>Current land use breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4">
              {pieData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.fill }}
                  />
                  <span className="text-sm text-muted-foreground">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Carbon Stock Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Carbon Stock Evolution</CardTitle>
          <CardDescription>Historical carbon sequestration tracking</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={mockHistoricalData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="carbon" 
                stroke="hsl(var(--primary))" 
                fill="hsl(var(--primary))" 
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default SatelliteVisualization;