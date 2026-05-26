import React from 'react';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';
import WhatsAppButton from '../../../components/WhatsAppButton';
import { SUPPORT_TEL_URL } from '../../../config/contact';
import Icon from '../../../components/AppIcon';

const HeroSection = () => {
  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <picture className="absolute inset-0 w-full h-full">
          <source media="(min-width: 768px)" srcSet="/assets/images/luxury%202.jpg" />
          <img
            src="/assets/images/luxury.jpg"
            alt="PSV Mercedes Benz executive transportation"
            loading="eager"
            fetchpriority="high"
            className="w-full h-full object-cover"
            onError={(e) => {
              console.log('Benz image failed to load, using fallback');
              e.target.src = '/assets/images/no_image.png';
            }}
          />
        </picture>
        {/* Enhanced gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 pt-24 pb-16 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
            {/* Left Content */}
            <div className="text-white">
              {/* Enhanced Title with Animation */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                <span className="block text-white drop-shadow-2xl">Corporate & Group Transport</span>
                <span className="block text-stellar-gold drop-shadow-2xl bg-gradient-to-r from-stellar-gold to-yellow-400 bg-clip-text text-transparent animate-pulse">
                  Redefined
                </span>
              </h1>
            </div>

            {/* Right Content - Empty for now */}
            <div className="lg:pl-12">
              {/* This space can be used for additional content or left empty */}
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp Button at Bottom */}
      {/* Action Buttons at Bottom */}
      <div className="absolute bottom-8 inset-x-0 sm:left-8 sm:right-auto sm:inset-x-auto flex flex-row items-center justify-center sm:justify-start gap-3 sm:gap-4 z-20 px-4 sm:px-0">
        
        {/* Call Button */}
        <div className="group relative">
             <div className="absolute -inset-1 bg-gradient-to-r from-stellar-gold to-yellow-500 rounded-full blur opacity-30 group-hover:opacity-60 transition duration-300"></div>
             <a 
               href={SUPPORT_TEL_URL}
               className="relative flex items-center gap-2 sm:gap-3 px-6 py-3 sm:px-8 sm:py-4 bg-stellar-gold hover:bg-yellow-500 text-cosmic-depth font-bold rounded-full shadow-xl transform hover:scale-105 transition-all duration-300 text-base sm:text-lg"
             >
               <Icon name="Phone" size={20} className="sm:w-6 sm:h-6" />
               <span>Call Now</span>
             </a>
        </div>
 
        {/* WhatsApp Button */}
        <div className="group relative">
           <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-green-600 rounded-full blur opacity-30 group-hover:opacity-60 transition duration-300"></div>
           <WhatsAppButton
             className="relative px-6 py-3 sm:px-8 sm:py-4 bg-green-500 hover:bg-green-600 border-0 text-white text-base sm:text-lg font-semibold rounded-full shadow-xl transform hover:scale-105 transition-all duration-300 !mt-0 !w-auto"
           >
             Text us on WhatsApp
           </WhatsAppButton>
        </div>
      </div>

      {/* Enhanced Scroll Indicator */}
      <div className="hidden md:block absolute bottom-8 right-6 lg:right-8 text-white animate-bounce">
        <div className="flex flex-col items-center space-y-3">
          <span className="text-sm text-gray-300 font-medium tracking-wide">Explore Services</span>
          <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center backdrop-blur-sm bg-white/10">
            <div className="w-1 h-3 bg-stellar-gold rounded-full mt-2 animate-pulse shadow-lg"></div>
          </div>
        </div>
      </div>

      {/* Floating Elements for Visual Interest */}
      <div className="absolute top-1/4 right-10 w-2 h-2 bg-stellar-gold rounded-full animate-ping opacity-60"></div>
      <div className="absolute top-1/3 right-20 w-1 h-1 bg-white rounded-full animate-pulse"></div>
      <div className="absolute bottom-1/4 left-10 w-1.5 h-1.5 bg-stellar-gold rounded-full animate-ping opacity-40"></div>
    </section>
  );
};

export default HeroSection;