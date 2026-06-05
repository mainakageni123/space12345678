import React, { useState, useEffect, useMemo } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const VehicleDetailModal = ({ vehicle, isOpen, onClose, onBookNow }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedTier, setSelectedTier] = useState(null);

  const vehicleImages = useMemo(() => {
    const list = [];
    const add = (src) => {
      if (src && typeof src === 'string' && !list.includes(src)) list.push(src);
    };
    if (Array.isArray(vehicle?.images)) vehicle.images.forEach(add);
    add(vehicle?.imageUrl);
    add(vehicle?.image);
    return list.length > 0 ? list : ['/assets/images/no_image.png'];
  }, [vehicle]);

  const dailyPrice = useMemo(() => {
    return Number(vehicle?.pricing?.daily || vehicle?.pricePerDay || vehicle?.price || 0);
  }, [vehicle]);

  const isBelow4500 = dailyPrice < 4500;

  const pricingTiers = useMemo(() => {
    if (!vehicle?.pricing) return [];
    return [
      { id: 'hourly1', label: '1 Hour', value: vehicle.pricing.hourly1, duration: '1 Hour' },
      { id: 'hourly3', label: '3 Hours', value: vehicle.pricing.hourly3, duration: '3 Hours' },
      { id: 'hourly6', label: '6 Hours', value: vehicle.pricing.hourly6, duration: '6 Hours' },
      { id: 'hourly12', label: '12 Hours', value: vehicle.pricing.hourly12, duration: '12 Hours' },
      { id: 'daily', label: '24 Hours / Daily', value: vehicle.pricing.daily || vehicle.pricePerDay, duration: '24 Hours' },
      { id: 'daily2', label: '48 Hours (2 Days)', value: vehicle.pricing.daily2, duration: '48 Hours' },
      { id: 'daily3', label: '72 Hours (3 Days)', value: vehicle.pricing.daily3, duration: '72 Hours' }
    ].filter((tier) => tier.value !== undefined && tier.value !== null && tier.value !== '');
  }, [vehicle]);

  const footerPricing = useMemo(() => {
    if (selectedTier?.value != null) {
      return {
        amount: Number(selectedTier.value),
        label: selectedTier.label
      };
    }
    if (isBelow4500) {
      return {
        amount: null,
        label: 'Daily 24h booking not allowed'
      };
    }
    const daily = pricingTiers.find((t) => t.id === 'daily');
    if (daily) {
      return { amount: Number(daily.value), label: daily.label };
    }
    const fallback = vehicle?.pricePerDay ?? vehicle?.price;
    return {
      amount: fallback != null ? Number(fallback) : null,
      label: 'Per day'
    };
  }, [selectedTier, pricingTiers, vehicle, isBelow4500]);

  useEffect(() => {
    setCurrentImageIndex(0);
    setSelectedTier(null);
  }, [vehicle?.id, isOpen]);

  if (!isOpen || !vehicle) return null;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'Info' },
    { id: 'specifications', label: 'Specifications', icon: 'Settings' }
  ];

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === vehicleImages.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? vehicleImages.length - 1 : prev - 1
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto overscroll-y-contain bg-black/50 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div className="flex min-h-full items-end sm:items-center justify-center sm:p-4">
        <div
          className="bg-surface-premium w-full sm:rounded-xl deep-shadow sm:max-w-4xl flex flex-col max-h-[100dvh] sm:max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
        >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border shrink-0 sticky top-0 bg-surface-premium z-10">
          <div>
            <h2 className="text-2xl font-bold text-text-charcoal">
              {vehicle?.make} {vehicle?.model}
            </h2>
            <p className="text-text-refined">{vehicle?.year} • {vehicle?.class}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            iconName="X"
            onClick={onClose}
            className="text-text-refined hover:text-text-charcoal"
          />
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain">
        <div className="flex flex-col lg:flex-row lg:min-h-0">
          {/* Image Gallery */}
          <div className="lg:w-1/2 relative shrink-0">
            <div className="relative h-44 sm:h-56 lg:h-72">
              <Image
                src={vehicleImages[currentImageIndex]}
                alt={`${vehicle?.make} ${vehicle?.model}`}
                className="w-full h-full object-cover"
              />
              
              {vehicleImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white brand-transition"
                  >
                    <Icon name="ChevronLeft" size={20} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white brand-transition"
                  >
                    <Icon name="ChevronRight" size={20} />
                  </button>
                </>
              )}

              {/* Image Counter */}
              <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                {currentImageIndex + 1} / {vehicleImages.length}
              </div>
            </div>

            {/* Thumbnail strip + dots */}
            {vehicleImages.length > 1 && (
              <div className="absolute bottom-14 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 lg:hidden">
                {vehicleImages.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setCurrentImageIndex(index)}
                    className={`h-1.5 rounded-full transition-all ${
                      index === currentImageIndex ? 'w-4 bg-cyan-400' : 'w-1.5 bg-white/70'
                    }`}
                    aria-label={`Image ${index + 1}`}
                  />
                ))}
              </div>
            )}

            <div className="flex space-x-2 p-4 overflow-x-auto">
              {vehicleImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 brand-transition ${
                    index === currentImageIndex ? 'border-cosmic-depth' : 'border-transparent'
                  }`}
                >
                  <Image
                    src={image}
                    alt={`View ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="lg:w-1/2 flex flex-col lg:min-h-0">
            {/* Tabs */}
            <div className="flex border-b border-border overflow-x-auto shrink-0 sticky top-0 lg:static bg-surface-premium z-[1]">
              {tabs?.map((tab) => (
                <button
                  key={tab?.id}
                  onClick={() => setActiveTab(tab?.id)}
                  className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium whitespace-nowrap brand-transition ${
                    activeTab === tab?.id
                      ? 'text-cosmic-depth border-b-2 border-cosmic-depth' :'text-text-refined hover:text-text-charcoal'
                  }`}
                >
                  <Icon name={tab?.icon} size={16} />
                  <span>{tab?.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-4 sm:p-6 lg:flex-1 lg:overflow-y-auto lg:min-h-0">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Key Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    {vehicle?.passengers && (
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-cosmic-silver rounded-lg flex items-center justify-center">
                          <Icon name="Users" size={20} className="text-cosmic-depth" />
                        </div>
                        <div>
                          <p className="text-sm text-text-refined">Passengers</p>
                          <p className="font-semibold text-text-charcoal">{vehicle.passengers}</p>
                        </div>
                      </div>
                    )}
                    {vehicle?.transmission && (
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-cosmic-silver rounded-lg flex items-center justify-center">
                          <Icon name="Settings" size={20} className="text-cosmic-depth" />
                        </div>
                        <div>
                          <p className="text-sm text-text-refined">Transmission</p>
                          <p className="font-semibold text-text-charcoal">{vehicle.transmission}</p>
                        </div>
                      </div>
                    )}
                    {vehicle?.year && (
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-cosmic-silver rounded-lg flex items-center justify-center">
                          <Icon name="Calendar" size={20} className="text-cosmic-depth" />
                        </div>
                        <div>
                          <p className="text-sm text-text-refined">Year</p>
                          <p className="font-semibold text-text-charcoal">{vehicle.year}</p>
                        </div>
                      </div>
                    )}
                    {vehicle?.type && (
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-cosmic-silver rounded-lg flex items-center justify-center">
                          <Icon name="Tag" size={20} className="text-cosmic-depth" />
                        </div>
                        <div>
                          <p className="text-sm text-text-refined">Type</p>
                          <p className="font-semibold text-text-charcoal">{vehicle.type}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                                {/* Description */}
              {vehicle.description && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  <p className="text-text-refined leading-relaxed">{vehicle.description}</p>
                </div>
              )}

                  {/* Pricing Tiers Table */}
                  <div className="bg-cosmic-silver/30 rounded-lg p-4">
                    <h4 className="text-xs font-bold text-text-charcoal uppercase tracking-wider mb-3 flex items-center gap-1">
                      <Icon name="Tag" size={14} className="text-adventure-orange" />
                      Hiring Rates (KES)
                    </h4>
                    
                    {pricingTiers.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {pricingTiers.map((tier) => {
                          const isDisabled = isBelow4500 && tier.id === 'daily';
                          return (
                            <div 
                              key={tier.id}
                              onClick={() => !isDisabled && setSelectedTier(tier)}
                              className={`flex justify-between p-2 rounded border transition-all ${
                                isDisabled
                                  ? 'bg-gray-100/70 border-gray-200 text-gray-400 cursor-not-allowed opacity-60'
                                  : selectedTier?.id === tier.id 
                                    ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500 cursor-pointer' 
                                    : 'bg-white/50 border-gray-100 hover:bg-blue-50/40 hover:border-blue-100 cursor-pointer'
                              } ${tier.id === 'daily' ? 'col-span-2' : ''}`}
                            >
                              <span className={`${tier.id === 'daily' ? 'font-semibold' : ''} ${isDisabled ? 'text-gray-400' : 'text-text-refined'}`}>
                                {tier.label} {isDisabled && '(Unavailable)'}
                              </span>
                              <span className={`${tier.id === 'daily' ? 'font-extrabold' : 'font-bold'} ${isDisabled ? 'text-gray-400' : 'text-cosmic-depth'}`}>
                                KES {Number(tier.value).toLocaleString()}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-sm">
                        <div>
                          <p className="text-xs text-text-refined">Daily Hire Rate</p>
                          <p className="text-lg font-bold text-cosmic-depth">
                            KES {vehicle?.pricePerDay?.toLocaleString()} <span className="text-xs font-normal">per day</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-text-refined">Weekly Hire Rate</p>
                          <p className="text-base font-semibold text-text-charcoal">
                            KES {(vehicle?.pricePerDay * 7)?.toLocaleString()} <span className="text-xs font-normal">per week</span>
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {isBelow4500 && (
                      <p className="text-[10px] text-amber-600 mt-2 flex items-start gap-1">
                        <Icon name="AlertTriangle" size={12} className="mt-0.5 flex-shrink-0" />
                        <span>Daily 24-hour hire is unavailable for vehicles under KES 4,500. Please select an hourly rate or a multi-day rate (48 Hours+).</span>
                      </p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'specifications' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    {vehicle?.make && (
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-text-refined">Make</span>
                        <span className="font-medium text-text-charcoal">{vehicle.make}</span>
                      </div>
                    )}
                    {vehicle?.model && (
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-text-refined">Model</span>
                        <span className="font-medium text-text-charcoal">{vehicle.model}</span>
                      </div>
                    )}
                    {vehicle?.year && (
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-text-refined">Year</span>
                        <span className="font-medium text-text-charcoal">{vehicle.year}</span>
                      </div>
                    )}
                    {vehicle?.transmission && (
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-text-refined">Transmission</span>
                        <span className="font-medium text-text-charcoal">{vehicle.transmission}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}


            </div>

            {/* Footer Actions */}
            <div className="border-t border-border p-4 sm:p-6 shrink-0 bg-surface-premium">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-cosmic-depth">
                    {footerPricing.amount != null
                      ? `KES ${footerPricing.amount.toLocaleString()}`
                      : isBelow4500 ? 'Select a duration' : 'Price on request'}
                  </p>
                  <p className="text-sm text-text-refined">
                    {footerPricing.label}
                    {selectedTier ? '' : pricingTiers.length > 0 ? ' · tap a rate above' : ''}
                  </p>
                  <p className="text-xs text-text-refined mt-0.5">
                    {vehicle?.available ? 'Available now' : 'Currently unavailable'}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="flex-1 sm:flex-none"
                  >
                    Close
                  </Button>
                  <Button
                    variant="default"
                    onClick={() => onBookNow(vehicle, selectedTier)}
                    disabled={!vehicle?.available || (isBelow4500 && !selectedTier)}
                    className="flex-1 sm:flex-none rounded-full bg-adventure-orange hover:bg-adventure-orange/90 disabled:opacity-50"
                  >
                    {vehicle?.available ? (isBelow4500 && !selectedTier ? 'Select Rate' : 'Book Now') : 'Unavailable'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetailModal;