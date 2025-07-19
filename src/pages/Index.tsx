
import React from 'react';
import Navigation from '@/components/Navigation';
import HeroSection from '@/components/HeroSection';
import ProjectGrid from '@/components/ProjectGrid';
import MonitoringDashboard from '@/components/MonitoringDashboard';
import PremiumFeatures from '@/components/PremiumFeatures';
import PremiumFooter from '@/components/PremiumFooter';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <HeroSection />
      <MonitoringDashboard />
      <ProjectGrid />
      <PremiumFeatures />
      <PremiumFooter />
    </div>
  );
};

export default Index;
