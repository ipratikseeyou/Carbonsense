import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { carbonApi, NDVITimeSeriesData } from '@/services/carbonApi';
import { Loader2, AlertCircle, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface NDVIChartProps {
  projectId: string;
  coordinates?: string;
  startDate?: string;
  endDate?: string;
}

export const NDVIChart: React.FC<NDVIChartProps> = ({ 
  projectId,
  coordinates, 
  startDate, 
  endDate 
}) => {
  const [ndviData, setNdviData] = useState<NDVITimeSeriesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadNDVIData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading NDVI data for project:', projectId);
      console.log('Coordinates:', coordinates);
      console.log('Date range:', { startDate, endDate });
      
      let data;
      if (coordinates) {
        // Use coordinates to get NDVI data from AWS backend
        const [lat, lon] = coordinates.split(',').map(Number);
        console.log('Using coordinates for NDVI data:', { lat, lon });
        data = await carbonApi.getNDVIDataByCoordinates(lat, lon, startDate, endDate);
      } else {
        // Fallback to projectId method
        data = await carbonApi.getNDVIData(projectId, startDate, endDate);
      }
      
      console.log('NDVI data loaded:', data);
      
      setNdviData(data);
      if (data && data.time_series.length > 0) {
        toast({
          title: 'NDVI Data Loaded',
          description: `Loaded ${data.time_series.length} data points`,
        });
      } else {
        toast({
          title: 'No NDVI Data',
          description: 'No satellite data available for this location/time period',
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error('Error loading NDVI data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load NDVI data';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNDVIData();
  }, [projectId, coordinates, startDate, endDate]);

  const chartData = {
    labels: ndviData?.time_series.map(point => 
      new Date(point.date).toLocaleDateString()
    ) || [],
    datasets: [
      {
        label: 'NDVI',
        data: ndviData?.time_series.map(point => point.ndvi) || [],
        borderColor: 'hsl(var(--primary))',
        backgroundColor: 'hsl(var(--primary) / 0.1)',
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.1,
      },
      {
        label: 'Carbon Estimate (tons)',
        data: ndviData?.time_series.map(point => point.carbon_estimate) || [],
        borderColor: 'hsl(var(--secondary))',
        backgroundColor: 'hsl(var(--secondary) / 0.1)',
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.1,
        yAxisID: 'y1',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'NDVI Time Series Analysis',
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'NDVI Value',
        },
        min: 0,
        max: 1,
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Carbon (tons)',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>NDVI Time Series</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            NDVI Time Series
            <Button onClick={loadNDVIData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 bg-destructive/10 rounded-lg">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!ndviData) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Mean NDVI</p>
                <p className="text-2xl font-bold">{ndviData.summary.mean_ndvi.toFixed(3)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center">
                {ndviData.summary.trend >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Trend</p>
                <p className={`text-2xl font-bold ${ndviData.summary.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {ndviData.summary.trend >= 0 ? '+' : ''}{(ndviData.summary.trend * 100).toFixed(2)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
                <div className="w-2 h-2 bg-accent rounded-full" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Data Points</p>
                <p className="text-2xl font-bold">{ndviData.summary.total_observations}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>NDVI Time Series Analysis</CardTitle>
            <Button onClick={loadNDVIData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <Line data={chartData} options={chartOptions} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NDVIChart;