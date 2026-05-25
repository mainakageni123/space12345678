import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const BookingCapabilities = () => {
  const [activeTab, setActiveTab] = useState('realtime');

  const bookingFeatures = [
    {
      id: 'realtime',
      title: 'Real-Time Booking',
      icon: 'Clock',
      description: 'Instant availability checking and immediate confirmations'
    },
    {
      id: 'fleet',
      title: 'Fleet Management',
      icon: 'Car',
      description: 'Live fleet tracking and vehicle assignment optimization'
    },
    {
      id: 'driver',
      title: 'Driver Assignment',
      icon: 'User',
      description: 'Automated driver matching based on expertise and availability'
    },
    {
      id: 'confirmation',
      title: 'Service Confirmation',
      icon: 'CheckCircle',
      description: 'Comprehensive booking confirmations with all service details'
    }
  ];

  const realtimeFeatures = [
    {
      title: "Instant Availability",
      description: "Check vehicle availability in real-time across our entire PSV fleet",
      icon: "Search",
      status: "Live"
    },
    {
      title: "Dynamic Pricing",
      description: "Transparent pricing with real-time adjustments based on demand and duration",
      icon: "DollarSign",
      status: "Active"
    },
    {
      title: "Route Optimization",
      description: "AI-powered route planning for maximum efficiency and cost savings",
      icon: "Navigation",
      status: "Smart"
    },
    {
      title: "Conflict Resolution",
      description: "Automatic scheduling conflict detection and alternative suggestions",
      icon: "AlertTriangle",
      status: "Protected"
    }
  ];

  const fleetCapabilities = [
    {
      title: "Live Vehicle Tracking",
      description: "GPS monitoring of all vehicles with real-time location updates",
      icon: "MapPin",
      metric: "50+ Vehicles"
    },
    {
      title: "Maintenance Scheduling",
      description: "Automated maintenance alerts and service scheduling integration",
      icon: "Wrench",
      metric: "99.9% Uptime"
    },
    {
      title: "Fuel Management",
      description: "Real-time fuel monitoring and cost optimization across the fleet",
      icon: "Fuel",
      metric: "15% Savings"
    },
    {
      title: "Performance Analytics",
      description: "Comprehensive fleet performance metrics and optimization insights",
      icon: "BarChart",
      metric: "24/7 Monitoring"
    }
  ];

  const driverFeatures = [
    {
      title: "Smart Matching",
      description: "AI-powered driver assignment based on skills, location, and availability",
      icon: "Brain",
      detail: "< 2 minutes"
    },
    {
      title: "Qualification Verification",
      description: "Real-time verification of driver licenses, certifications, and training",
      icon: "Shield",
      detail: "100% Verified"
    },
    {
      title: "Performance Tracking",
      description: "Continuous monitoring of driver performance and customer satisfaction",
      icon: "TrendingUp",
      detail: "4.9/5 Rating"
    },
    {
      title: "Communication Hub",
      description: "Direct communication channel between clients, drivers, and dispatch",
      icon: "MessageCircle",
      detail: "Instant Updates"
    }
  ];

  const confirmationDetails = [
    {
      title: "Booking Reference",
      description: "Unique booking ID with QR code for easy reference and tracking",
      icon: "Hash",
      example: "SB-PSV-2024-001234"
    },
    {
      title: "Driver Profile",
      description: "Complete driver information including photo, credentials, and contact",
      icon: "User",
      example: "John Smith, 15 years exp."
    },
    {
      title: "Vehicle Details",
      description: "Comprehensive vehicle information including make, model, and amenities",
      icon: "Car",
      example: "Mercedes S-Class, License: ABC123"
    },
    {
      title: "Service Timeline",
      description: "Detailed itinerary with pickup times, routes, and estimated arrivals",
      icon: "Calendar",
      example: "Dec 15, 2024 - 9:00 AM"
    }
  ];

  const getTabContent = () => {
    switch (activeTab) {
      case 'realtime':
        return realtimeFeatures;
      case 'fleet':
        return fleetCapabilities;
      case 'driver':
        return driverFeatures;
      case 'confirmation':
        return confirmationDetails;
      default:
        return realtimeFeatures;
    }
  };

  return (
    <section className="py-20 bg-surface-premium">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-cosmic-silver rounded-full px-4 py-2 mb-6">
            <Icon name="Zap" size={16} className="text-cosmic-depth" />
            <span className="text-cosmic-depth font-medium text-sm">Advanced Booking System</span>
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-bold text-cosmic-depth mb-6">
            Real-Time Booking Capabilities
          </h2>
          
          <p className="text-xl text-text-refined max-w-3xl mx-auto leading-relaxed">
            Experience the future of PSV transportation booking with our advanced 
            real-time system that ensures perfect coordination between fleet, drivers, and service delivery.
          </p>
        </div>

        {/* Feature Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {bookingFeatures?.map((feature) => (
            <button
              key={feature?.id}
              onClick={() => setActiveTab(feature?.id)}
              className={`flex items-center space-x-3 px-6 py-4 rounded-xl font-medium brand-transition ${
                activeTab === feature?.id
                  ? 'bg-cosmic-depth text-white' :'bg-white text-text-charcoal hover:bg-cosmic-silver premium-shadow'
              }`}
            >
              <Icon name={feature?.icon} size={20} />
              <div className="text-left">
                <div className="font-semibold">{feature?.title}</div>
                <div className="text-xs opacity-80">{feature?.description}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {getTabContent()?.map((item, index) => (
            <div key={index} className="bg-white rounded-xl p-6 premium-shadow hover:deep-shadow brand-transition">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-cosmic-depth/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon name={item?.icon} size={24} className="text-cosmic-depth" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold text-cosmic-depth">{item?.title}</h3>
                    {item?.status && (
                      <span className="bg-success/10 text-success px-2 py-1 rounded-full text-xs font-medium">
                        {item?.status}
                      </span>
                    )}
                    {item?.metric && (
                      <span className="bg-stellar-gold/10 text-stellar-gold px-2 py-1 rounded-full text-xs font-medium">
                        {item?.metric}
                      </span>
                    )}
                    {item?.detail && (
                      <span className="bg-cosmic-depth/10 text-cosmic-depth px-2 py-1 rounded-full text-xs font-medium">
                        {item?.detail}
                      </span>
                    )}
                    {item?.example && (
                      <span className="bg-muted text-text-charcoal px-2 py-1 rounded-full text-xs font-medium">
                        {item?.example}
                      </span>
                    )}
                  </div>
                  <p className="text-text-refined leading-relaxed">{item?.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Booking Process Flow */}
        <div className="bg-muted rounded-2xl p-8 lg:p-12 mb-16">
          <h3 className="text-3xl font-bold text-cosmic-depth text-center mb-12">Streamlined Booking Process</h3>
          
          <div className="grid lg:grid-cols-5 gap-8">
            {[
              { step: 1, title: "Service Selection", description: "Choose your PSV service type and requirements", icon: "Settings" },
              { step: 2, title: "Real-Time Check", description: "Instant availability and pricing confirmation", icon: "Search" },
              { step: 3, title: "Driver Assignment", description: "Automatic matching with qualified drivers", icon: "User" },
              { step: 4, title: "Confirmation", description: "Comprehensive booking details and timeline", icon: "CheckCircle" },
              { step: 5, title: "Service Delivery", description: "PSV execution with live tracking", icon: "Car" }
            ]?.map((step, index) => (
              <div key={index} className="text-center relative">
                {/* Step Number */}
                <div className="w-16 h-16 bg-cosmic-depth rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                  {step?.step}
                </div>
                
                {/* Icon */}
                <div className="w-12 h-12 bg-stellar-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name={step?.icon} size={24} className="text-stellar-gold" />
                </div>
                
                {/* Content */}
                <h4 className="font-semibold text-cosmic-depth mb-2">{step?.title}</h4>
                <p className="text-sm text-text-refined">{step?.description}</p>
                
                {/* Connector Line */}
                {index < 4 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-cosmic-depth/20 transform -translate-y-1/2"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Live Demo Section */}
        <div className="bg-white rounded-2xl p-8 lg:p-12 premium-shadow text-center">
          <div className="max-w-3xl mx-auto">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon name="Play" size={32} className="text-success" />
            </div>
            
            <h3 className="text-3xl font-bold text-cosmic-depth mb-4">Experience Our Booking System</h3>
            <p className="text-text-refined mb-8 leading-relaxed">
              See our real-time booking capabilities in action. From instant availability checking 
              to driver assignment and service confirmation - experience the SpaceBorne difference.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="default"
                size="lg"
                iconName="Calendar"
                iconPosition="left"
                className="bg-cosmic-depth hover:bg-cosmic-depth/90"
              >
                Start Live Booking
              </Button>
              <Button
                variant="outline"
                size="lg"
                iconName="Play"
                iconPosition="left"
                className="border-cosmic-depth text-cosmic-depth hover:bg-cosmic-depth hover:text-white"
              >
                Watch Demo
              </Button>
            </div>
            
            <div className="mt-8 flex items-center justify-center space-x-8 text-sm text-text-refined">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                <span>System Online</span>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="Clock" size={16} />
                <span>Average Response: &lt; 30 seconds</span>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="Shield" size={16} />
                <span>Secure Booking</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookingCapabilities;