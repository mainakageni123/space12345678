import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const FeaturedTrips = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All Adventures', icon: 'Globe' },
    { id: 'coastal', label: 'Coastal Routes', icon: 'Waves' },
    { id: 'mountain', label: 'Mountain Trails', icon: 'Mountain' },
    { id: 'desert', label: 'Desert Expeditions', icon: 'Sun' },
    { id: 'forest', label: 'Forest Journeys', icon: 'Trees' }
  ];

  const featuredTrips = [
    {
      id: 1,
      title: "Coastal Kenya Adventure",
      subtitle: "Mombasa to Lamu Island Journey",
      category: 'coastal',
      duration: "7 Days",
      difficulty: "Easy",
      price: { premium: 180000, regular: 120000 },
      image: "https://images.unsplash.com/photo-1589307004127-f9ea2c2acc8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      highlights: ["Beach Resort Stays", "Historical Sites", "Swahili Culture", "Marine Activities"],
      description: "Experience Kenya's stunning coastline from Mombasa through Malindi to the historic Lamu Island with luxury accommodations and cultural experiences.",
      reviews: 124,
      availability: "Available",
      bestTime: "Jan - Dec"
    },
    {
      id: 2,
      title: "Mount Kenya Circuit",
      subtitle: "Kenya's Mountain Adventure",
      category: 'mountain',
      duration: "Coming Soon",
      difficulty: "Moderate",
      price: { premium: 270000, regular: 180000 }, // Converted to KSH
      image: "https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=800&q=80",
      highlights: ["4WD Jeep Wrangler", "Mountain Lodges", "Wildlife Tours", "Photography Guide"],
      description: "Traverse the stunning Rocky Mountains with expert guides, luxury mountain lodges, and exclusive access to pristine wilderness areas.",
      reviews: 189,
      availability: "Limited",
      bestTime: "Jun - Sep"
    },
    {
      id: 3,
      title: "Desert Stargazing Expedition",
      subtitle: "Mojave\'s Celestial Wonders",
      category: 'desert',
      duration: "4 Days",
      difficulty: "Easy",
      price: { premium: 142500, regular: 97500 }, // Converted to KSH
      image: "https://images.pixabay.com/photo/2016/11/29/05/45/astronomy-1867616_1280.jpg?auto=compress&cs=tinysrgb&w=800&q=80",
      highlights: ["Tesla Model X", "Desert Glamping", "Astronomy Expert", "Telescope Access"],
      description: "Discover the magic of desert nights with world-class stargazing, luxury glamping, and expert astronomy guidance in pristine dark skies.",
      reviews: 156,
      availability: "Available",
      bestTime: "Oct - Mar"
    },
    {
      id: 4,
      title: "Redwood Forest Journey",
      subtitle: "California's Ancient Giants",
      category: 'forest',
      duration: "6 Days",
      difficulty: "Easy",
      price: { premium: 210000, regular: 142500 }, // Converted to KSH
      image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      highlights: ["Hybrid SUV", "Treehouse Lodges", "Nature Guide", "Conservation Tour"],
      description: "Journey through ancient redwood forests with eco-luxury accommodations and expert naturalist guides sharing conservation stories.",
      reviews: 203,
      availability: "Available",
      bestTime: "May - Oct"
    },
    {
      id: 5,
      title: "Grand Canyon Rim Drive",
      subtitle: "Arizona\'s Natural Wonder",
      category: 'desert',
      duration: "3 Days",
      difficulty: "Easy",
      price: { premium: 112500, regular: 75000 }, // Converted to KSH
      image: "https://images.pexels.com/photos/1562/italian-landscape-mountains-nature.jpg?auto=compress&cs=tinysrgb&w=800&q=80",
      highlights: ["Luxury SUV", "Rim Hotels", "Helicopter Tour", "Sunset Dinner"],
      description: "Experience the Grand Canyon's majesty with luxury rim accommodations, helicopter tours, and exclusive sunset dining experiences.",
      reviews: 298,
      availability: "Available",
      bestTime: "Mar - Nov"
    },
    {
      id: 6,
      title: "Blue Ridge Parkway",
      subtitle: "Appalachian Scenic Beauty",
      category: 'mountain',
      duration: "8 Days",
      difficulty: "Moderate",
      price: { premium: 240000, regular: 165000 }, // Converted to KSH
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      highlights: ["Convertible BMW", "Historic Inns", "Cultural Tours", "Local Cuisine"],
      description: "Discover Appalachian culture and natural beauty along America\'s favorite drive with historic accommodations and cultural immersion.",
      reviews: 167,
      availability: "Seasonal",
      bestTime: "Apr - Oct"
    }
  ];

  const filteredTrips = selectedCategory === 'all' 
    ? featuredTrips 
    : featuredTrips?.filter(trip => trip?.category === selectedCategory);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-50';
      case 'Moderate': return 'text-yellow-600 bg-yellow-50';
      case 'Hard': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getAvailabilityColor = (availability) => {
    switch (availability) {
      case 'Available': return 'text-green-600 bg-green-50';
      case 'Limited': return 'text-yellow-600 bg-yellow-50';
      case 'Seasonal': return 'text-blue-600 bg-blue-50';
      case 'Sold Out': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <section className="py-20 bg-surface-premium">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-2 text-stellar-gold mb-4">
            <Icon name="Compass" size={24} strokeWidth={2} />
            <span className="text-sm font-medium tracking-wide uppercase">Featured Adventures</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-cosmic-depth mb-6">
            Curated Journey Experiences
          </h2>
          <p className="text-xl text-text-refined max-w-3xl mx-auto">
            Discover handpicked adventures that combine stunning destinations, premium vehicles, 
            and exceptional service for unforgettable journeys.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories?.map((category) => (
            <button
              key={category?.id}
              onClick={() => setSelectedCategory(category?.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-full brand-transition font-medium ${
                selectedCategory === category?.id
                  ? 'bg-cosmic-depth text-white' :'bg-cosmic-silver text-cosmic-depth hover:bg-cosmic-depth hover:text-white'
              }`}
            >
              <Icon name={category?.icon} size={18} strokeWidth={2} />
              <span>{category?.label}</span>
            </button>
          ))}
        </div>

        {/* Trips Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTrips?.map((trip) => (
            <div key={trip?.id} className="group bg-white rounded-2xl premium-shadow hover:deep-shadow brand-transition overflow-hidden">
              {/* Trip Image */}
              <div className="relative h-64 overflow-hidden">
                <Image
                  src={trip?.image}
                  alt={trip?.title}
                  className="w-full h-full object-cover group-hover:scale-105 brand-transition duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                
                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col space-y-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(trip?.difficulty)}`}>
                    {trip?.difficulty}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(trip?.availability)}`}>
                    {trip?.availability}
                  </span>
                </div>

                {/* Duration */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                  <span className="text-sm font-medium text-cosmic-depth">{trip?.duration}</span>
                </div>

                {/* Rating */}
                <div className="absolute bottom-4 left-4 flex items-center space-x-1 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                  <Icon name="Star" size={14} className="text-stellar-gold fill-current" strokeWidth={0} />
                  <span className="text-sm font-medium text-cosmic-depth">{trip?.rating}</span>
                  <span className="text-xs text-text-refined">({trip?.reviews})</span>
                </div>
              </div>

              {/* Trip Content */}
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-cosmic-depth mb-2 group-hover:text-stellar-gold brand-transition">
                    {trip?.title}
                  </h3>
                  <p className="text-text-refined text-sm mb-3">{trip?.subtitle}</p>
                  <p className="text-text-refined text-sm leading-relaxed">{trip?.description}</p>
                </div>

                {/* Highlights */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-cosmic-depth mb-3">Included Highlights:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {trip?.highlights?.map((highlight, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Icon name="Check" size={14} className="text-green-500" strokeWidth={2} />
                        <span className="text-xs text-text-refined">{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pricing */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-cosmic-depth">Premium Package</span>
                    <span className="text-lg font-bold text-cosmic-depth">KSH {trip?.price?.premium?.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-refined">Regular Package</span>
                    <span className="text-sm text-text-refined">KSH {(trip?.price?.regular * 100).toLocaleString()}</span>
                  </div>
                </div>

                {/* Best Time */}
                <div className="mb-6 p-3 bg-cosmic-silver rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Icon name="Calendar" size={16} className="text-cosmic-depth" strokeWidth={2} />
                    <span className="text-sm text-cosmic-depth">
                      <span className="font-medium">Best Time:</span> {trip?.bestTime}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-3">
                  <Button
                    variant="default"
                    size="sm"
                    fullWidth
                    iconName="Calendar"
                    iconPosition="left"
                    className="bg-cosmic-depth hover:bg-cosmic-depth/90"
                  >
                    Book Now
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    iconName="Info"
                    className="border-cosmic-depth text-cosmic-depth hover:bg-cosmic-depth hover:text-white"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Button
            variant="outline"
            size="lg"
            iconName="ArrowRight"
            iconPosition="right"
            className="border-cosmic-depth text-cosmic-depth hover:bg-cosmic-depth hover:text-white"
          >
            View All Adventures
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedTrips;