import React from 'react';
import Header from '../../components/ui/Header';
import HeroSection from './components/HeroSection';
import ServiceCategories from './components/ServiceCategories';
import FleetShowcase from './components/FleetShowcase';
import SafetyCompliance from './components/SafetyCompliance';
import Footer from '../../components/Footer';

const PSVProfessionalServices = () => {
  return (
    <div className="min-h-screen bg-surface-premium">
      <Header />
      
      {/* Hero Section */}
      <HeroSection />
      
      {/* Service Categories */}
      <ServiceCategories />
      
      {/* Fleet Showcase */}
      <FleetShowcase />
      
      {/* Safety & Compliance */}
      <SafetyCompliance />
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default PSVProfessionalServices;