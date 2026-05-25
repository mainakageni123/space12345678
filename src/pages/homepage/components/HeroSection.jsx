import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const HeroSection = () => {
  return (
    <section className="relative min-h-screen overflow-hidden bg-cosmic-depth flex items-center justify-center">
      {/* Background/Backdrop */}
      <div className="absolute inset-0 z-0 bg-cosmic-depth">
        <picture>
          <source 
            media="(max-width: 768px)" 
            srcSet="/assets/images/audi.jpg" 
          />
          <img
            src="/images/benz.jpg"
            alt="Premium mobility experience"
            loading="eager"
            fetchpriority="high"
            className="hero-image w-full h-full object-contain md:object-cover rounded-3xl shadow-2xl"
          />
        </picture>
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/10 to-transparent rounded-3xl" />
      </div>

      {/* Top Left Title & Description */}
      <div className="absolute top-8 left-8 z-20 max-w-md">
        <h1 className="text-white text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-tight drop-shadow-2xl mb-4">
          <span className="block">Premium Mobility</span>
          <span className="block text-stellar-gold bg-gradient-to-r from-stellar-gold to-yellow-400 bg-clip-text text-transparent">
            Experiences
          </span>
        </h1>
        <p className="text-white/80 text-sm sm:text-base lg:text-lg font-medium leading-relaxed drop-shadow-lg">
          Luxury rentals, curated trips & tours, and PSV transport—making every journey extraordinary.
        </p>
      </div>

      {/* Main Content Overlay */}
      <div className="relative z-10 w-full max-w-6xl px-6 sm:px-8 py-20 sm:py-24 flex flex-col items-center justify-center min-h-screen">
        {/* Empty space for clean center area */}
      </div>

      {/* Bottom Buttons - Responsive Layout: 1 top (Rent), 2 bottom (Trips, Pro) */}
      <div className="absolute bottom-24 left-4 right-4 z-20 md:left-8 md:right-auto md:bottom-32 md:w-auto">
        <div className="flex flex-col gap-3 w-full max-w-md mx-auto md:mx-0">
          
          {/* Top: Rent Vehicles (Full Width) */}
          <Link to="/fleet-discovery" className="w-full">
            <Button
              variant="premium"
              size="lg" // Larger primary CTA
              iconName="Car"
              iconPosition="left"
              className="w-full py-3.5 px-6 text-base font-bold bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl shadow-lg shadow-orange-900/20 hover:from-orange-600 hover:to-orange-700 hover:shadow-orange-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
            >
              <span className="flex items-center justify-center gap-2.5">
                <Icon name="Car" size={20} className="stroke-[2.5px]" />
                Rent Vehicles
              </span>
            </Button>
          </Link>

          {/* Bottom: Road Trips & Professional (Side by Side) */}
          <div className="grid grid-cols-2 gap-3">
            <Link to="/road-trip-adventures" className="w-full">
              <Button
                variant="glass"
                size="sm"
                iconName="MapPin"
                iconPosition="left"
                className="w-full py-2.5 px-3 text-sm font-semibold bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-xl shadow-lg hover:bg-white/20 hover:border-white/30 active:scale-[0.98] transition-all duration-300"
              >
                <span className="flex items-center justify-center gap-2">
                  <Icon name="MapPin" size={18} />
                  Trips & Tours
                </span>
              </Button>
            </Link>
            
            <Link to="/psv-professional-services" className="w-full">
              <Button
                variant="glass"
                size="sm"
                iconName="Briefcase"
                iconPosition="left"
                className="w-full py-2.5 px-3 text-sm font-semibold bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-xl shadow-lg hover:bg-white/20 hover:border-white/30 active:scale-[0.98] transition-all duration-300"
              >
                <span className="flex items-center justify-center gap-2">
                  <Icon name="Briefcase" size={18} />
                  PSV
                </span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;