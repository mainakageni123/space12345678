import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = [
    {
      id: 1,
      image: "/images/savannah.jpg",
      title: "Kenya Savannah Adventure",
      subtitle: "Where wildlife meets wonder",
      location: "Kenya Savannah"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides?.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [heroSlides?.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides?.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides?.length) % heroSlides?.length);
  };

  return (
    <section className="relative h-screen overflow-hidden bg-cosmic-depth">
      {/* Hero Slides */}
      <div className="relative w-full h-full">
        {heroSlides?.map((slide, index) => (
          <div
            key={slide?.id}
            className={`absolute inset-0 brand-transition duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="relative w-full h-full overflow-hidden">
              <picture>
                <source 
                  media="(max-width: 768px)" 
                  srcSet="/assets/images/adventure.jpg" 
                />
                <img
                  src={slide?.image}
                  alt={slide?.title}
                  loading="eager"
                  fetchpriority="high"
                  className="w-full h-full object-cover"
                />
              </picture>
              <div className="absolute inset-0 bg-gradient-to-r from-cosmic-depth/80 via-cosmic-depth/40 to-transparent" />
            </div>
          </div>
        ))}
      </div>
      {/* Content Overlay */}
      <div className="absolute inset-0 flex flex-col">
        {/* Title - Higher Position */}
        <div className="flex-1 flex items-start justify-start pt-32">
          <div className="w-full max-w-7xl mx-auto px-6 lg:px-8">
            <div className="max-w-2xl">
              <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight">
                Your Next Adventure
                <span className="block text-stellar-gold font-accent">
                  Starts Here
                </span>
              </h1>
              <p className="mt-6 text-xl sm:text-2xl lg:text-3xl font-medium text-white/90 tracking-wide max-w-xl">
                Trips across Kenya, crafted for you.
              </p>
            </div>
          </div>
        </div>
        
        {/* Button - Bottom Position */}
        <div className="pb-16">
          <div className="w-full max-w-7xl mx-auto px-6 lg:px-8 text-center">
            <Button
              variant="default"
              size="lg"
              iconName="ChevronDown"
              iconPosition="right"
              onClick={() => {
                const adventuresSection = document.getElementById('available-adventures');
                if (adventuresSection) {
                  adventuresSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="bg-stellar-gold hover:bg-stellar-gold/90 text-cosmic-depth font-semibold stellar-glow"
            >
              View Available Trips & Tours
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;