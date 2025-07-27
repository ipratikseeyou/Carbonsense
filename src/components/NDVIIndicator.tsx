import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Leaf, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { getNDVIColor, getNDVIStatus, formatConfidence } from '@/services/satelliteService';

interface NDVIIndicatorProps {
  ndvi: number;
  confidence?: number;
  forestCover?: number;
  carbonEstimate?: number;
  isLoading?: boolean;
}

export const NDVIIndicator: React.FC<NDVIIndicatorProps> = ({
  ndvi,
  confidence,
  forestCover,
  carbonEstimate,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <Card className="bg-muted/20">
        <CardContent className="p-4">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-8 bg-muted rounded w-3/4"></div>
            <div className="h-3 bg-muted rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getNDVIIcon = (value: number) => {
    if (value < 0.3) return <TrendingDown className="h-5 w-5" />;
    if (value < 0.6) return <Minus className="h-5 w-5" />;
    return <TrendingUp className="h-5 w-5" />;
  };

  const getProgressBarColor = (value: number) => {
    if (value < 0.3) return 'bg-red-500';
    if (value < 0.6) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* NDVI Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Leaf className={`h-5 w-5 ${getNDVIColor(ndvi)}`} />
              <h3 className="font-semibold text-foreground">NDVI Analysis</h3>
            </div>
            {confidence && (
              <Badge variant="secondary" className="text-xs">
                {formatConfidence(confidence)} confidence
              </Badge>
            )}
          </div>

          {/* NDVI Value Display */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              {getNDVIIcon(ndvi)}
              <span className={`text-3xl font-bold ${getNDVIColor(ndvi)}`}>
                {ndvi.toFixed(3)}
              </span>
            </div>
            <p className={`text-sm font-medium ${getNDVIColor(ndvi)}`}>
              {getNDVIStatus(ndvi)}
            </p>
          </div>

          {/* NDVI Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Poor (0.0)</span>
              <span>Moderate (0.5)</span>
              <span>Excellent (1.0)</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${getProgressBarColor(ndvi)}`}
                style={{ width: `${Math.min(ndvi * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Additional Metrics */}
          {(forestCover || carbonEstimate) && (
            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-green-200">
              {forestCover && (
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Forest Cover</div>
                  <div className="text-lg font-semibold text-green-600">
                    {forestCover.toFixed(1)}%
                  </div>
                </div>
              )}
              {carbonEstimate && (
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Carbon Stock</div>
                  <div className="text-lg font-semibold text-blue-600">
                    {carbonEstimate.toFixed(1)} t/ha
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};