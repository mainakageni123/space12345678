import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import { useVehicles } from '../../../contexts/VehicleContext';

const FleetShowcase = () => {
  const navigate = useNavigate();
  const { vehicles: contextVehicles, setSelectedVehicle } = useVehicles();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleViewDetails = (vehicle) => {
    setSelectedVehicle(vehicle);
    // Could also open a modal or navigate to details page
  };

  const handleBookNow = (vehicle) => {
    navigate('/instant-booking-flow', { state: { selectedVehicle: vehicle } });
  };

  useEffect(() => {
    const filterAndSortVehicles = () => {
      try {
        setLoading(true);
        // Filter for luxury vehicles and SUVs only
        const filtered = contextVehicles.filter(vehicle => {
          const category = (vehicle.category || '').toLowerCase();
          return category.includes('luxury') || category.includes('suv');
        });
        // Sort by price descending and take top 3
        const sorted = filtered.sort((a, b) => (b.price || 0) - (a.price || 0)).slice(0, 3);
        setVehicles(sorted);
      } catch (error) {
        console.error('Error processing vehicles:', error);
      } finally {
        setLoading(false);
      }
    };

    filterAndSortVehicles();
  }, [contextVehicles]);

  return (
    <section className="py-12 bg-gradient-to-b from-surface-premium/60 to-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-4xl lg:text-5xl font-bold text-cosmic-depth mb-2 tracking-tight">Luxury Vehicles</h2>
          <p className="text-lg text-text-refined max-w-2xl mx-auto mb-4 leading-relaxed">
            Luxury vehicles and SUVs, fully insured and driven by licensed PSV drivers
          </p>
        </div>
        
        {/* Fleet-style Horizontal Scroll / Grid */}
        <div className="relative overflow-x-auto lg:overflow-hidden -mx-6 lg:mx-0 snap-x snap-mandatory scroll-smooth scrollbar-hide">
          <div className="flex gap-0 lg:gap-0 pb-4 lg:pb-0 px-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {loading ? (
              <div className="col-span-full text-center py-8 w-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cosmic-depth mx-auto mb-4"></div>
                <p className="text-text-refined">Loading luxury vehicles...</p>
              </div>
            ) : vehicles?.length > 0 ? (
              vehicles.map((vehicle) => {
                const mappedVehicle = {
                  id: vehicle._id || vehicle.id,
                  make: vehicle.make,
                  model: vehicle.model,
                  category: vehicle.category || vehicle.type || 'Luxury',
                  price: vehicle.price || vehicle.pricePerDay || 0,
                  image: vehicle.images?.[0] || vehicle.imageUrl || vehicle.image || '/assets/images/no_image.png',
                  available: vehicle.available !== false,
                  seats: vehicle.specifications?.seats || vehicle.passengers || '—',
                  fuelType: vehicle.specifications?.fuelType || vehicle.fuelType || '—',
                  transmission: vehicle.specifications?.transmission || vehicle.transmission || '—',
                };

                return (
                  <div key={mappedVehicle.id} className="w-full sm:w-auto flex-shrink-0 px-6 lg:px-0 snap-center">
                    <div 
                      onClick={() => handleViewDetails(vehicle)}
                      className="bg-surface-premium rounded-xl lg:rounded-2xl overflow-hidden premium-shadow hover:deep-shadow brand-transition group cursor-pointer h-full"
                    >
                      {/* Availability Badge */}
                      <div className="absolute top-4 right-4 z-10">
                        <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                          <div className={`w-2 h-2 rounded-full ${mappedVehicle.available ? 'bg-success' : 'bg-warning'}`} />
                          <span className="text-xs font-medium text-cosmic-depth">{mappedVehicle.available ? 'Available Now' : 'Details'}</span>
                        </div>
                      </div>

                      {/* Vehicle Image */}
                      <div className="relative h-48 lg:h-64 overflow-hidden">
                        <Image
                          src={mappedVehicle.image}
                          alt={`${mappedVehicle.make} ${mappedVehicle.model}`}
                          className="w-full h-full object-cover group-hover:scale-105 brand-transition duration-700"
                        />
                        
                        {/* Price Badge */}
                        <div className="absolute top-4 right-4">
                          <div className="bg-stellar-gold text-cosmic-depth px-3 py-1 rounded-full text-sm font-semibold">
                            KSH {mappedVehicle.price?.toLocaleString()}/day
                          </div>
                        </div>
                        
                        {/* Category Badge */}
                        <div className="absolute top-4 left-4">
                          <div className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                            {mappedVehicle.category}
                          </div>
                        </div>
                      </div>

                      {/* Vehicle Details */}
                      <div className="p-4 lg:p-5">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-baseline gap-1 lg:gap-2 mb-1">
                              <h3 className="text-lg font-semibold text-[#1e2761] hover:text-adventure-orange brand-transition">
                                {mappedVehicle.make}
                              </h3>
                              <h3 className="text-lg font-semibold text-[#1e2761] hover:text-adventure-orange brand-transition">
                                {mappedVehicle.model}
                              </h3>
                            </div>
                            <p className="text-gray-600 text-xs">{mappedVehicle.category}</p>
                          </div>
                        </div>

                        {/* Features */}
                        <div className="grid grid-cols-3 gap-2 mb-4">
                          <div className="flex items-center space-x-1">
                            <Icon name="Users" size={12} className="text-success" strokeWidth={2} />
                            <span className="text-[10px] text-text-refined">{mappedVehicle.seats} Seats</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Icon name="Fuel" size={12} className="text-success" strokeWidth={2} />
                            <span className="text-[10px] text-text-refined capitalize">{mappedVehicle.fuelType}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Icon name="Settings" size={12} className="text-success" strokeWidth={2} />
                            <span className="text-[10px] text-text-refined capitalize">{mappedVehicle.transmission}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex space-x-2">
                          <Button
                            variant="default"
                            fullWidth
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBookNow(vehicle);
                            }}
                            className="bg-cosmic-depth hover:bg-cosmic-depth/90 text-white text-xs py-2"
                          >
                            Book Now
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            iconName="Heart"
                            onClick={(e) => e.stopPropagation()}
                            className="w-10 border-cosmic-depth text-cosmic-depth hover:bg-cosmic-depth hover:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full text-center py-8 w-full">
                <Icon name="Car" size={48} className="text-cosmic-silver mx-auto mb-4" />
                <p className="text-text-refined">No luxury vehicles available at the moment.</p>
              </div>
            )}
          </div>
        </div>
        
      </div>
    </section>
  );
};

export default FleetShowcase;