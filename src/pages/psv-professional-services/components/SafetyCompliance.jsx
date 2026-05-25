import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const SafetyCompliance = () => {
  const safetyFeatures = [
    {
      icon: "Shield",
      title: "Driver Background Checks",
      description: "Comprehensive background verification including criminal history, driving records, and industry references for all PSV drivers."
    },
    {
      icon: "Wrench",
      title: "Vehicle Maintenance",
      description: "Rigorous maintenance schedules with certified mechanics, regular safety inspections, and real-time vehicle monitoring systems."
    },
    {
      icon: "FileCheck",
      title: "Insurance Coverage",
      description: "Comprehensive commercial insurance covering passengers, vehicles, and third-party liability with additional coverage options."
    },
    {
      icon: "Award",
      title: "NTSA Certification",
      description: "All vehicles meet NTSA standards and regulations with current certifications, safety equipment, and compliance documentation."
    },
    {
      icon: "Clock",
      title: "Driver Hours Monitoring",
      description: "Electronic logging systems ensure driver compliance with hours of service regulations and mandatory rest periods."
    },
    {
      icon: "MapPin",
      title: "GPS Tracking",
      description: "Real-time vehicle tracking with route optimization, emergency response capabilities, and passenger safety monitoring."
    }
  ];

  const certifications = [
    {
      name: "DOT Compliance",
      description: "Department of Transportation certified",
      icon: "CheckCircle",
      status: "Active"
    },
    {
      name: "PSV License",
      description: "Public Service Vehicle operating license",
      icon: "CheckCircle",
      status: "Active"
    },
    {
      name: "Commercial Insurance",
      description: "KSH 50M liability coverage",
      icon: "CheckCircle",
      status: "Active"
    },
    {
      name: "Safety Certification",
      description: "Annual safety compliance audit",
      icon: "CheckCircle",
      status: "Active"
    },
    {
      name: "Driver Training",
      description: "PSV chauffeur certification",
      icon: "CheckCircle",
      status: "Active"
    },
    {
      name: "Emergency Response",
      description: "24/7 emergency support system",
      icon: "CheckCircle",
      status: "Active"
    }
  ];

  const complianceStats = [
    { label: "Safety Rating", value: "5-Star", icon: "Star" },
    { label: "Incident Rate", value: "0.01%", icon: "TrendingDown" },
    { label: "Driver Retention", value: "95%", icon: "Users" },
    { label: "Compliance Score", value: "100%", icon: "Award" }
  ];

  return (
    <section className="py-20 bg-surface-premium">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-success/10 rounded-full px-4 py-2 mb-6">
            <Icon name="Shield" size={16} className="text-success" />
            <span className="text-success font-medium text-sm">Safety & Compliance</span>
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-bold text-cosmic-depth mb-6">
            Uncompromising Safety Standards
          </h2>
          
          <p className="text-xl text-text-refined max-w-3xl mx-auto leading-relaxed">
            Your safety is our top priority. Every aspect of our PSV service is designed around 
            rigorous safety protocols, comprehensive insurance coverage, and regulatory compliance.
          </p>
        </div>

        {/* Safety Features Grid - Fleet Style */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 mb-16">
          {safetyFeatures?.map((feature, index) => (
            <div key={index} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 group">
              {/* Icon Header */}
              <div className="relative h-32 bg-gradient-to-br from-success/10 to-success/5 flex items-center justify-center">
                <div className="w-12 h-12 bg-success/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Icon name={feature?.icon} size={24} className="text-success" />
                </div>
                
                {/* Status Badge */}
                <div className="absolute top-2 right-2">
                  <div className="w-3 h-3 bg-success rounded-full"></div>
                </div>
              </div>

              {/* Content */}
              <div className="p-3">
                <h3 className="text-sm font-bold text-cosmic-depth mb-2 line-clamp-1">{feature?.title}</h3>
                <p className="text-xs text-text-refined line-clamp-2 mb-3">{feature?.description}</p>
                
                {/* Action */}
                <div className="flex items-center justify-center">
                  <span className="text-xs text-success font-medium bg-success/10 px-2 py-1 rounded">
                    Certified
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Emergency Response - Fleet Style */}
        <div className="mb-8">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-cosmic-depth mb-4">24/7 Emergency Response</h3>
            <p className="text-text-refined leading-relaxed max-w-2xl mx-auto">
              Our dedicated emergency response team is available around the clock to handle any situation.
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 group">
              {/* Icon Header */}
              <div className="relative h-32 bg-gradient-to-br from-error/10 to-error/5 flex items-center justify-center">
                <div className="w-12 h-12 bg-error/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Icon name="Phone" size={24} className="text-error" />
                </div>
                
                {/* Status Badge */}
                <div className="absolute top-2 right-2">
                  <div className="w-3 h-3 bg-error rounded-full animate-pulse"></div>
                </div>
              </div>

              {/* Content */}
              <div className="p-3">
                <h4 className="text-sm font-bold text-cosmic-depth mb-2 line-clamp-1">Emergency Hotline</h4>
                <p className="text-xs text-text-refined line-clamp-2 mb-3">24/7 emergency support line</p>
                
                {/* Action */}
                <div className="flex items-center justify-center">
                  <span className="text-xs text-error font-medium bg-error/10 px-2 py-1 rounded">
                    Active
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 group">
              {/* Icon Header */}
              <div className="relative h-32 bg-gradient-to-br from-error/10 to-error/5 flex items-center justify-center">
                <div className="w-12 h-12 bg-error/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Icon name="MapPin" size={24} className="text-error" />
                </div>
                
                {/* Status Badge */}
                <div className="absolute top-2 right-2">
                  <div className="w-3 h-3 bg-error rounded-full animate-pulse"></div>
                </div>
              </div>

              {/* Content */}
              <div className="p-3">
                <h4 className="text-sm font-bold text-cosmic-depth mb-2 line-clamp-1">GPS Tracking</h4>
                <p className="text-xs text-text-refined line-clamp-2 mb-3">Real-time location monitoring</p>
                
                {/* Action */}
                <div className="flex items-center justify-center">
                  <span className="text-xs text-error font-medium bg-error/10 px-2 py-1 rounded">
                    Active
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 group">
              {/* Icon Header */}
              <div className="relative h-32 bg-gradient-to-br from-error/10 to-error/5 flex items-center justify-center">
                <div className="w-12 h-12 bg-error/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Icon name="Car" size={24} className="text-error" />
                </div>
                
                {/* Status Badge */}
                <div className="absolute top-2 right-2">
                  <div className="w-3 h-3 bg-error rounded-full animate-pulse"></div>
                </div>
              </div>

              {/* Content */}
              <div className="p-3">
                <h4 className="text-sm font-bold text-cosmic-depth mb-2 line-clamp-1">Backup Vehicles</h4>
                <p className="text-xs text-text-refined line-clamp-2 mb-3">Immediate replacement service</p>
                
                {/* Action */}
                <div className="flex items-center justify-center">
                  <span className="text-xs text-error font-medium bg-error/10 px-2 py-1 rounded">
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SafetyCompliance;