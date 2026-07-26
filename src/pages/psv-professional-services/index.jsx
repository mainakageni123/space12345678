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
        <title>Executive Chauffeur & PSV Corporate Transport Nairobi | SpaceBorne LTD</title>
        <meta name="description" content="Premium corporate transit, group travel, and luxury PSV options in Nairobi. Professional chauffeurs and VIP executive travel in Kenya." />
        <meta name="keywords" content="PSV services Kenya, corporate transport Nairobi, chauffeur car hire Nairobi, VIP executive transfer, SpaceBorne PSV" />
        <meta property="og:title" content="SpaceBorne LTD - Executive PSV & Chauffeur Services" />
        <meta property="og:description" content="Premium corporate and executive transit solutions in Kenya. Professional chauffeurs and group travel." />
        <meta property="og:url" content="https://spaceborneltd.com/psv-professional-services" />
        <link rel="canonical" href="https://spaceborneltd.com/psv-professional-services" />
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