import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const CustomerStories = () => {
  const [currentStory, setCurrentStory] = useState(0);

  const customerStories = [
    {
      id: 1,
      name: "Grace Wanjiku",
      role: "Business Owner",
      location: "Nairobi, Kenya",
      service: "Coastal Kenya Adventure",
      rating: 5,
      testimonial: `SpaceBorne made our family vacation to the Kenyan coast absolutely magical. From the pristine beaches of Diani to the historic Lamu Island, every moment was perfectly planned. The luxury vehicle and PSV service exceeded our expectations.`,
      experience: "5-day Coastal Journey",
      date: "December 2024",
      highlights: ["Luxury SUV", "Beach resorts", "Swahili culture tour", "PSV guide"]
    },
    {
      id: 2,
      name: "James Mwangi",
      role: "Corporate Executive",
      location: "Mombasa, Kenya",
      service: "Mount Kenya Safari",
      rating: 5,
      testimonial: `The Mount Kenya circuit was an unforgettable experience. SpaceBorne's local expertise and luxury vehicles made our wildlife safari comfortable and exciting. The mountain lodges and wildlife encounters were beyond amazing.`,
      experience: "7-day Mountain Safari",
      date: "November 2024",
      highlights: ["4WD Safari vehicle", "Mountain lodges", "Wildlife tours", "Expert guide"]
    },
    {
      id: 3,
      name: "Mary Akinyi",
      role: "Event Coordinator",
      location: "Kisumu, Kenya",
      service: "Rift Valley Exploration",
      rating: 5,
      testimonial: `Organizing our corporate retreat with SpaceBorne was seamless. The Rift Valley exploration was breathtaking, and the luxury accommodations were perfect. Our team is still talking about the experience months later.`,
      experience: "4-day Rift Valley Tour",
      date: "October 2024",
      highlights: ["Luxury transport", "Rift Valley lodges", "Team building", "Local cuisine"]
    },
    {
      id: 4,
      name: "Peter Kamau",
      role: "Investment Manager",
      location: "Nairobi, Kenya",
      service: "Executive Transport",
      rating: 5,
      testimonial: `SpaceBorne's executive service is exceptional. Always punctual, PSV drivers, and immaculate vehicles. Their understanding of Nairobi traffic and routes saves me valuable time for important business meetings.`,
      experience: "Monthly Executive Service",
      date: "Ongoing since June 2024",
      highlights: ["Mercedes S-Class", "Priority booking", "24/7 support", "Corporate rates"]
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStory((prev) => (prev + 1) % customerStories?.length);
    }, 8000);

    return () => clearInterval(timer);
  }, [customerStories?.length]);

  const nextStory = () => {
    setCurrentStory((prev) => (prev + 1) % customerStories?.length);
  };

  const prevStory = () => {
    setCurrentStory((prev) => (prev - 1 + customerStories?.length) % customerStories?.length);
  };

  const currentCustomer = customerStories?.[currentStory];

  return (
    <section className="py-20 bg-cosmic-depth">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Stories from Our Journey
          </h2>
          <p className="text-xl text-cosmic-silver max-w-3xl mx-auto leading-relaxed">
            Discover how SpaceBorne has transformed ordinary trips into extraordinary experiences 
            for thousands of satisfied customers across Kenya and East Africa.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Story Content */}
          <div className="order-2 lg:order-1">
            <div className="bg-surface-premium rounded-2xl p-8 premium-shadow">
              {/* Customer Info */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="relative">
                  <Image
                    src={currentCustomer?.avatar}
                    alt={currentCustomer?.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-success rounded-full flex items-center justify-center">
                    <Icon name="Check" size={14} color="white" strokeWidth={3} />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-cosmic-depth">{currentCustomer?.name}</h3>
                  <p className="text-text-refined text-sm">{currentCustomer?.role}</p>
                  <p className="text-text-refined text-sm">{currentCustomer?.location}</p>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center space-x-2 mb-6">
                <div className="flex items-center">
                  {[...Array(5)]?.map((_, i) => (
                    <Icon
                      key={i}
                      name="Star"
                      size={18}
                      color={i < currentCustomer?.rating ? "#ffc107" : "#e0e0e0"}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-cosmic-depth ml-2">
                  {currentCustomer?.rating}.0 out of 5
                </span>
              </div>

              {/* Testimonial */}
              <blockquote className="text-text-charcoal text-lg leading-relaxed mb-6 italic">
                "{currentCustomer?.testimonial}"
              </blockquote>

              {/* Experience Details */}
              <div className="bg-cosmic-silver rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-cosmic-depth">{currentCustomer?.experience}</h4>
                  <span className="text-sm text-text-refined">{currentCustomer?.date}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {currentCustomer?.highlights?.map((highlight, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Icon name="Check" size={14} color="var(--color-success)" strokeWidth={2} />
                      <span className="text-sm text-text-refined">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Service Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Icon name="Award" size={16} color="var(--color-stellar-gold)" />
                  <span className="text-sm font-medium text-cosmic-depth">{currentCustomer?.service}</span>
                </div>
                <div className="text-sm text-text-refined">Verified Customer</div>
              </div>
            </div>
          </div>

          {/* Story Image */}
          <div className="order-1 lg:order-2">
            <div className="relative">
              <div className="relative h-96 lg:h-[500px] rounded-2xl overflow-hidden premium-shadow">
                <div className="absolute inset-0 bg-gradient-to-br from-cosmic-silver/10 to-cosmic-depth/20 backdrop-blur" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Icon name="Star" size={48} className="text-stellar-gold mb-4" />
                    <div className="text-2xl font-semibold mb-2">{currentCustomer?.experience}</div>
                    <div className="text-cosmic-silver">{currentCustomer?.date}</div>
                  </div>
                </div>
                
                {/* Navigation Controls */}
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={prevStory}
                      className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 brand-transition"
                    >
                      <Icon name="ChevronLeft" size={20} />
                    </button>
                    
                    <div className="flex space-x-2">
                      {customerStories?.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentStory(index)}
                          className={`w-3 h-3 rounded-full brand-transition ${
                            index === currentStory ? 'bg-stellar-gold' : 'bg-white/40'
                          }`}
                        />
                      ))}
                    </div>
                    
                    <button
                      onClick={nextStory}
                      className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 brand-transition"
                    >
                      <Icon name="ChevronRight" size={20} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Floating Stats */}
              <div className="absolute -top-6 -right-6 bg-stellar-gold rounded-2xl p-4 text-cosmic-depth">
                <div className="text-center">
                  <div className="text-2xl font-bold">4.9</div>
                  <div className="text-xs font-medium">Average Rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default CustomerStories;