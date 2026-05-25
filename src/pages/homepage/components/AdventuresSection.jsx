import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const AdventuresSection = () => {
  const [selectedAdventure, setSelectedAdventure] = useState(0);

  const adventures = [
    {
      id: 1,
      title: "Coastal Kenya Adventure",
      destination: "Mombasa & Lamu, Kenya",
      duration: "5 Days",
      image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      price: "KSH 180,000",
      difficulty: "Easy",
      groupSize: "4-8 People",
      highlights: ["Diani Beach", "Fort Jesus", "Lamu Old Town", "Luxury Beach Resorts"],
      availableSpots: "8",
      nextDeparture: "2025-12-15",
      rating: 5.0,
      reviews: 42,
      badge: "Most Popular",
      description: "Experience the stunning Kenyan coast with pristine beaches, rich Swahili culture, and luxurious beachfront accommodations."
    },
    {
      id: 2,
      title: "Mount Kenya Safari Circuit",
      destination: "Central Kenya",
      duration: "7 Days",
      image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      price: "KSH 220,000",
      difficulty: "Moderate",
      groupSize: "6-12 People",
      highlights: ["Mount Kenya", "Ol Pejeta Conservancy", "Aberdare National Park", "Luxury Lodges"],
      availableSpots: "6",
      nextDeparture: "2025-11-20",
      rating: 5.0,
      reviews: 89,
      badge: "Adventure",
      description: "Discover the majestic Rocky Mountains with scenic drives through national parks, luxury mountain lodges, and unforgettable alpine experiences."
    },
    {
      id: 3,
      title: "Southern Charm Route",
      destination: "Georgia & South Carolina",
      duration: "6 Days",
      image: "https://images.pixabay.com/photo/2016/11/29/05/45/architecture-1867187_1280.jpg?auto=compress&cs=tinysrgb&w=1200&q=80",
      price: 2199,
      difficulty: "Easy",
      groupSize: "4-10 People",
      highlights: ["Savannah Historic District", "Charleston", "Blue Ridge Mountains", "Plantation Tours"],
      availableSpots: 2,
      nextDeparture: "2025-10-08",
      rating: 4.7,
      reviews: 134,
      badge: "Cultural",
      description: "Immerse yourself in Southern hospitality and history with guided tours through historic cities, antebellum architecture, and authentic cuisine experiences."
    }
  ];

  const getBadgeColor = (badge) => {
    switch (badge) {
      case 'Most Popular': return 'bg-stellar-gold text-cosmic-depth';
      case 'Adventure': return 'bg-adventure-orange text-white';
      case 'Cultural': return 'bg-deep-space text-white';
      default: return 'bg-muted text-text-charcoal';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'text-success';
      case 'Moderate': return 'text-warning';
      case 'Challenging': return 'text-error';
      default: return 'text-text-refined';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <section className="py-20 bg-gradient-to-br from-cosmic-silver to-surface-premium">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-cosmic-depth mb-6">
            Trips & Tours
          </h2>
          <p className="text-xl text-text-refined max-w-3xl mx-auto leading-relaxed">
            Join our expertly curated trips & tours to the most breathtaking destinations. 
            Every journey is crafted for unforgettable memories and extraordinary discoveries.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Adventure Selector */}
          <div className="space-y-6">
            {adventures?.map((adventure, index) => (
              <div
                key={adventure?.id}
                className={`p-6 rounded-2xl cursor-pointer brand-transition ${
                  selectedAdventure === index
                    ? 'bg-surface-premium premium-shadow border-2 border-stellar-gold'
                    : 'bg-surface-premium/50 hover:bg-surface-premium hover:premium-shadow'
                }`}
                onClick={() => setSelectedAdventure(index)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className={`text-xl font-bold brand-transition ${
                        selectedAdventure === index ? 'text-cosmic-depth' : 'text-text-charcoal'
                      }`}>
                        {adventure?.title}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getBadgeColor(adventure?.badge)}`}>
                        {adventure?.badge}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-text-refined mb-3">
                      <div className="flex items-center space-x-1">
                        <Icon name="MapPin" size={14} />
                        <span>{adventure?.destination}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Icon name="Clock" size={14} />
                        <span>{adventure?.duration}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Icon name="Users" size={14} />
                        <span>{adventure?.groupSize}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-cosmic-depth">{adventure?.price}</div>
                    <div className="text-xs text-text-refined">per person</div>
                  </div>
                </div>

                {/* Quick Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Icon name="Star" size={14} color="#ffc107" />
                      <span className="text-sm font-medium">{adventure?.rating}</span>
                      <span className="text-sm text-text-refined">({adventure?.reviews})</span>
                    </div>
                    <div className={`text-sm font-medium ${getDifficultyColor(adventure?.difficulty)}`}>
                      {adventure?.difficulty}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                    <span className="text-sm text-success font-medium">
                      {adventure?.availableSpots} spots left
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Selected Adventure Details */}
          <div className="bg-surface-premium rounded-2xl overflow-hidden premium-shadow">
            <div className="relative h-80">
              <Image
                src={adventures?.[selectedAdventure]?.image}
                alt={adventures?.[selectedAdventure]?.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              {/* Overlay Content */}
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <h3 className="text-2xl font-bold mb-2">
                  {adventures?.[selectedAdventure]?.title}
                </h3>
                <p className="text-sm opacity-90 mb-4">
                  Next departure: {formatDate(adventures?.[selectedAdventure]?.nextDeparture)}
                </p>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Icon name="Calendar" size={16} />
                    <span className="text-sm">{adventures?.[selectedAdventure]?.duration}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Icon name="Users" size={16} />
                    <span className="text-sm">{adventures?.[selectedAdventure]?.groupSize}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Icon name="Award" size={16} />
                    <span className="text-sm">{adventures?.[selectedAdventure]?.difficulty}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6">
              <p className="text-text-refined mb-6 leading-relaxed">
                {adventures?.[selectedAdventure]?.description}
              </p>

              {/* Highlights */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-cosmic-depth mb-3">Trip Highlights</h4>
                <div className="grid grid-cols-2 gap-2">
                  {adventures?.[selectedAdventure]?.highlights?.map((highlight, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Icon name="MapPin" size={14} color="var(--color-stellar-gold)" />
                      <span className="text-sm text-text-refined">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <Link to="/road-trip-adventures" className="flex-1">
                  <Button
                    variant="default"
                    fullWidth
                    iconName="Calendar"
                    iconPosition="left"
                    className="bg-adventure-orange hover:bg-adventure-orange/90 text-white"
                  >
                    View Tours
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  iconName="Info"
                  className="border-cosmic-depth text-cosmic-depth hover:bg-cosmic-depth hover:text-white"
                >
                  Details
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* End of Adventures Grid */}
        <div className="text-center mt-8">
          <Link to="/road-trip-adventures">
            <Button
              variant="outline"
              iconName="ArrowRight"
              iconPosition="right"
              className="border-cosmic-depth text-cosmic-depth hover:bg-cosmic-depth hover:text-white"
            >
              View All Trips & Tours
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default AdventuresSection;