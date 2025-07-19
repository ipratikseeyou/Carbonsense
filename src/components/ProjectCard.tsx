
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, 
  DollarSign, 
  Leaf, 
  Calendar,
  Shield,
  Building,
  TreePine,
  ArrowRight,
  FileText,
  Users
} from 'lucide-react';
import { useCurrencyConversion } from '@/hooks/useCurrencyConversion';

interface ProjectCardProps {
  project: any;
  viewMode?: 'grid' | 'list';
}

export default function ProjectCard({ project, viewMode = 'grid' }: ProjectCardProps) {
  const { getSymbol } = useCurrencyConversion();
  const currency = project.currency || 'USD';
  const currencySymbol = getSymbol(currency);

  const totalValue = (project.carbon_tons || 0) * (project.price_per_ton || 25);

  if (viewMode === 'list') {
    return (
      <Card className="bg-card hover:shadow-lg transition-shadow border-border">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-xl mb-2 text-foreground">{project.name}</CardTitle>
              <CardDescription className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {project.coordinates}
              </CardDescription>
            </div>
            {project.satellite_image_url && (
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted ml-4">
                <img 
                  src={project.satellite_image_url} 
                  alt={project.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4">
            {/* Carbon & Financial Info */}
            <div>
              <div className="flex items-center gap-1 text-muted-foreground mb-1">
                <Leaf className="h-3 w-3" />
                <span className="text-xs">Carbon</span>
              </div>
              <div className="font-semibold text-foreground">{Number(project.carbon_tons).toLocaleString()} tCO₂</div>
            </div>

            <div>
              <div className="flex items-center gap-1 text-muted-foreground mb-1">
                <DollarSign className="h-3 w-3" />
                <span className="text-xs">Price/Ton</span>
              </div>
              <div className="font-semibold text-foreground">
                {currencySymbol}{Number(project.price_per_ton || 25).toFixed(2)}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1 text-muted-foreground mb-1">
                <TreePine className="h-3 w-3" />
                <span className="text-xs">Area</span>
              </div>
              <div className="font-semibold text-foreground">{project.project_area || 'N/A'} ha</div>
            </div>

            {/* Verification Info */}
            <div>
              <div className="flex items-center gap-1 text-muted-foreground mb-1">
                <Shield className="h-3 w-3" />
                <span className="text-xs">Standard</span>
              </div>
              <div className="font-semibold text-sm text-foreground">{project.verification_standard || 'VCS v4.0'}</div>
            </div>

            {/* Developer Info */}
            <div>
              <div className="flex items-center gap-1 text-muted-foreground mb-1">
                <Building className="h-3 w-3" />
                <span className="text-xs">Developer</span>
              </div>
              <div className="font-semibold text-sm truncate text-foreground">{project.developer_name || 'N/A'}</div>
            </div>

            {/* Total Value */}
            <div>
              <div className="flex items-center gap-1 text-muted-foreground mb-1">
                <DollarSign className="h-3 w-3" />
                <span className="text-xs">Total Value</span>
              </div>
              <div className="font-semibold text-green-600">
                {currencySymbol}{totalValue.toLocaleString()}
              </div>
            </div>
          </div>

          <Separator className="mb-4" />

          {/* Enhanced Metadata */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 text-sm">
            {project.methodology && (
              <div>
                <span className="text-muted-foreground">Methodology:</span>
                <div className="font-medium text-foreground">{project.methodology}</div>
              </div>
            )}
            {project.baseline_methodology && (
              <div>
                <span className="text-muted-foreground">Baseline:</span>
                <div className="font-medium text-foreground">{project.baseline_methodology}</div>
              </div>
            )}
            {project.forest_type && (
              <div>
                <span className="text-muted-foreground">Forest Type:</span>
                <div className="font-medium text-foreground">{project.forest_type}</div>
              </div>
            )}
            {project.stakeholder && (
              <div>
                <span className="text-muted-foreground">Stakeholder:</span>
                <div className="font-medium text-foreground truncate">{project.stakeholder}</div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-2 flex-wrap">
              <Badge variant="secondary" className="text-xs">
                {project.forest_type || 'Forest'}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {project.baseline_methodology || 'IPCC AR6'}
              </Badge>
              {project.uncertainty_percentage && (
                <Badge variant="outline" className="text-xs">
                  ±{project.uncertainty_percentage}%
                </Badge>
              )}
              {project.buffer_percentage && (
                <Badge variant="outline" className="text-xs">
                  Buffer: {project.buffer_percentage}%
                </Badge>
              )}
            </div>
            
            <Button asChild variant="outline" size="sm">
              <Link to={`/projects/${project.id}`}>
                View Details
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid view (more compact)
  return (
    <Card className="bg-card hover:shadow-lg transition-shadow border-border">
      <CardHeader>
        <div className="flex justify-between items-start mb-2">
          <Badge variant="secondary" className="text-xs">
            {project.verification_standard || 'Verified'}
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
        <CardTitle className="text-lg line-clamp-1 text-foreground">{project.name}</CardTitle>
        <CardDescription className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3 w-3" />
          {project.coordinates}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-sm text-muted-foreground">Carbon</div>
              <div className="font-semibold text-foreground">{Number(project.carbon_tons).toLocaleString()} tCO₂</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Value</div>
              <div className="font-semibold text-green-600">
                {currencySymbol}{totalValue.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="space-y-1 text-sm">
            {project.forest_type && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Forest:</span>
                <span className="font-medium text-foreground">{project.forest_type}</span>
              </div>
            )}
            {project.developer_name && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Developer:</span>
                <span className="font-medium truncate max-w-[150px] text-foreground">{project.developer_name}</span>
              </div>
            )}
            {project.methodology && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Method:</span>
                <span className="font-medium text-foreground">{project.methodology}</span>
              </div>
            )}
          </div>

          <Separator />

          {/* Enhanced Badges */}
          <div className="flex gap-1 flex-wrap mb-3">
            {project.uncertainty_percentage && (
              <Badge variant="outline" className="text-xs">
                ±{project.uncertainty_percentage}%
              </Badge>
            )}
            {project.buffer_percentage && (
              <Badge variant="outline" className="text-xs">
                Buffer: {project.buffer_percentage}%
              </Badge>
            )}
          </div>

          <Button asChild variant="outline" className="w-full" size="sm">
            <Link to={`/projects/${project.id}`}>
              View Full Details
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
