
import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowDown, Satellite, Target, TrendingUp, Globe, Zap, Shield } from 'lucide-react';
import heroImage from '@/assets/hero-satellite-earth.jpg';

const HeroSection = () => {
  const parallaxRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (parallaxRef.current) {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        parallaxRef.current.style.transform = `translateY(${rate}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Trigger animations on mount
    if (contentRef.current) {
      const elements = contentRef.current.querySelectorAll('.animate-on-scroll');
      elements.forEach((el, index) => {
        setTimeout(() => {
          el.classList.add('animate-fade-in-up');
        }, index * 150);
      });
    }
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Premium Background with Parallax */}
      <div className="absolute inset-0">
        <div 
          ref={parallaxRef}
          className="absolute inset-0 scale-110 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-hero opacity-75"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-space-navy via-transparent to-transparent opacity-60"></div>
        </div>
      </div>
      
      {/* Floating Elements with Premium Animation */}
      <div className="absolute top-20 right-20 animate-bounce animate-on-scroll">
        <div className="glass-card p-6 hover:scale-110 transition-transform duration-400">
          <Satellite className="h-10 w-10 text-primary-glow" />
        </div>
      </div>
      
      <div className="absolute bottom-32 left-16 animate-pulse animate-on-scroll">
        <div className="glass-card p-4 hover:scale-110 transition-transform duration-400">
          <Target className="h-8 w-8 text-earth-green-light" />
        </div>
      </div>

      <div className="absolute top-1/3 left-20 animate-on-scroll">
        <div className="glass-card p-4 hover:scale-110 transition-transform duration-400">
          <Globe className="h-8 w-8 text-earth-teal-light" />
        </div>
      </div>

      {/* Main Content */}
      <div ref={contentRef} className="relative z-10 text-center max-w-7xl mx-auto px-6">
        {/* Premium Status Badge */}
        <div className="mb-8 animate-on-scroll">
          <div className="inline-flex items-center gap-3 glass-panel backdrop-blur-xl border border-primary/20 rounded-full px-6 py-3 mb-8 hover:border-primary/40 transition-all duration-400">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-carbon-positive rounded-full animate-pulse"></div>
              <Shield className="w-4 h-4 text-primary-glow" />
            </div>
            <span className="text-primary-glow text-sm font-premium-mono font-medium">
              Premium Satellite Monitoring • AI-Powered • Real-time
            </span>
            <Zap className="w-4 h-4 text-gold-warm" />
          </div>
        </div>
        
        {/* Premium Headlines */}
        <div className="mb-12 animate-on-scroll">
          <h1 className="text-6xl md:text-8xl lg:text-display-xl font-premium-serif font-bold text-white mb-6 leading-tight">
            Carbon<span className="bg-gradient-copper bg-clip-text text-transparent">Sense</span>
          </h1>
          
          <p className="text-xl md:text-2xl lg:text-3xl text-white/90 mb-6 max-w-5xl mx-auto leading-relaxed font-premium-sans font-light">
            Premium AI-powered satellite monitoring for transparent, verified carbon offset projects
          </p>
          
          <p className="text-lg md:text-xl text-white/75 max-w-4xl mx-auto font-premium-sans">
            Real-time monitoring • Machine learning estimation • Blockchain verified • 100% transparent
          </p>
        </div>

        {/* Premium CTA Buttons */}
        <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-16 animate-on-scroll">
          <Button variant="premium" size="xxl" className="group shadow-premium-lg hover:shadow-copper">
            Explore Premium Projects
            <ArrowDown className="group-hover:translate-y-1 transition-transform duration-300" />
          </Button>
          
          <Button variant="glass" size="xxl" className="hover:border-primary/50">
            View Live Data
            <TrendingUp className="ml-2" />
          </Button>
        </div>

        {/* Premium Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto animate-on-scroll">
          {[
            { value: "47,382", label: "Tons CO₂ Verified", icon: Target, gradient: "from-earth-green to-earth-teal" },
            { value: "156", label: "Active Projects", icon: Globe, gradient: "from-primary to-primary-glow" },
            { value: "99.7%", label: "Accuracy Rate", icon: Zap, gradient: "from-copper to-gold-warm" }
          ].map((stat, index) => (
            <div 
              key={index} 
              className="glass-card p-8 hover:scale-105 transition-all duration-400 group hover:shadow-premium-lg"
            >
              <div className="flex items-center justify-center mb-4">
                <div className={`p-3 rounded-full bg-gradient-to-r ${stat.gradient} shadow-premium`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className={`text-4xl font-premium-serif font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300`}>
                {stat.value}
              </div>
              <div className="text-white/80 font-premium-sans">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Premium Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce animate-on-scroll">
        <div className="glass-card p-3 hover:scale-110 transition-transform duration-300">
          <ArrowDown className="h-5 w-5 text-white/60" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
