
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowDown, Satellite, Target, TrendingUp } from 'lucide-react';
import { scrollToProjects } from '@/utils/scrollUtils';
import heroImage from '@/assets/hero-satellite-earth.jpg';

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-hero opacity-60"></div>
      </div>
      
      {/* Floating Satellite Elements */}
      <div className="absolute top-20 right-20 animate-pulse">
        <div className="bg-satellite-blue/20 rounded-full p-4 backdrop-blur-sm">
          <Satellite className="h-8 w-8 text-satellite-glow" />
        </div>
      </div>
      
      <div className="absolute bottom-32 left-16 animate-bounce">
        <div className="bg-earth-green/20 rounded-full p-3 backdrop-blur-sm">
          <Target className="h-6 w-6 text-earth-green-light" />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center max-w-6xl mx-auto px-6">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-satellite-blue/10 backdrop-blur-sm border border-satellite-blue/20 rounded-full px-4 py-2 mb-6">
            <div className="w-2 h-2 bg-carbon-positive rounded-full animate-pulse"></div>
            <span className="text-satellite-glow text-sm font-medium">Real-time Satellite Monitoring Active</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
            Carbon<span className="text-primary-glow">Sense</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 mb-4 max-w-4xl mx-auto leading-relaxed drop-shadow">
            Your AI-powered eye in the sky for transparent, satellite-verified carbon offset projects
          </p>
          
          <p className="text-lg text-white/80 max-w-3xl mx-auto drop-shadow">
            Real-time monitoring • ML-powered estimation • Blockchain verified • 100% transparent
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-12">
          <Button 
            variant="satellite" 
            size="xl" 
            className="group"
            onClick={scrollToProjects}
          >
            Explore Projects
            <ArrowDown className="group-hover:translate-y-1 transition-transform duration-300" />
          </Button>
          
          <Button variant="earth" size="xl">
            View Live Data
            <TrendingUp />
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
            <div className="text-3xl font-bold text-primary-glow mb-2 drop-shadow">47,382</div>
            <div className="text-white/90 drop-shadow">Tons CO₂ Verified</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
            <div className="text-3xl font-bold text-earth-green-light mb-2 drop-shadow">156</div>
            <div className="text-white/90 drop-shadow">Active Projects</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
            <div className="text-3xl font-bold text-satellite-glow mb-2 drop-shadow">99.7%</div>
            <div className="text-white/90 drop-shadow">Accuracy Rate</div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <button
        onClick={scrollToProjects}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce cursor-pointer hover:text-primary-glow transition-colors"
        aria-label="Scroll to projects"
      >
        <ArrowDown className="h-6 w-6 text-white/60" />
      </button>
    </section>
  );
};

export default HeroSection;
