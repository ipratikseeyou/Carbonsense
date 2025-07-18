import React from 'react';
import HeroSection from '@/components/HeroSection';
import ProjectGrid from '@/components/ProjectGrid';
import MonitoringDashboard from '@/components/MonitoringDashboard';

const Index = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <MonitoringDashboard />
      <ProjectGrid />
    </div>
  );
};

export default Index;
