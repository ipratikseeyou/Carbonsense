
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Satellite, Plus, Grid, Home } from 'lucide-react';

const Navigation = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Satellite className="h-8 w-8 text-satellite-blue" />
            <span className="text-xl font-bold text-foreground">CarbonSense</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <Button
              asChild
              variant={isActive('/') ? 'default' : 'ghost'}
              size="sm"
            >
              <Link to="/">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Link>
            </Button>
            
            <Button
              asChild
              variant={isActive('/projects') ? 'default' : 'ghost'}
              size="sm"
            >
              <Link to="/projects">
                <Grid className="h-4 w-4 mr-2" />
                Projects
              </Link>
            </Button>
            
            <Button
              asChild
              variant="satellite"
              size="sm"
            >
              <Link to="/projects/upload">
                <Plus className="h-4 w-4 mr-2" />
                Upload Project
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
