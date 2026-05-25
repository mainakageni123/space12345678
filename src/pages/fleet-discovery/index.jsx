import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import FilterSidebar from './components/FilterSidebar';
import SearchBar from './components/SearchBar';
import VehicleCard from './components/VehicleCard';
import VehicleDetailModal from './components/VehicleDetailModal';
import ImageLightbox from './components/ImageLightbox';
import PricingModal from './components/PricingModal';
import { useVehicles } from '../../contexts/VehicleContext';
import { API_BASE_URL } from '../../config/api';

const FleetDiscovery = () => {
  const navigate = useNavigate();
  const { vehicles, fetchVehicles } = useVehicles();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    vehicleClass: 'all',
    priceRange: 'all'
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState('recommended');
  const [viewMode, setViewMode] = useState('grid');
  const [filteredVehicles, setFilteredVehicles] = useState([]);

  const [lightboxVehicle, setLightboxVehicle] = useState(null);
  const [lightboxImageIndex, setLightboxImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const [pricingVehicle, setPricingVehicle] = useState(null);
  const [isPricingOpen, setIsPricingOpen] = useState(false);

  // Refetch vehicles on page load to ensure fresh availability data
  useEffect(() => {
    fetchVehicles();
  }, []);

  // Filter and sort vehicles from context
  const processedVehicles = useMemo(() => {
    const API_ORIGIN = API_BASE_URL.replace(/\/api$/, '');
    console.log('Processing vehicles:', vehicles);
    
    return vehicles.map(v => {
      console.log('Processing vehicle:', v);
      const name = v?.name || '';
      const make = v?.make || '';
      const model = v?.model || '';

      // Process image URLs - images are now Cloudinary URL strings directly in vehicle.image
      // Handle both old format (Buffer objects) and new format (URL strings)
      const getImageUrl = (imageObj) => {
        if (!imageObj) return null;
        
        // If it's an object with data (old Buffer format), return null (can't display)
        if (typeof imageObj === 'object' && imageObj.data) {
          return null; // Old format - images need to be re-uploaded
        }
        
        // If it's already a URL string (new format), use it directly
        if (typeof imageObj === 'string') {
          // Cloudinary URLs are already absolute, use as-is
          if (/^https?:\/\//i.test(imageObj) || imageObj.startsWith('//') || imageObj.startsWith('blob:')) {
            return imageObj;
          }
          // Relative URLs
          if (imageObj.startsWith('/')) {
            return API_ORIGIN + imageObj;
          }
          return API_ORIGIN + '/' + imageObj;
        }
        
        return null;
      };
      
      const primaryImage = getImageUrl(v?.image || v?.imageUrl);

      return {
        id: v?._id || v?.id,
        make,
        model,
        year: v?.year,
        class: v?.type || v?.category,
        category: v?.type || v?.category,
        description: v?.description,
        pricePerDay: v?.price ?? v?.dailyRate,
        originalPrice: v?.originalPrice,
        available: v?.available ?? v?.availability ?? false,
        // Images are now URL strings directly in vehicle.images array or vehicle.image
        images: (() => {
          // First, try images array (new format - array of URL strings)
          if (v?.images && Array.isArray(v.images) && v.images.length > 0) {
            return v.images
              .map(img => getImageUrl(img))
              .filter(Boolean); // Remove nulls (old Buffer format)
          }
          if (v?.imageUrls && Array.isArray(v.imageUrls) && v.imageUrls.length > 0) {
            return v.imageUrls
              .map(img => getImageUrl(img))
              .filter(Boolean);
          }
          // Second, try single image field (new format - single URL string)
          if (primaryImage) {
            return [primaryImage];
          }
          // No images available
          return [];
        })(),
        transmission: v?.specifications?.transmission || v?.transmission,
        passengers: v?.specifications?.seats ?? v?.passengers,
        fuelType: v?.specifications?.fuelType || v?.fuelType,
        fuelEfficiency: v?.fuelEfficiency,
        rating: v?.rating,
        pricing: v?.pricing,
        specialFeatures: v?.features || v?.specialFeatures,
        location: v?.location,
        createdAt: v?.createdAt,
        isPopular: v?.isPopular,
        isNew: v?.createdAt ? (new Date(v.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) : false
      };
    });
  }, [vehicles]);

  // Filter and search logic
  useEffect(() => {
    let filtered = [...processedVehicles];

    // Apply search query
    if (searchQuery) {
      filtered = filtered?.filter(vehicle =>
        vehicle?.make?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
        vehicle?.model?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
        vehicle?.specialFeatures?.some(feature => 
          feature?.toLowerCase()?.includes(searchQuery?.toLowerCase())
        )
      );
    }

    // Apply category filter
    if (filters?.vehicleClass !== 'all') {
      filtered = filtered?.filter(vehicle => {
        const vehicleClass = vehicle?.class?.toLowerCase();
        const selectedClass = filters?.vehicleClass?.toLowerCase();
        return vehicleClass === selectedClass;
      });
    }

    // Apply price range filter
    if (filters?.priceRange !== 'all') {
      const [min, max] = filters?.priceRange?.split('-')?.map(p => 
        p?.includes('+') ? Infinity : parseInt(p)
      );
      filtered = filtered?.filter(vehicle => {
        if (max === Infinity) return vehicle?.pricePerDay >= min;
        return vehicle?.pricePerDay >= min && vehicle?.pricePerDay <= max;
      });
    }

    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        filtered?.sort((a, b) => a?.pricePerDay - b?.pricePerDay);
        break;
      case 'price-high':
        filtered?.sort((a, b) => b?.pricePerDay - a?.pricePerDay);
        break;
      case 'rating':
        filtered?.sort((a, b) => (b?.rating || 0) - (a?.rating || 0));
        break;
      case 'newest':
        filtered?.sort((a, b) => b?.year - a?.year);
        break;
      default:
        // Recommended: prioritize available, popular, new vehicles
        filtered?.sort((a, b) => {
          if (a?.available !== b?.available) return b?.available - a?.available;
          if (a?.isPopular !== b?.isPopular) return (b?.isPopular || 0) - (a?.isPopular || 0);
          if (a?.isNew !== b?.isNew) return (b?.isNew || 0) - (a?.isNew || 0);
          return (b?.rating || 0) - (a?.rating || 0);
        });
    }

    setFilteredVehicles(filtered);
  }, [processedVehicles, searchQuery, filters, sortBy]);

  const handleSearch = (searchData) => {
    setSearchQuery(searchData?.query || '');
    // Handle advanced search parameters if needed
  };

  const handleViewDetails = (vehicle) => {
    setSelectedVehicle(vehicle);
    setIsModalOpen(true);
  };

  const handleBookNow = (vehicle, selectedTier = null) => {
    navigate('/instant-booking-flow', { 
      state: { selectedVehicle: vehicle, selectedTier } 
    });
  };

  const handleClearFilters = () => {
    setFilters({
      vehicleClass: 'all',
      priceRange: 'all'
    });
    setSearchQuery('');
  };

  const sortOptions = [
    { value: 'recommended', label: 'Recommended' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'newest', label: 'Newest First' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="max-w-full mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-8">
          {/* New Header with Hamburger and Search */}
          <div className="flex items-center justify-between mb-6">
            {/* Hamburger Menu (Filter Toggle) */}
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

            {/* Search Icon */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Icon name="Search" size={24} className="text-text-charcoal" />
            </button>
          </div>

          {/* Search Bar (Collapsible) */}
          {isSearchOpen && (
            <div className="mb-6">
              <SearchBar
                onSearch={handleSearch}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filter Sidebar */}
            {isFilterOpen && (
              <div className="lg:w-80">
                <FilterSidebar
                  filters={filters}
                  onFiltersChange={setFilters}
                  onClearFilters={handleClearFilters}
                  isOpen={isFilterOpen}
                  onToggle={() => setIsFilterOpen(!isFilterOpen)}
                />
              </div>
            )}


            {/* Main Content */}
            <div className="flex-1">
              {/* Results Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-text-charcoal mb-1">
                    Available Vehicles
                  </h2>
                  <p className="text-sm text-text-refined">
                    {filteredVehicles?.length} vehicles found
                    {searchQuery && ` for "${searchQuery}"`}
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3 border-t sm:border-t-0 pt-4 sm:pt-0 border-gray-100">
                  {/* Sort Dropdown */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e?.target?.value)}
                    className="flex-1 sm:flex-none px-3 py-2 text-sm border border-border rounded-lg bg-surface-premium text-text-charcoal focus:outline-none focus:ring-2 focus:ring-cosmic-depth focus:border-transparent"
                  >
                    {sortOptions?.map((option) => (
                      <option key={option?.value} value={option?.value}>
                        {option?.label}
                      </option>
                    ))}
                  </select>

                  {/* View Mode Toggle */}
                  <div className="flex items-center space-x-1 bg-surface-premium border border-border rounded-lg p-1 flex-shrink-0">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-1.5 sm:p-2 rounded-md brand-transition ${
                        viewMode === 'grid' ?'bg-cosmic-depth text-white shadow-sm' :'text-text-refined hover:text-text-charcoal'
                      }`}
                    >
                      <Icon name="Grid3X3" size={16} />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-1.5 sm:p-2 rounded-md brand-transition ${
                        viewMode === 'list' ?'bg-cosmic-depth text-white shadow-sm' :'text-text-refined hover:text-text-charcoal'
                      }`}
                    >
                      <Icon name="List" size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Vehicle Grid/List */}
              {filteredVehicles?.length > 0 ? (
                <div className={`
                  ${viewMode === 'grid'
                    ? 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4'
                    : 'space-y-4'
                  }
                `}>
                  {filteredVehicles?.map((vehicle, idx) => (
                    <div key={vehicle?.id || idx} className="relative group h-full">
                      <VehicleCard
                        vehicle={vehicle}
                        onViewDetails={handleViewDetails}
                        onBookNow={handleBookNow}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-cosmic-silver rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon name="Search" size={32} className="text-text-refined" />
                  </div>
                  <h3 className="text-xl font-semibold text-text-charcoal mb-2">
                    No vehicles found
                  </h3>
                  <p className="text-text-refined mb-6">
                    Try adjusting your search criteria or filters to find more options.
                  </p>
                  <Button
                    variant="outline"
                    onClick={handleClearFilters}
                    iconName="RotateCcw"
                    iconPosition="left"
                  >
                    Clear All Filters
                  </Button>
                </div>
              )}

              {/* Load More Button */}
              {filteredVehicles?.length > 0 && (
                <div className="text-center mt-12">
                  <Button
                    variant="outline"
                    size="lg"
                    iconName="ChevronDown"
                    iconPosition="right"
                    className="px-8"
                  >
                    Load More Vehicles
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Vehicle Detail Modal */}
        <VehicleDetailModal
          vehicle={selectedVehicle}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onBookNow={handleBookNow}
        />

        {/* Image Lightbox */}
        <ImageLightbox
          isOpen={isLightboxOpen}
          onClose={() => setIsLightboxOpen(false)}
          images={lightboxVehicle?.images}
          initialIndex={lightboxImageIndex}
          vehicleName={lightboxVehicle ? `${lightboxVehicle.make} ${lightboxVehicle.model}` : ''}
        />

        {/* Pricing Modal */}
        <PricingModal
          isOpen={isPricingOpen}
          onClose={() => setIsPricingOpen(false)}
          vehicle={pricingVehicle}
          onBookNow={handleBookNow}
        />


      </main>
    </div>
  );
};

export default FleetDiscovery;