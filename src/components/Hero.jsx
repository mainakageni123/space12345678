import React from 'react';
import { Link } from 'react-router-dom';
import Icon from './AppIcon';

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with black background for mobile letterboxing */}
      <div className="absolute inset-0 z-0 bg-black">
        {/* Background Image with responsive switching */}
        <picture>
          {/* Mobile Image (Portrait) - using the user provided audi image */}
          <source 
            media="(max-width: 768px)" 
            srcSet="/assets/images/audi.jpg" 
          />
          {/* Desktop Image (Landscape) - default fallback */}
          <img 
            src="/images/benz.jpg" 
            alt="Luxury Car" 
            fetchpriority="high"
            loading="eager"
            className="hero-image w-full h-full object-cover object-center"
          />
        </picture>

        {/* Dark gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 w-full px-4 py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Every Journey<br />
            Deserves to be<br />
            Extraordinary
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-2xl mx-auto px-4">
            Premium mobility experiences that transcend traditional transportation with luxury, comfort, and style
          </p>
        </div>
      </div>

      {/* Action Buttons - positioned at bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-20 pb-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Primary Button - Rent Premium Vehicles */}
            <Link 
              to="/fleet-discovery"
              className="group py-4 px-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-base md:text-lg font-semibold rounded-lg flex items-center justify-center gap-3 hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <Icon name="Car" size={24} className="flex-shrink-0" />
              <span className="whitespace-nowrap">Rent Premium Vehicles</span>
            </Link>

            {/* Secondary Button - Trips & Tours */}
            <Link 
              to="/road-trip-adventures"
              className="group py-4 px-6 bg-white/20 backdrop-blur-md text-white text-base md:text-lg font-semibold rounded-lg flex items-center justify-center gap-3 hover:bg-white/30 transition-all duration-300 border border-white/20 hover:border-white/40 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <Icon name="Map" size={24} className="flex-shrink-0" />
              <span className="whitespace-nowrap">Explore Trips & Tours</span>
            </Link>

            {/* Secondary Button - PSV Services */}
            <Link 
              to="/psv-professional-services"
              className="group py-4 px-6 bg-white/20 backdrop-blur-md text-white text-base md:text-lg font-semibold rounded-lg flex items-center justify-center gap-3 hover:bg-white/30 transition-all duration-300 border border-white/20 hover:border-white/40 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <Icon name="Users" size={24} className="flex-shrink-0" />
              <span className="whitespace-nowrap">Book PSV Services</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;