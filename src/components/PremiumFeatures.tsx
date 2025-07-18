
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Satellite, Brain, Shield, Zap, Globe, TrendingUp, Target, Eye } from 'lucide-react';

const PremiumFeatures = () => {
  const features = [
    {
      icon: Satellite,
      title: "Advanced Satellite Monitoring",
      description: "State-of-the-art satellite technology providing real-time monitoring of carbon offset projects with unprecedented accuracy.",
      gradient: "from-primary to-primary-glow",
      delay: "delay-100"
    },
    {
      icon: Brain,
      title: "AI-Powered Analytics",
      description: "Machine learning algorithms analyze environmental data to provide precise carbon sequestration estimates and trend predictions.",
      gradient: "from-earth-green to-earth-teal",
      delay: "delay-200"
    },
    {
      icon: Shield,
      title: "Blockchain Verification",
      description: "Immutable blockchain records ensure complete transparency and trust in every carbon offset transaction and verification.",
      gradient: "from-copper to-gold-warm",
      delay: "delay-300"
    },
    {
      icon: Eye,
      title: "Real-Time Transparency",
      description: "Live dashboards and reports provide instant access to project status, environmental impact, and verification metrics.",
      gradient: "from-primary-glow to-earth-teal",
      delay: "delay-400"
    }
  ];

  const stats = [
    { icon: Globe, value: "50M+", label: "Hectares Monitored", color: "text-earth-green" },
    { icon: Zap, value: "99.7%", label: "Accuracy Rate", color: "text-copper" },
    { icon: Target, value: "24/7", label: "Real-Time Monitoring", color: "text-primary-glow" },
    { icon: TrendingUp, value: "156", label: "Active Projects", color: "text-gold-warm" }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-background to-secondary/10">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 glass-panel rounded-full px-4 py-2 mb-6">
            <Zap className="w-4 h-4 text-copper" />
            <span className="text-sm font-premium-mono text-copper font-medium">Premium Features</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-premium-serif font-bold text-foreground mb-6">
            Next-Generation
            <span className="bg-gradient-copper bg-clip-text text-transparent"> Monitoring</span>
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-premium-sans leading-relaxed">
            Experience the future of carbon offset verification with our premium AI-powered satellite monitoring platform
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className={`glass-card hover:shadow-premium-lg transition-all duration-500 group border-0 ${feature.delay} animate-fade-in-up`}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`p-4 rounded-2xl bg-gradient-to-r ${feature.gradient} shadow-premium group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-premium-serif font-semibold text-foreground group-hover:text-copper transition-colors duration-300">
                    {feature.title}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-lg leading-relaxed font-premium-sans">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats Section */}
        <div className="glass-card p-12 mb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-full bg-gradient-to-r from-primary/10 to-copper/10 group-hover:from-primary/20 group-hover:to-copper/20 transition-all duration-300">
                    <stat.icon className={`h-8 w-8 ${stat.color} group-hover:scale-110 transition-transform duration-300`} />
                  </div>
                </div>
                <div className={`text-4xl font-premium-serif font-bold ${stat.color} mb-2 group-hover:scale-105 transition-transform duration-300`}>
                  {stat.value}
                </div>
                <div className="text-muted-foreground font-premium-sans text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Button variant="premium" size="xl" className="shadow-premium-lg hover:shadow-copper">
            Start Premium Monitoring
            <Satellite className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PremiumFeatures;
