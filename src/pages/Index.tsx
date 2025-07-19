
import React from 'react';
import Navigation from '@/components/Navigation';
import HeroSection from '@/components/HeroSection';
import ProjectGrid from '@/components/ProjectGrid';
import MonitoringDashboard from '@/components/MonitoringDashboard';
import BackendTest from '@/components/BackendTest';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <HeroSection />
      <BackendTest />
      <MonitoringDashboard />
      <ProjectGrid />
    </div>
  );
};

export default Index;
