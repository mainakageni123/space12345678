import React from 'react';
import Icon from '../../../components/AppIcon';

const TrustSignals = () => {
  const certifications = [
    {
      id: 1,
      name: "NTSA Certified",
      description: "",
      icon: "Shield",
      badge: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
    },
    {
      id: 2,
      name: "Fully Insured",
      description: "",
      icon: "ShieldCheck",
      badge: "https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=100&q=80"
    },
    {
      id: 3,
      name: "Safety First",
      description: "",
      icon: "Award",
      badge: "https://images.pixabay.com/photo/2017/06/10/07/18/list-2389219_1280.png?auto=compress&cs=tinysrgb&w=100&q=80"
    },
    {
      id: 4,
      name: "24/7 Support",
      description: "",
      icon: "Headphones",
      badge: "https://images.unsplash.com/photo-1553484771-371a605b060b?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
    }
  ];



  return (
    <section className="py-20 bg-surface-premium">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-cosmic-depth mb-6">
            Your Trust, Our Priority
          </h2>
          <p className="text-xl text-text-refined max-w-3xl mx-auto leading-relaxed">
            SpaceBorne ensures a premium, secure, and high-quality experience through rigorous standards and certifications.
          </p>
        </div>

        {/* Certifications Grid - 2x2 on mobile, 4 in a row on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 mb-20">
          {certifications.map((cert) => (
            <div key={cert.id} className="text-center group">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-cosmic-silver rounded-2xl flex items-center justify-center mx-auto group-hover:bg-stellar-gold brand-transition">
                  <Icon 
                    name={cert.icon} 
                    size={32} 
                    color="var(--color-cosmic-depth)" 
                    strokeWidth={2} 
                  />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-success rounded-full flex items-center justify-center">
                  <Icon name="Check" size={16} color="white" strokeWidth={3} />
                </div>
              </div>
              <h3 className="text-lg font-bold text-cosmic-depth mb-2 group-hover:text-adventure-orange brand-transition">
                {cert.name}
              </h3>
              <p className="text-sm text-text-refined leading-relaxed">
                {cert.description}
              </p>
            </div>
          ))}
        </div>



        {/* Bottom Stats */}
        <div className="mt-20 bg-cosmic-depth rounded-2xl p-4 sm:p-8 lg:p-12">
          <div className="grid grid-cols-3 gap-2 sm:gap-8 text-center">
            <div className="px-1 sm:px-0">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-stellar-gold mb-1 sm:mb-2">99.9%</div>
              <div className="text-white font-medium mb-1 text-xs sm:text-sm lg:text-base">Guaranteed Availability</div>
              <div className="text-cosmic-silver text-xs sm:text-sm hidden sm:block">Reliable service is guaranteed</div>
            </div>
            <div className="px-1 sm:px-0 border-x border-white/10">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-stellar-gold mb-1 sm:mb-2">Full</div>
              <div className="text-white font-medium mb-1 text-xs sm:text-sm lg:text-base">Total Peace of Mind</div>
              <div className="text-cosmic-silver text-xs sm:text-sm hidden sm:block">Reliable service is guaranteed</div>
            </div>
            <div className="px-1 sm:px-0">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-stellar-gold mb-1 sm:mb-2">24/7</div>
              <div className="text-white font-medium mb-1 text-xs sm:text-sm lg:text-base">Round-the-Clock Help</div>
              <div className="text-cosmic-silver text-xs sm:text-sm hidden sm:block">Reliable service is guaranteed</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustSignals;