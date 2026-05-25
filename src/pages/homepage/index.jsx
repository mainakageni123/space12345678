import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import HeroSection from './components/HeroSection';
import ServiceDiscovery from './components/ServiceDiscovery';
import FeaturedVehicles from './components/FeaturedVehicles';
import TrustSignals from './components/TrustSignals';
import Footer from '../../components/Footer.jsx';
import MobileNavigation from '../../components/MobileNavigation';

const Homepage = () => {
  useEffect(() => {
    // Scroll to top on component mount
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>SpaceBorne - Premium Mobility Experiences | Luxury Car Rentals & Trips & Tours</title>
        <meta 
          name="description" 
          content="Transform your journey with SpaceBorne's premium mobility services. Luxury vehicle rentals, curated trips & tours, and premium PSV services. Every journey deserves to be extraordinary." 
        />
        <meta 
          name="keywords" 
          content="luxury car rental, premium vehicles, trips & tours, PSV services, executive transportation, SpaceBorne mobility" 
        />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="SpaceBorne - Premium Mobility Experiences" />
        <meta 
          property="og:description" 
          content="Discover extraordinary journeys with SpaceBorne's premium mobility solutions. Luxury rentals, curated trips & tours, and premium PSV services." 
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://gmail.com/Spacebornentreprices" />
        <link rel="canonical" href="https://gmail.com/Spacebornentreprices" />
      </Helmet>

      <div className="min-h-screen bg-surface-premium">
        {/* Header */}
        <Header />

        {/* Main Content */}
        <main className="pt-16 pb-20 sm:pb-8">
          {/* Hero Section with Cinematic Experience */}
          <HeroSection />

          {/* Booking widget removed per request */}

          {/* Service Discovery Section */}
          <ServiceDiscovery />

          {/* Featured Premium Fleet */}
          <FeaturedVehicles />

          {/* Trust Signals & Certifications */}
          <TrustSignals />
        </main>

        {/* Footer */}
        <Footer />

      </div>
    </>
  );
};

export default Homepage;