import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import { useVehicles } from '../../../contexts/VehicleContext';
import VehicleDetailModal from '../../fleet-discovery/components/VehicleDetailModal';

const FeaturedVehicles = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);
  const scrollContainerRef = useRef(null);
  const { vehicles } = useVehicles();
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Get the 3 most expensive vehicles that are available
  const featuredVehicles = useMemo(() => {
    console.log('Processing featured vehicles from:', vehicles);
    return vehicles
      .filter(vehicle => vehicle.available !== false) // Filter available vehicles
      .sort((a, b) => {
        // Sort by price in descending order (highest first)
        const priceA = a.price || a.pricePerDay || 0;
        const priceB = b.price || b.pricePerDay || 0;
        return priceB - priceA;
      })
      .slice(0, 3) // Take only the top 3 most expensive vehicles
      .map(vehicle => {
        const mapped = {
          id: vehicle._id || vehicle.id,
          name: vehicle.name,
          make: vehicle.make,
          model: vehicle.model,
          category: vehicle.category || vehicle.type,
          price: vehicle.pricePerDay ?? vehicle.price ?? 0,
          image: vehicle.images?.[0] || vehicle.imageUrl || vehicle.image || '/assets/images/no_image.png',
          available: vehicle.available,
          availability: vehicle.available ? "Available Now" : "Details",
          seats: vehicle.seats ?? vehicle.passengers,
          fuelType: vehicle.fuelType,
          transmission: vehicle.transmission,
        };
        console.log('Mapped featured vehicle:', mapped, 'from:', vehicle);
        return mapped;
      });
  }, [vehicles]);

  const itemsPerView = 3;
  const maxIndex = Math.max(0, featuredVehicles?.length - itemsPerView);

  const nextSlide = () => {
    setCurrentIndex(prev => Math.min(prev + 1, maxIndex));
  };

  const prevSlide = () => {
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  };

  const handleViewDetails = (vehicle) => {
    // Map the vehicle data to match what VehicleDetailModal expects
    // Find the full vehicle data from the vehicles array
    const fullVehicle = vehicles.find(v => (v._id || v.id) === vehicle.id) || vehicle;
    
    const mappedVehicle = {
      ...fullVehicle,
      pricePerDay: fullVehicle.price || fullVehicle.pricePerDay || vehicle.price,
      passengers: fullVehicle.seats || fullVehicle.passengers || vehicle.seats,
      available: fullVehicle.available,
      images: fullVehicle.images || (fullVehicle.image ? [fullVehicle.image] : [vehicle.image]),
      type: fullVehicle.type || fullVehicle.category,
      year: fullVehicle.year
    };
    
    console.log('Opening modal with vehicle:', mappedVehicle);
    setSelectedVehicle(mappedVehicle);
    setIsModalOpen(true);
  };

  const handleBookNow = (vehicle) => {
    navigate('/instant-booking-flow', { 
      state: { selectedVehicle: vehicle } 
    });
  };

  return (
    <section className="py-20 bg-surface-premium">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-12">
          <div className="mb-6 lg:mb-0">
            <h2 className="text-4xl lg:text-5xl font-bold text-cosmic-depth mb-4">
              Featured Premium Fleet
            </h2>
            <p className="text-xl text-text-refined max-w-2xl">
              Luxury vehicles with unparalleled comfort and style
            </p>
          </div>
          
          {isDesktop && (
            <div className="hidden lg:flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                iconName="ChevronLeft"
                onClick={prevSlide}
                disabled={currentIndex === 0}
                className="w-12 h-12 rounded-full border-cosmic-depth text-cosmic-depth hover:bg-cosmic-depth hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <Button
                variant="outline"
                size="sm"
                iconName="ChevronRight"
                onClick={nextSlide}
                disabled={currentIndex === maxIndex}
                className="w-12 h-12 rounded-full border-cosmic-depth text-cosmic-depth hover:bg-cosmic-depth hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          )}
        </div>

        {/* Vehicles Carousel */}
        <div className="relative overflow-x-auto lg:overflow-hidden -mx-6 lg:mx-0 snap-x snap-mandatory scroll-smooth scrollbar-hide">
          <div 
            className="flex gap-0 lg:gap-0 lg:brand-transition lg:duration-500 lg:ease-in-out pb-4 lg:pb-0 px-0"
            style={{ transform: isDesktop ? `translateX(-${currentIndex * (100 / itemsPerView)}%)` : 'none' }}
          >
            {featuredVehicles?.map((vehicle) => (
              <div
                key={vehicle?.id}
                className="w-full lg:w-80 xl:w-1/3 flex-shrink-0 px-6 lg:px-3 snap-center"
              >
                <div 
                  onClick={() => handleViewDetails(vehicle)}
                  className="bg-surface-premium rounded-xl lg:rounded-2xl overflow-hidden premium-shadow hover:deep-shadow brand-transition group cursor-pointer"
                >
                  {/* Availability Badge */}
                  <div className="absolute top-4 right-4 z-10">
                    <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                      <div className={`w-2 h-2 rounded-full ${vehicle?.availability === 'Available Now' ? 'bg-success' : 'bg-warning'}`} />
                      <span className="text-xs font-medium text-cosmic-depth">{vehicle?.availability}</span>
                    </div>
                  </div>
                  {/* Vehicle Image */}
                  <div className="relative h-48 lg:h-64 overflow-hidden">
                    <Image
                      src={vehicle?.image}
                      alt={`${vehicle?.make} ${vehicle?.model}`}
                      className="w-full h-full object-cover group-hover:scale-105 brand-transition duration-700"
                    />
                    
                    {/* Price Badge */}
                    <div className="absolute top-4 right-4">
                      <div className="bg-stellar-gold text-cosmic-depth px-3 py-1 rounded-full text-sm font-semibold">
                        KSH {vehicle?.price?.toLocaleString()}/day
                      </div>
                    </div>
                    
                    {/* Category Badge */}
                    <div className="absolute top-4 left-4">
                      <div className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                        {vehicle?.category || 'Premium'}
                      </div>
                    </div>

                    {/* Availability Status */}
                    <div className="absolute bottom-4 left-4">
                      <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                        <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                        <span className="text-xs font-medium text-cosmic-depth">{vehicle?.availability}</span>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Details */}
                  <div className="p-4 lg:p-6">
                    <div className="flex items-start justify-between mb-2 lg:mb-3">
                      <div>
                        <div className="flex items-baseline gap-1 lg:gap-2 mb-1">
                          <h3 className="text-lg lg:text-[20px] font-semibold text-[#1e2761] hover:text-adventure-orange brand-transition">
                            {vehicle?.make || vehicle?.name?.split(' ')[0]}
                          </h3>
                          <h3 className="text-lg lg:text-[20px] font-semibold text-[#1e2761] hover:text-adventure-orange brand-transition">
                            {vehicle?.model || vehicle?.name?.split(' ').slice(1).join(' ')}
                          </h3>
                        </div>
                        <p className="text-gray-600 text-xs lg:text-sm">{vehicle?.category || 'Sedan'}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-baseline gap-1 lg:gap-2">
                          <span className="text-sm lg:text-[20px] font-bold text-[#1e2761]">KSH</span>
                          <span className="text-lg lg:text-[24px] font-bold text-[#1e2761]">
                            {(vehicle?.price || 3500).toLocaleString()}
                          </span>
                        </div>
                        <span className="text-xs lg:text-sm text-gray-500">/day</span>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-1 lg:space-y-2 mb-4 lg:mb-6">
                      <div className="flex items-center space-x-2">
                        <Icon name="Users" size={12} className="text-success" strokeWidth={2} />
                        <span className="text-xs lg:text-sm text-text-refined">{typeof vehicle.seats === 'number' ? `${vehicle.seats} Seats` : 'Seats —'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Icon name="Fuel" size={12} className="text-success" strokeWidth={2} />
                        <span className="text-xs lg:text-sm text-text-refined">{vehicle.fuelType || '—'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Icon name="Settings" size={12} className="text-success" strokeWidth={2} />
                        <span className="text-xs lg:text-sm text-text-refined">{vehicle.transmission || '—'}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2 lg:space-x-3">
                      <Button
                        variant="default"
                        fullWidth
                        iconName="Calendar"
                        iconPosition="left"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/instant-booking-flow', { 
                            state: { selectedVehicle: vehicle }
                          });
                        }}
                        className="bg-cosmic-depth hover:bg-cosmic-depth/90 text-white py-2 lg:py-3 text-sm lg:text-base"
                      >
                        Book Now
                      </Button>
                      <Button
                        variant="outline"
                        size="default"
                        iconName="Heart"
                        onClick={(e) => e.stopPropagation()}
                        className="w-10 lg:w-12 border-cosmic-depth text-cosmic-depth hover:bg-cosmic-depth hover:text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* View All CTA */}
        <div className="text-center mt-12">
          <Link to="/fleet-discovery">
            <Button
              variant="outline"
              size="lg"
              iconName="ArrowRight"
              iconPosition="right"
              className="border-cosmic-depth text-cosmic-depth hover:bg-cosmic-depth hover:text-white"
            >
              View Complete Fleet
            </Button>
          </Link>
        </div>
      </div>

      {/* Vehicle Detail Modal */}
      <VehicleDetailModal
        vehicle={selectedVehicle}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onBookNow={handleBookNow}
      />
    </section>
  );
};

export default FeaturedVehicles;