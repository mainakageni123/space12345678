import React from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import HeroSection from './components/HeroSection';
import ServiceCategories from './components/ServiceCategories';
import FleetShowcase from './components/FleetShowcase';
import SafetyCompliance from './components/SafetyCompliance';
import Footer from '../../components/Footer';

const PSVProfessionalServices = () => {
  return (
    <>
      <Helmet>
        <title>Professional PSV & Corporate Travel Services | SpaceBorne</title>
        <meta name="description" content="Premium corporate transit, group travel, and luxury PSV options. Tailored chauffeur services and VIP executive travel in Kenya." />
        <meta name="keywords" content="PSV services, corporate transport, chauffeur car hire, group tours transit, SpaceBorne transport" />
        <meta property="og:title" content="SpaceBorne - Professional PSV Services" />
        <meta property="og:description" content="Premium corporate and executive transit solutions. Professional chauffeurs and group travel." />
      </Helmet>
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
    </>
  );
};

export default PSVProfessionalServices;