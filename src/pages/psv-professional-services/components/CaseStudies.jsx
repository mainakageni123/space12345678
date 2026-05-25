import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const CaseStudies = () => {
  const caseStudies = [
    {
      id: 1,
      company: "TechCorp Global",
      industry: "Technology",
      challenge: "Annual conference transportation for 500+ attendees across multiple venues",
      solution: "Coordinated fleet of 15 vehicles with dedicated route management and real-time tracking",
      results: ["100% on-time performance", "Zero incidents", "95% satisfaction rating", "20% cost savings"],
      testimonial: "SpaceBorne's PSV service exceeded our expectations. The coordination was flawless, and our executives were impressed with the quality of service.",
      author: "Sarah Johnson",
      position: "VP of Operations",
      image: "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg",
      logo: "https://images.pexels.com/photos/3593922/pexels-photo-3593922.jpeg"
    },
    {
      id: 2,
      company: "Premier Events Ltd",
      industry: "Event Management",
      challenge: "VIP transportation for high-profile corporate gala with strict security requirements",
      solution: "Executive fleet with background-checked drivers and coordinated security protocols",
      results: ["Seamless VIP experience", "Enhanced security compliance", "Client retention increase", "Media coverage success"],
      testimonial: "The attention to detail and professionalism of SpaceBorne's team made our event a tremendous success. Our clients felt truly valued.",
      author: "Michael Chen",
      position: "Event Director",
      image: "https://images.pexels.com/photos/1002638/pexels-photo-1002638.jpeg",
      logo: "https://images.pexels.com/photos/2026324/pexels-photo-2026324.jpeg"
    },
    {
      id: 3,
      company: "Global Finance Corp",
      industry: "Financial Services",
      challenge: "Daily executive transportation with flexible scheduling and confidentiality requirements",
      solution: "Dedicated corporate contract with assigned drivers and privacy-focused service protocols",
      results: ["Improved executive productivity", "Enhanced confidentiality", "Reduced transportation costs", "Streamlined operations"],
      testimonial: "Having a reliable transportation partner like SpaceBorne has been invaluable for our executive team\'s efficiency and peace of mind.",
      author: "David Rodriguez",
      position: "Chief Administrative Officer",
      image: "https://images.pexels.com/photos/3593922/pexels-photo-3593922.jpeg",
      logo: "https://images.pexels.com/photos/1719648/pexels-photo-1719648.jpeg"
    }
  ];

  return (
    <section className="py-20 bg-surface-premium">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-cosmic-silver rounded-full px-4 py-2 mb-6">
            <Icon name="Award" size={16} className="text-cosmic-depth" />
            <span className="text-cosmic-depth font-medium text-sm">Success Stories</span>
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-bold text-cosmic-depth mb-6">
            Proven Corporate Partnerships
          </h2>
          
          <p className="text-xl text-text-refined max-w-3xl mx-auto leading-relaxed">
            Discover how leading organizations trust SpaceBorne for their critical transportation needs, 
            from executive transport to large-scale event coordination.
          </p>
        </div>

        {/* Case Studies */}
        <div className="space-y-16">
          {caseStudies?.map((study, index) => (
            <div key={study?.id} className={`grid lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''}`}>
              {/* Content */}
              <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                {/* Company Info */}
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 rounded-xl overflow-hidden premium-shadow">
                    <Image
                      src={study?.logo}
                      alt={`${study?.company} logo`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-cosmic-depth">{study?.company}</h3>
                    <p className="text-text-refined">{study?.industry}</p>
                  </div>
                </div>

                {/* Challenge */}
                <div className="mb-6">
                  <h4 className="font-semibold text-cosmic-depth mb-3 flex items-center">
                    <Icon name="AlertCircle" size={18} className="mr-2 text-warning" />
                    Challenge
                  </h4>
                  <p className="text-text-refined leading-relaxed">{study?.challenge}</p>
                </div>

                {/* Solution */}
                <div className="mb-6">
                  <h4 className="font-semibold text-cosmic-depth mb-3 flex items-center">
                    <Icon name="Lightbulb" size={18} className="mr-2 text-stellar-gold" />
                    Solution
                  </h4>
                  <p className="text-text-refined leading-relaxed">{study?.solution}</p>
                </div>

                {/* Results */}
                <div className="mb-8">
                  <h4 className="font-semibold text-cosmic-depth mb-3 flex items-center">
                    <Icon name="TrendingUp" size={18} className="mr-2 text-success" />
                    Results
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {study?.results?.map((result, resultIndex) => (
                      <div key={resultIndex} className="flex items-center space-x-2">
                        <Icon name="CheckCircle" size={16} className="text-success" />
                        <span className="text-sm text-text-refined">{result}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Testimonial */}
                <div className="bg-cosmic-silver rounded-xl p-6">
                  <div className="flex items-start space-x-3 mb-4">
                    <Icon name="Quote" size={24} className="text-cosmic-depth mt-1" />
                    <p className="text-text-charcoal italic leading-relaxed">{study?.testimonial}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-cosmic-depth rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {study?.author?.split(' ')?.map(n => n?.[0])?.join('')}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-cosmic-depth">{study?.author}</div>
                      <div className="text-sm text-text-refined">{study?.position}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Image */}
              <div className={index % 2 === 1 ? 'lg:col-start-1' : ''}>
                <div className="relative rounded-2xl overflow-hidden premium-shadow">
                  <Image
                    src={study?.image}
                    alt={`${study?.company} case study`}
                    className="w-full h-96 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  
                  {/* Success Badge */}
                  <div className="absolute top-6 left-6">
                    <div className="bg-success text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center space-x-2">
                      <Icon name="CheckCircle" size={16} />
                      <span>Success Story</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 text-center">
          <div className="bg-cosmic-depth rounded-2xl p-8 lg:p-12 text-white">
            <h3 className="text-2xl lg:text-3xl font-bold mb-4">
              Ready to Join Our Success Stories?
            </h3>
            <p className="text-gray-200 mb-8 max-w-2xl mx-auto">
              Let's discuss how SpaceBorne can become your trusted transportation partner and help 
              achieve your corporate mobility objectives with our proven PSV solutions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-stellar-gold hover:bg-stellar-gold/90 text-cosmic-depth px-8 py-3 rounded-xl font-semibold brand-transition flex items-center justify-center space-x-2">
                <Icon name="Calendar" size={18} />
                <span>Schedule Consultation</span>
              </button>
              <button className="border-2 border-white text-white hover:bg-white hover:text-cosmic-depth px-8 py-3 rounded-xl font-semibold brand-transition flex items-center justify-center space-x-2">
                <Icon name="Download" size={18} />
                <span>Download Case Studies</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CaseStudies;