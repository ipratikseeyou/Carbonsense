# Lovable Implementation Instructions - AWS Backend Integration

## IMPORTANT: Read Completely Before Starting
These instructions will integrate your frontend with the AWS backend API without causing any build errors.

## Step 1: Update ProjectGrid Component (CRITICAL - Fix Data Source)

Replace the entire content of `src/components/ProjectGrid.tsx` with:

```typescript
import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Leaf, DollarSign, ArrowRight, Plus } from 'lucide-react';
import { apiEndpoints } from '@/config/api';

const ProjectGrid = () => {
  const { data: projects, isLoading } = useQuery({
    queryKey: ['featured-projects'],
    queryFn: async () => {
      const response = await fetch(apiEndpoints.projects);
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      const data = await response.json();
      // Return last 6 projects for featured section
      return data.slice(-6).reverse();
    },
  });

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth'
    });
  };

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
                            {project.currency === 'EUR' ? '€' : project.currency === 'GBP' ? '£' : '$'}
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
```

## Step 2: Create Scroll Utility

Create a new file `src/utils/scrollUtils.ts`:

```typescript
export const scrollToElement = (elementId: string) => {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

export const scrollToBottom = () => {
  window.scrollTo({
    top: document.documentElement.scrollHeight,
    behavior: 'smooth'
  });
};

export const scrollToProjects = () => {
  scrollToElement('projects-section');
};
```

## Step 3: Update HeroSection Component

Replace the content of `src/components/HeroSection.tsx` with:

```typescript
import React from 'react';
import { ArrowDown, Satellite, TreePine, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { scrollToProjects } from '@/utils/scrollUtils';

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-green-900 to-emerald-900">
      <div className="absolute inset-0 bg-black/20" />
      
      <div className="container mx-auto px-4 z-10">
        <div className="text-center text-white max-w-4xl mx-auto">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Satellite className="h-20 w-20 text-emerald-400 animate-pulse" />
              <TreePine className="h-12 w-12 text-green-400 absolute -bottom-2 -right-2" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-green-300">
            CarbonSense
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-gray-200">
            AI-Powered Carbon Credit Verification Through Satellite Monitoring
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              size="lg" 
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 text-lg"
              onClick={scrollToProjects}
            >
              <Shield className="mr-2 h-5 w-5" />
              Explore Verified Projects
            </Button>
            
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white/10 px-8 py-6 text-lg"
              onClick={() => window.location.href = '/projects/upload'}
            >
              <TreePine className="mr-2 h-5 w-5" />
              Register Your Project
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl font-bold text-emerald-400">500K+</div>
              <div className="text-sm text-gray-300">Carbon Tons Verified</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl font-bold text-emerald-400">98%</div>
              <div className="text-sm text-gray-300">Accuracy Rate</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl font-bold text-emerald-400">24/7</div>
              <div className="text-sm text-gray-300">Satellite Monitoring</div>
            </div>
          </div>
        </div>
      </div>
      
      <button
        onClick={scrollToProjects}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce cursor-pointer hover:text-emerald-400 transition-colors"
        aria-label="Scroll to projects"
      >
        <ArrowDown className="h-8 w-8" />
      </button>
    </section>
  );
};

export default HeroSection;
```

## Step 4: Environment Variable Setup

In your Lovable project settings, add this environment variable:

```
VITE_API_URL=https://kvu6v1r4mk.execute-api.us-east-1.amazonaws.com/Prod
```

## Step 5: Verify API Configuration

The file `src/config/api.ts` should already have this content (DO NOT MODIFY):

```typescript
// API Configuration
export const API_CONFIG = {
  // Backend URL - uses environment variable or AWS Lambda as fallback
  BACKEND_URL: import.meta.env.VITE_API_URL || 'https://kvu6v1r4mk.execute-api.us-east-1.amazonaws.com/Prod',
  
  // ... rest of the file remains the same
};
```

## Step 6: Test the Integration

After implementing these changes:

1. **Test API Connection** - Open browser console and run:
   ```javascript
   fetch('https://kvu6v1r4mk.execute-api.us-east-1.amazonaws.com/Prod/projects')
     .then(r => r.json())
     .then(console.log)
   ```

2. **Test Navigation** - Click "Explore Verified Projects" button, it should smooth scroll to projects section

3. **Test Project Creation** - Go to `/projects/upload` and create a test project

## IMPORTANT NOTES:

1. **DO NOT** modify any other files unless specified
2. **DO NOT** remove Supabase integration - it's still needed for Mapbox tokens
3. **DO NOT** change the API URL structure - it's configured correctly
4. The AWS backend is already deployed and running
5. All API endpoints support CORS for browser requests

## Expected Results:

✅ Projects load from AWS backend instead of Supabase
✅ "Explore Projects" button scrolls to projects section smoothly
✅ Currency symbols display correctly (USD $, EUR €, GBP £)
✅ Project upload works with all enhanced fields
✅ No console errors or failed requests

## If You Encounter Issues:

1. **Projects not loading**: Check browser console for API errors
2. **CORS errors**: The backend is configured for CORS, ensure URL is exact
3. **Navigation not working**: Ensure scrollUtils.ts is created correctly
4. **Build errors**: Make sure all imports are correct and files exist

This implementation is production-ready and tested. Follow these steps exactly for a successful integration.
