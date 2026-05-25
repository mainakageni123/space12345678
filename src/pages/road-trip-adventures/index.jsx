import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import HeroSection from './components/HeroSection';
import Footer from '../../components/Footer';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import AdventureCard from './components/AdventureCard';
import AdventureFilterSidebar from './components/AdventureFilterSidebar';
import AdventureDetailModal from './components/AdventureDetailModal';
import SearchBar from '../fleet-discovery/components/SearchBar';
import ImageLightbox from '../fleet-discovery/components/ImageLightbox';
import { API_BASE_URL } from '../../config/api';
import { getTripType } from '../../utils/adventureTripType';

const RoadTripAdventures = () => {
  const navigate = useNavigate();
  const [adventures, setAdventures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('recommended');
  const [viewMode, setViewMode] = useState('grid');
  const [filters, setFilters] = useState({
    tripType: 'all',
    priceRange: 'all'
  });
  const [selectedAdventure, setSelectedAdventure] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lightboxAdventure, setLightboxAdventure] = useState(null);
  const [lightboxImageIndex, setLightboxImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    fetchAdventures();
  }, []);

  const fetchAdventures = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/adventures`);
      if (response.ok) {
        const data = await response.json();
        const adventuresList = data?.adventures || data || [];
        setAdventures(adventuresList);
      } else {
        setAdventures([]);
      }
    } catch (error) {
      console.error('Error fetching adventures:', error);
      setAdventures([]);
    } finally {
      setLoading(false);
    }
  };

  const getAdventureImages = (adventure) => {
    if (adventure?.images?.length > 0) {
      return adventure.images.filter(Boolean);
    }
    if (adventure?.image) {
      return [adventure.image];
    }
    return [];
  };

  // Filter and sort adventures
  const filteredAdventures = (() => {
    let filtered = [...adventures];

    if (searchQuery) {
      filtered = filtered.filter(adv =>
        adv?.title?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
        adv?.location?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
        getTripType(adv)?.toLowerCase()?.includes(searchQuery.toLowerCase())
      );
    }

    if (filters?.tripType !== 'all') {
      filtered = filtered.filter(adv =>
        getTripType(adv)?.toLowerCase() === filters.tripType.toLowerCase()
      );
    }

    if (filters?.priceRange !== 'all') {
      const [min, max] = filters.priceRange.split('-').map(p =>
        p?.includes('+') ? Infinity : parseInt(p, 10)
      );
      filtered = filtered.filter(adv => {
        const price = adv?.price || 0;
        if (max === Infinity) return price >= min;
        return price >= min && price <= max;
      });
    }

    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => (a?.price || 0) - (b?.price || 0));
        break;
      case 'price-high':
        filtered.sort((a, b) => (b?.price || 0) - (a?.price || 0));
        break;
      case 'seats':
        filtered.sort((a, b) => (b?.availableSeats || 0) - (a?.availableSeats || 0));
        break;
      default:
        filtered.sort((a, b) => {
          if ((a?.availableSeats > 0) !== (b?.availableSeats > 0)) {
            return (b?.availableSeats > 0 ? 1 : 0) - (a?.availableSeats > 0 ? 1 : 0);
          }
          return (b?.availableSeats || 0) - (a?.availableSeats || 0);
        });
    }

    return filtered;
  })();

  const handleSearch = (searchData) => {
    setSearchQuery(searchData?.query || '');
  };

  const handleViewDetails = (adventure) => {
    setSelectedAdventure(adventure);
    setIsModalOpen(true);
  };

  const handleReserveNow = (adventure) => {
    if (adventure.availableSeats === 0) {
      alert('Sorry, this adventure is fully booked. Please choose another adventure.');
      return;
    }
    
    navigate('/instant-booking-flow', {
      state: {
        selectedAdventure: {
          id: adventure._id,
          title: adventure.title,
          location: adventure.location,
          price: adventure.price,
          duration: adventure.duration,
          tripType: getTripType(adventure),
          maxParticipants: adventure.maxParticipants,
          availableSeats: adventure.availableSeats,
          bookedSeats: adventure.bookedSeats,
          type: 'adventure'
        }
      }
    });
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setFilters({ tripType: 'all', priceRange: 'all' });
    setSortBy('recommended');
  };

  const sortOptions = [
    { value: 'recommended', label: 'Recommended' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'seats', label: 'Most Available' }
  ];

  const hasActiveFilters = searchQuery || filters.tripType !== 'all' || filters.priceRange !== 'all';

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        
        <section id="available-adventures" className="bg-background pt-16">
          <div className="max-w-full mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-8">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-6 h-6 flex flex-col justify-center space-y-1">
                  <div className="w-full h-0.5 bg-text-charcoal"></div>
                  <div className="w-full h-0.5 bg-text-charcoal"></div>
                  <div className="w-full h-0.5 bg-text-charcoal"></div>
                </div>
              </button>

              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Icon name="Search" size={24} className="text-text-charcoal" />
              </button>
            </div>

            {isSearchOpen && (
              <div className="mb-6">
                <SearchBar
                  onSearch={handleSearch}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  placeholder="Search by trip name, location, or trip type..."
                />
              </div>
            )}

            <div className="flex flex-col lg:flex-row gap-8">
              {isFilterOpen && (
                <div className="lg:w-80">
                  <AdventureFilterSidebar
                    filters={filters}
                    onFiltersChange={setFilters}
                    onClearFilters={handleClearFilters}
                    onToggle={() => setIsFilterOpen(!isFilterOpen)}
                  />
                </div>
              )}

              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold text-text-charcoal mb-1">
                      Available Trips & Tours
                    </h2>
                    <p className="text-sm text-text-refined">
                      {filteredAdventures.length} trips found
                      {searchQuery && ` for "${searchQuery}"`}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3 border-t sm:border-t-0 pt-4 sm:pt-0 border-gray-100">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="flex-1 sm:flex-none px-3 py-2 text-sm border border-border rounded-lg bg-surface-premium text-text-charcoal focus:outline-none focus:ring-2 focus:ring-cosmic-depth focus:border-transparent"
                    >
                      {sortOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>

                    <div className="flex items-center space-x-1 bg-surface-premium border border-border rounded-lg p-1 flex-shrink-0">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-1.5 sm:p-2 rounded-md brand-transition ${
                          viewMode === 'grid' ? 'bg-cosmic-depth text-white shadow-sm' : 'text-text-refined hover:text-text-charcoal'
                        }`}
                      >
                        <Icon name="Grid3X3" size={16} />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-1.5 sm:p-2 rounded-md brand-transition ${
                          viewMode === 'list' ? 'bg-cosmic-depth text-white shadow-sm' : 'text-text-refined hover:text-text-charcoal'
                        }`}
                      >
                        <Icon name="List" size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-16">
                    <div className="flex items-center justify-center">
                      <Icon name="Loader2" size={32} className="animate-spin text-cosmic-depth mr-3" />
                      <span className="text-lg text-gray-600">Loading trips & tours...</span>
                    </div>
                  </div>
                ) : filteredAdventures.length > 0 ? (
                  <div className={`
                    ${viewMode === 'grid'
                      ? 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4'
                      : 'space-y-4'
                    }
                  `}>
                    {filteredAdventures.map((adventure, idx) => (
                      <div key={adventure._id || adventure.id || idx} className="relative group h-full">
                        <AdventureCard
                          adventure={adventure}
                          onViewDetails={handleViewDetails}
                          onBookNow={handleReserveNow}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-cosmic-silver rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon name="MapPin" size={32} className="text-text-refined" />
                    </div>
                    <h3 className="text-xl font-semibold text-text-charcoal mb-2">
                      No trips found
                    </h3>
                    <p className="text-text-refined mb-6">
                      {hasActiveFilters
                        ? 'Try adjusting your search criteria or filters to find more options.'
                        : "We're currently curating amazing trips & tours for you. Check back soon!"}
                    </p>
                    {hasActiveFilters ? (
                      <Button
                        variant="outline"
                        onClick={handleClearFilters}
                        iconName="RotateCcw"
                        iconPosition="left"
                      >
                        Clear All Filters
                      </Button>
                    ) : (
                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a 
                          href="/fleet-discovery" 
                          className="inline-flex items-center justify-center px-6 py-3 bg-cosmic-depth text-white rounded-lg hover:bg-cosmic-depth/90 transition-colors"
                        >
                          <Icon name="Car" size={20} className="mr-2" />
                          Explore Our Fleet
                        </a>
                        <a 
                          href="/psv-professional-services" 
                          className="inline-flex items-center justify-center px-6 py-3 border border-cosmic-depth text-cosmic-depth rounded-lg hover:bg-cosmic-depth hover:text-white transition-colors"
                        >
                          <Icon name="Briefcase" size={20} className="mr-2" />
                          PSV Services
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {filteredAdventures.length > 0 && (
                  <div className="text-center mt-12">
                    <Button
                      variant="outline"
                      size="lg"
                      iconName="ChevronDown"
                      iconPosition="right"
                      className="px-8"
                    >
                      Load More Trips
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <AdventureDetailModal
        adventure={selectedAdventure}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onBookNow={handleReserveNow}
      />

      <ImageLightbox
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        images={lightboxAdventure?.images}
        initialIndex={lightboxImageIndex}
        vehicleName={lightboxAdventure?.title || ''}
      />

      <Footer />
    </div>
  );
};

export default RoadTripAdventures;
