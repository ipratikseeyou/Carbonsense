
import React from 'react';
import { Link } from 'react-router-dom';
import { Satellite, Mail, Phone, MapPin, Globe, Twitter, Linkedin, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PremiumFooter = () => {
  const footerSections = [
    {
      title: "Platform",
      links: [
        { name: "Dashboard", href: "/projects" },
        { name: "Upload Project", href: "/projects/upload" },
        { name: "Monitoring", href: "#monitoring" },
        { name: "Analytics", href: "#analytics" }
      ]
    },
    {
      title: "Solutions",
      links: [
        { name: "Carbon Verification", href: "#verification" },
        { name: "Satellite Monitoring", href: "#monitoring" },
        { name: "AI Analytics", href: "#ai" },
        { name: "Blockchain Trust", href: "#blockchain" }
      ]
    },
    {
      title: "Resources",
      links: [
        { name: "Documentation", href: "#docs" },
        { name: "API Reference", href: "#api" },
        { name: "Case Studies", href: "#cases" },
        { name: "Support", href: "#support" }
      ]
    },
    {
      title: "Company",
      links: [
        { name: "About Us", href: "#about" },
        { name: "Careers", href: "#careers" },
        { name: "Privacy Policy", href: "#privacy" },
        { name: "Terms of Service", href: "#terms" }
      ]
    }
  ];

  const socialLinks = [
    { icon: Twitter, href: "#twitter", label: "Twitter" },
    { icon: Linkedin, href: "#linkedin", label: "LinkedIn" },
    { icon: Github, href: "#github", label: "GitHub" }
  ];

  return (
    <footer className="relative bg-gradient-to-b from-space-navy to-space-navy-light text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-copper/5"></div>
      </div>

      <div className="relative container mx-auto px-6 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-4">
            <Link to="/" className="flex items-center space-x-3 group mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-copper rounded-full blur-sm opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
                <div className="relative bg-gradient-copper p-3 rounded-full">
                  <Satellite className="h-8 w-8 text-white" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-premium-serif font-bold text-white group-hover:text-copper transition-colors duration-300">
                  CarbonSense
                </span>
                <span className="text-sm font-premium-mono text-white/60 -mt-1">
                  Premium Carbon Monitoring
                </span>
              </div>
            </Link>
            
            <p className="text-white/80 text-lg leading-relaxed font-premium-sans mb-6 max-w-md">
              Next-generation AI-powered satellite monitoring for transparent, verified carbon offset projects. 
              Building trust through technology.
            </p>

            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-white/70">
                <Mail className="h-5 w-5 text-copper" />
                <span className="font-premium-sans">contact@carbonsense.ai</span>
              </div>
              <div className="flex items-center gap-3 text-white/70">
                <Phone className="h-5 w-5 text-copper" />
                <span className="font-premium-sans">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-3 text-white/70">
                <MapPin className="h-5 w-5 text-copper" />
                <span className="font-premium-sans">San Francisco, CA</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <Button
                  key={social.label}
                  variant="ghost"
                  size="icon"
                  className="glass-panel hover:bg-copper/20 hover:border-copper/30 transition-all duration-300"
                  asChild
                >
                  <a href={social.href} aria-label={social.label}>
                    <social.icon className="h-5 w-5 text-white/70 hover:text-copper transition-colors duration-300" />
                  </a>
                </Button>
              ))}
            </div>
          </div>

          {/* Navigation Sections */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {footerSections.map((section, index) => (
                <div key={index}>
                  <h3 className="text-lg font-premium-serif font-semibold text-white mb-4">
                    {section.title}
                  </h3>
                  <ul className="space-y-3">
                    {section.links.map((link, linkIndex) => (
                      <li key={linkIndex}>
                        <Link
                          to={link.href}
                          className="text-white/70 hover:text-copper transition-colors duration-300 font-premium-sans text-sm"
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="glass-panel p-8 rounded-2xl mb-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-premium-serif font-bold text-white mb-2">
                Stay Updated
              </h3>
              <p className="text-white/70 font-premium-sans">
                Get the latest insights on carbon monitoring and sustainability
              </p>
            </div>
            <div className="flex gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 font-premium-sans focus:outline-none focus:ring-2 focus:ring-copper min-w-[250px]"
              />
              <Button variant="premium" size="lg">
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6 text-white/60 font-premium-sans text-sm">
              <span>© 2024 CarbonSense. All rights reserved.</span>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-copper" />
                <span>Global Carbon Monitoring</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-white/60 font-premium-sans text-sm">
              <Link to="#privacy" className="hover:text-copper transition-colors duration-300">
                Privacy
              </Link>
              <span>•</span>
              <Link to="#terms" className="hover:text-copper transition-colors duration-300">
                Terms
              </Link>
              <span>•</span>
              <Link to="#cookies" className="hover:text-copper transition-colors duration-300">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PremiumFooter;
