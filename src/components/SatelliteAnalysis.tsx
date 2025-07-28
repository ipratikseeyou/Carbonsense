import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Satellite, TrendingUp, Leaf } from 'lucide-react';
import { analyzeProject } from '@/services/projectService';
import { useToast } from '@/hooks/use-toast';

interface SatelliteAnalysisProps {
  projectId: string;
  coordinates: { lat: number; lng: number };
}

export const SatelliteAnalysis: React.FC<SatelliteAnalysisProps> = ({ 
  projectId, 
  coordinates 
}) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🎯 Starting enhanced satellite analysis...');
      console.log(`📋 Project ID: ${projectId}`);
      console.log(`📍 Coordinates: ${coordinates.lat}, ${coordinates.lng}`);
      
      // Import geolocation service for enhanced analysis
      const { 
        generateAnalysisGrid, 
        calculateBoundingBox, 
        validateForestCoordinates,
        performEnhancedAnalysis 
      } = await import('@/services/geolocationService');
      
      // Step 1: Validate coordinates for forest data
      const validation = await validateForestCoordinates({ lat: coordinates.lat, lon: coordinates.lng });
      console.log('🌲 Coordinate validation:', validation);
      
      if (!validation.valid) {
        toast({
          title: "Coordinate Warning",
          description: validation.reason || "These coordinates may have limited forest data",
          variant: "destructive",
        });
      }
      
      // Step 2: Determine analysis type based on project size (simplified logic)
      const analysisType: 'point' | 'grid' | 'polygon' = 'point'; // For now, default to point analysis
      const bufferRadius = 2; // 2km radius for enhanced coverage
      
      // Step 3: Generate analysis grid if needed
      const centerPoint = { lat: coordinates.lat, lon: coordinates.lng };
      const gridPoints = [centerPoint]; // For point analysis, use single point
      
      const geolocationData = {
        centerPoint,
        boundingBox: calculateBoundingBox(centerPoint, bufferRadius),
        gridPoints,
        bufferRadius,
        analysisType,
        estimatedArea: Math.PI * Math.pow(bufferRadius, 2) * 100 // Convert km² to hectares
      };
      
      console.log('🌍 Enhanced analysis configuration:', geolocationData);
      
      // Step 4: Perform enhanced analysis or fallback to standard
      let result;
      try {
        result = await performEnhancedAnalysis(geolocationData);
        console.log('✅ Enhanced analysis completed:', result);
      } catch (enhancedError) {
        console.warn('⚠️ Enhanced analysis failed, falling back to standard:', enhancedError);
        result = await analyzeProject(projectId, coordinates);
        console.log('✅ Standard analysis completed:', result);
      }
      
      setData(result);
      
      // Show success toast with enhanced info
      if (result.coverage_quality) {
        toast({
          title: "Enhanced Analysis Complete",
          description: `Coverage: ${result.coverage_quality}, NDVI: ${result.ndvi?.mean?.toFixed(3) || result.ndvi_summary?.mean?.toFixed(3) || 'N/A'}, Carbon: ${result.carbon_stock?.total_tons?.toFixed(1) || 'N/A'} tons`,
        });
      } else {
        toast({
          title: "Analysis Complete",
          description: `NDVI: ${result.ndvi_summary?.mean?.toFixed(3) || 'N/A'}, Carbon: ${result.carbon_stock?.total_tons?.toFixed(1) || 'N/A'} tons`,
        });
      }
    } catch (error) {
      console.error('❌ Analysis failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
      setError(errorMessage);
      toast({
        title: "Analysis Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Debug function to test with known forest coordinates
  const handleTestWithForestCoords = async () => {
    const forestCoords = { lat: -3.4653, lng: -62.2159 }; // Amazon rainforest
    console.log('🌳 Testing with known forest coordinates:', forestCoords);
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await analyzeProject(projectId, forestCoords);
      console.log('🌲 Forest test completed:', result);
      setData(result);
      toast({
        title: "Forest Test Complete",
        description: "Analysis with forest coordinates completed!",
      });
    } catch (err) {
      console.error('🌲 Forest test failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Forest test failed';
      setError(errorMessage);
      toast({
        title: "Forest Test Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Satellite className="h-5 w-5" />
          <CardTitle>Satellite Data Analysis</CardTitle>
        </div>
        <CardDescription>
          Analyze current forest conditions and carbon stock using satellite imagery
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!data && (
          <div className="space-y-2">
            <Button 
              onClick={handleAnalyze} 
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Satellite className="mr-2 h-4 w-4" />
                  Analyze Satellite Data
                </>
              )}
            </Button>
            
            <Button 
              onClick={handleTestWithForestCoords} 
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              🌳 Test with Forest Coordinates (Amazon)
            </Button>
            
            <div className="text-xs text-muted-foreground mt-2 p-2 bg-muted rounded">
              <p><strong>Current coordinates:</strong> {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}</p>
              <p><strong>Debug:</strong> Check browser console for detailed logs</p>
              <p><strong>Forest test:</strong> Uses Amazon coordinates (-3.4653, -62.2159)</p>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 border border-destructive/50 rounded-lg bg-destructive/10">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {data && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold">Analysis Results</h4>
              <Badge variant={data.data_source === 'earth_engine' ? 'default' : 'secondary'}>
                {data.data_source === 'earth_engine' ? '🛰️ Live Data' : '📊 Sample Data'}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Leaf className="h-4 w-4 text-green-600" />
                    <p className="text-sm font-medium">NDVI Mean</p>
                  </div>
                  <p className="text-2xl font-bold">
                    {data.ndvi_summary?.mean?.toFixed(4) || 'N/A'}
                  </p>
                  <p className="text-xs text-muted-foreground">Vegetation Index</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    <p className="text-sm font-medium">NDVI Trend</p>
                  </div>
                  <p className="text-2xl font-bold">
                    {data.ndvi_summary?.trend > 0 ? '📈' : '📉'} 
                    {data.ndvi_summary?.trend?.toFixed(6) || 'N/A'}
                  </p>
                  <p className="text-xs text-muted-foreground">Change Rate</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Satellite className="h-4 w-4 text-purple-600" />
                    <p className="text-sm font-medium">Carbon Stock</p>
                  </div>
                  <p className="text-2xl font-bold">
                    {data.carbon_stock?.total_tons?.toLocaleString() || 'N/A'}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Tons</p>
                </CardContent>
              </Card>
            </div>

            <Button 
              onClick={handleAnalyze} 
              variant="outline"
              disabled={loading}
              className="w-full"
            >
              Refresh Analysis
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};