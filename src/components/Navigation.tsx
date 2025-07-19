import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Satellite, Plus, Grid, Home, Menu, X } from 'lucide-react';

const Navigation = () => {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const isActive = (path: string) => location.pathname === path;
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-400 ${
      isScrolled 
        ? 'glass-panel shadow-premium backdrop-blur-xl' 
        : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Premium Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-copper rounded-full blur-sm opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
              <div className="relative bg-gradient-copper p-2 rounded-full">
                <Satellite className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-premium-serif font-bold text-white group-hover:text-copper transition-colors duration-300">
                CarbonSense
              </span>
              <span className="text-xs font-premium-mono text-white/70 -mt-1">
                Premium Monitoring
              </span>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            <Button
              asChild
              variant={isActive('/') ? 'glass' : 'ghost'}
              size="default"
              className="font-premium-sans text-white hover:text-white"
            >
              <Link to="/">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Link>
            </Button>
            
            <Button
              asChild
              variant={isActive('/projects') ? 'glass' : 'ghost'}
              size="default"
              className="font-premium-sans text-white hover:text-white"
            >
              <Link to="/projects">
                <Grid className="h-4 w-4 mr-2" />
                Projects
              </Link>
            </Button>
            
            <Button
              asChild
              variant="premium"
              size="default"
              className="ml-4 text-white hover:text-white"
            >
              <Link to="/projects/upload">
                <Plus className="h-4 w-4 mr-2" />
                Upload Project
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-white hover:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 glass-panel rounded-2xl p-4 space-y-2">
            <Button
              asChild
              variant={isActive('/') ? 'glass' : 'ghost'}
              size="default"
              className="w-full justify-start font-premium-sans text-white hover:text-white"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Link to="/">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Link>
            </Button>
            
            <Button
              asChild
              variant={isActive('/projects') ? 'glass' : 'ghost'}
              size="default"
              className="w-full justify-start font-premium-sans text-white hover:text-white"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Link to="/projects">
                <Grid className="h-4 w-4 mr-2" />
                Projects
              </Link>
            </Button>
            
            <Button
              asChild
              variant="premium"
              size="default"
              className="w-full justify-start text-white hover:text-white"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Link to="/projects/upload">
                <Plus className="h-4 w-4 mr-2" />
                Upload Project
              </Link>
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
