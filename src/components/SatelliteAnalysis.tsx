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
    
    console.log('🎯 SatelliteAnalysis component starting analysis...');
    console.log(`📋 Project ID: ${projectId}`);
    console.log(`📍 Coordinates: lat=${coordinates.lat}, lng=${coordinates.lng}`);
    
    try {
      console.log('🚀 Starting satellite analysis...');
      console.log('📞 Calling analyzeProject service...');
      
      const result = await analyzeProject(projectId, coordinates);
      
      console.log('✅ Analysis completed successfully:', result);
      console.log('📊 Setting analysis data in component state...');
      
      setData(result);
      toast({
        title: "Analysis Complete",
        description: "Satellite data analysis completed successfully",
      });
      
      console.log('🎉 Analysis process complete!');
    } catch (err) {
      console.error('❌ Satellite analysis failed:', err);
      console.error('🔍 Error details:', {
        name: err instanceof Error ? err.name : 'Unknown',
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : 'No stack trace'
      });
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze satellite data';
      setError(errorMessage);
      toast({
        title: "Analysis Failed",
        description: `Analysis failed: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      console.log('🏁 Analysis attempt finished (loading set to false)');
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