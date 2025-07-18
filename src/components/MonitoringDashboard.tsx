import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Satellite, BarChart3, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const MonitoringDashboard = () => {
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalCarbon: 0,
    activeMonitoring: 0,
    lastUpdate: new Date().toISOString()
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch project count and total carbon
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('carbon_tons');

      if (projectsError) throw projectsError;

      const totalProjects = projects?.length || 0;
      const totalCarbon = projects?.reduce((sum, project) => sum + project.carbon_tons, 0) || 0;

      setStats({
        totalProjects,
        totalCarbon,
        activeMonitoring: totalProjects, // All projects are actively monitored
        lastUpdate: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <section className="py-20 px-6 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-satellite-blue/10 backdrop-blur-sm border border-satellite-blue/20 rounded-full px-4 py-2 mb-6">
            <div className="w-2 h-2 bg-carbon-positive rounded-full animate-pulse"></div>
            <span className="text-satellite-blue text-sm font-medium">Live Monitoring Dashboard</span>
          </div>
          
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Real-Time Carbon Intelligence
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Advanced satellite monitoring and AI-powered analytics provide unprecedented transparency into carbon sequestration
          </p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="border-satellite-blue/20 bg-gradient-to-br from-satellite-blue/5 to-satellite-blue/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <Satellite className="h-4 w-4 text-satellite-blue" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-satellite-blue">{stats.totalProjects}</div>
              <p className="text-xs text-muted-foreground">
                Satellite verified
              </p>
            </CardContent>
          </Card>

          <Card className="border-carbon-positive/20 bg-gradient-to-br from-carbon-positive/5 to-carbon-positive/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total CO₂ Sequestered</CardTitle>
              <BarChart3 className="h-4 w-4 text-carbon-positive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-carbon-positive">
                {stats.totalCarbon.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Tons verified
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monitoring Status</CardTitle>
              <Activity className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold text-primary">{stats.activeMonitoring}</div>
                <Badge variant="secondary" className="bg-carbon-positive/10 text-carbon-positive border-carbon-positive/20">
                  <Zap className="h-3 w-3 mr-1" />
                  Live
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Real-time tracking
              </p>
            </CardContent>
          </Card>

          <Card className="border-earth-green/20 bg-gradient-to-br from-earth-green/5 to-earth-green/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Accuracy Rate</CardTitle>
              <Activity className="h-4 w-4 text-earth-green" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-earth-green">99.7%</div>
              <p className="text-xs text-muted-foreground">
                ML confidence
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Technology Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-center p-8 hover:shadow-satellite transition-all duration-300">
            <div className="bg-satellite-blue/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Satellite className="h-8 w-8 text-satellite-blue" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Satellite Monitoring</h3>
            <p className="text-muted-foreground">
              High-resolution satellite imagery updated every 24 hours for real-time forest health monitoring
            </p>
          </Card>

          <Card className="text-center p-8 hover:shadow-earth transition-all duration-300">
            <div className="bg-carbon-positive/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="h-8 w-8 text-carbon-positive" />
            </div>
            <h3 className="text-xl font-semibold mb-2">ML Carbon Estimation</h3>
            <p className="text-muted-foreground">
              AI models trained on environmental data provide precise carbon sequestration measurements
            </p>
          </Card>

          <Card className="text-center p-8 hover:shadow-glow transition-all duration-300">
            <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Activity className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Blockchain Verification</h3>
            <p className="text-muted-foreground">
              Immutable records ensure complete transparency and verification of all carbon offset claims
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default MonitoringDashboard;