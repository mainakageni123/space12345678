import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import WhatsAppButton from '../../../components/WhatsAppButton';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

// SVG Background Patterns for service cards
const patterns = {
  premium: (
    <svg className="absolute inset-0 w-full h-full opacity-5 pointer-events-none" width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
      <path d="M30 0L45 15H15L30 0Z M30 60L15 45H45L30 60Z" fill="currentColor" />
      <path d="M0 30L15 15V45L0 30Z M60 30L45 45V15L60 30Z" fill="currentColor" />
    </svg>
  ),
  roadtrip: (
    <svg className="absolute inset-0 w-full h-full opacity-5 pointer-events-none" width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 10h40v40h-40z" fill="none" stroke="currentColor" strokeWidth="2"/>
      <path d="M30 10v40" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4"/>
      <path d="M10 30h40" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4"/>
    </svg>
  ),
  professional: (
    <svg className="absolute inset-0 w-full h-full opacity-5 pointer-events-none" width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
      <circle cx="30" cy="30" r="20" fill="none" stroke="currentColor" strokeWidth="2"/>
      <circle cx="30" cy="30" r="10" fill="none" stroke="currentColor" strokeWidth="2"/>
      <path d="M30 0v60" stroke="currentColor" strokeWidth="2" strokeDasharray="2 4"/>
      <path d="M0 30h60" stroke="currentColor" strokeWidth="2" strokeDasharray="2 4"/>
    </svg>
  )
};

const ServiceDiscovery = () => {
  const services = [
    {
      id: 1,
      title: "Premium Vehicle Rentals",
      description: "Access our curated fleet of luxury vehicles for an exceptional driving experience.",
      image: "/images/premium vehicle rentals.avif",
      features: ["Luxury Fleet", "24/7 Support"],
      route: "/fleet-discovery",
      icon: "Car",
      color: "bg-cosmic-depth",
      pattern: "premium"
    },
    {
      id: 2,
      title: "Trips & Tours",
      description: "Join expertly planned road trips to breathtaking destinations.",
      image: "/images/road trip adventure.webp",
      features: ["Expert Planning", "Local Guides"],
      route: "/road-trip-adventures",
      icon: "Map",
      color: "bg-adventure-orange",
      pattern: "roadtrip"
    },
    {
      id: 3,
      title: "PSV Transport",
      description: "Reliable group transport for corporate events and special occasions.",
      image: "/images/Professional Transport.jpg",
      features: ["Corporate & Personal", "Group Transport"],
      route: "/psv-professional-services",
      icon: "Users",
      color: "bg-professional-blue",
      pattern: "professional"
    }
  ];

  return (
    <section className="py-12 sm:py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-8 px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-cosmic-depth mb-4">
            Choose Your Journey
          </h2>
          <p className="text-base sm:text-lg text-text-refined max-w-2xl mx-auto leading-relaxed">
            Select from our premium services and start your exceptional experience today.
          </p>
        </div>

        <div className="overflow-x-auto sm:overflow-x-visible pb-4 sm:pb-0 snap-x snap-mandatory scrollbar-hide">
          <div className="flex gap-4 sm:grid sm:grid-cols-3 sm:gap-4 max-w-5xl mx-auto px-4 sm:px-6">
            {services?.map((service, index) => (
              <div
                key={service?.id}
                className="group relative bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex-shrink-0 w-80 sm:w-auto snap-center"
              >
              {/* Image Section */}
              {patterns[service?.pattern]}
              <div className="relative h-44 overflow-hidden">
                <Image
                  src={service?.image}
                  alt={service?.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                
                {/* Icon Badge */}
                <div className={`absolute top-4 left-4 w-12 h-12 ${service?.color} rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-all duration-300 shadow-lg`}>
                  <Icon 
                    name={service?.icon} 
                    size={24} 
                    className="text-white transform transition-transform duration-300 group-hover:rotate-12" 
                    strokeWidth={2.5} 
                  />
                </div>

                {/* Service Number */}
                <div className="absolute top-3 right-3 w-6 h-6 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-xs">{String(index + 1)?.padStart(2, '0')}</span>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-4 sm:p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {service?.title}
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  {service?.description}
                </p>

                {/* Features */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {service?.features?.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-full">
                      <Icon name="Check" size={12} className="text-green-500" />
                      <span className="text-xs text-gray-600">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <Link 
                  to={service?.route} 
                  className="block w-full py-3 px-4 border-2 border-cosmic-depth text-cosmic-depth hover:bg-cosmic-depth hover:text-white transition-all duration-300 rounded-lg text-center font-medium group"
                >
                  <span className="flex items-center justify-center gap-2">
                    <span>Explore Service</span>
                    <Icon 
                      name="ArrowRight" 
                      size={18} 
                      className="transform group-hover:translate-x-1 transition-transform duration-300" 
                    />
                  </span>
                </Link>
              </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
                    <div className="bg-surface-premium rounded-2xl p-6 sm:p-8 premium-shadow max-w-5xl mx-auto">
            <div className="flex items-center space-x-3 mb-6">
              <Icon name="PhoneCall" className="text-cosmic-depth" size={24} />
              <h3 className="text-xl sm:text-2xl font-semibold text-cosmic-depth">Need Something Custom?</h3>
            </div>
            <p className="text-text-refined mb-6 sm:mb-8">
              Our team specializes in creating bespoke mobility solutions tailored to your unique requirements. From corporate transportation programs to custom adventure packages.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <a
                href="tel:+254724440293"
                className="w-full sm:w-auto"
              >
                <Button
                  variant="default"
                  iconName="PhoneCall"
                  iconPosition="left"
                  className="w-full bg-cosmic-depth hover:bg-cosmic-depth/90 py-3 px-6"
                >
                  <span className="flex items-center justify-center gap-2">
                    <Icon name="PhoneCall" size={20} />
                    <span>Call +254 724 440293</span>
                  </span>
                </Button>
              </a>
              <div className="w-full sm:w-auto">
                <WhatsAppButton 
                  phoneNumber="+254724440293"
                  message="Hi, I'm interested in your custom mobility solutions."
                  className="w-full py-3 px-6"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServiceDiscovery;