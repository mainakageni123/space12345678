import React, { useEffect, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const PricingModal = ({ isOpen, onClose, vehicle, onBookNow }) => {
  const [selectedTier, setSelectedTier] = useState(null);

  // Prevent page scroll when modal is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !vehicle) return null;

  const pricing = vehicle.pricing || {};

  // List of standard pricing tiers
  const tiers = [
    { label: '1 Hour Rate', value: pricing.hourly1, duration: '1 hour', icon: 'Clock' },
    { label: '3 Hours Rate', value: pricing.hourly3, duration: '3 hours', icon: 'Clock' },
    { label: '6 Hours Rate', value: pricing.hourly6, duration: '6 hours', icon: 'Clock' },
    { label: '12 Hours Rate', value: pricing.hourly12, duration: '12 hours', icon: 'Clock' },
    { label: '24 Hours (1 Day) Rate', value: pricing.daily || vehicle.price, duration: '24 hours', icon: 'Calendar' },
    { label: '48 Hours (2 Days) Rate', value: pricing.daily2, duration: '48 hours', icon: 'Calendar' },
    { label: '72 Hours (3 Days) Rate', value: pricing.daily3, duration: '72 hours', icon: 'Calendar' },
  ];

  // Filter tiers to show only those configured with a valid price
  const activeTiers = tiers.filter(tier => tier.value !== undefined && tier.value !== null && tier.value !== '');

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in" 
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[85vh] animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex gap-3 items-center">
            {vehicle.imageUrl && (
              <img 
                src={vehicle.imageUrl} 
                alt="" 
                className="w-14 h-10 object-cover rounded-lg border border-gray-200" 
              />
            )}
            <div>
              <h3 className="font-bold text-base text-gray-900 leading-tight">{vehicle.make} {vehicle.model}</h3>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{vehicle.category || vehicle.class}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            aria-label="Close pricing modal"
          >
            <Icon name="X" size={18} />
          </button>
        </div>

        {/* Pricing Tiers Table */}
        <div className="p-4 overflow-y-auto flex-grow space-y-3">
          <div className="flex items-center gap-1.5 text-gray-500">
            <Icon name="Tag" size={14} className="text-blue-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider">Hiring Rates List</h4>
          </div>
          
          {activeTiers.length > 0 ? (
            <div className="space-y-2">
              {activeTiers.map((tier, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setSelectedTier(tier)}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all group cursor-pointer ${selectedTier?.label === tier.label ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' : 'bg-gray-50 hover:bg-blue-50/40 border-gray-100 hover:border-blue-100'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <Icon name={tier.icon} size={14} />
                    </div>
                    <div>
                      <p className="font-semibold text-xs text-gray-800">{tier.label}</p>
                      <p className="text-[9px] text-gray-400">Duration: {tier.duration}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm text-gray-900 group-hover:text-blue-700 transition-colors">
                      KES {Number(tier.value).toLocaleString()}
                    </p>
                    <p className="text-[9px] text-gray-400">Fixed rate</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <Icon name="AlertCircle" size={28} className="mx-auto mb-2 text-gray-300" />
              <p className="text-xs font-medium">No duration pricing tiers configured.</p>
              {vehicle.price && (
                <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-100 max-w-xs mx-auto">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Standard Daily Hire Rate</p>
                  <p className="text-base font-bold text-gray-900 mt-0.5">KES {Number(vehicle.price).toLocaleString()}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-4 items-center">
          <div className="flex-grow">
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider leading-none">Security Deposit</p>
            <p className="text-xs font-bold text-gray-700 mt-1">Refundable KES 10,000</p>
          </div>
          <Button
            variant="default"
            disabled={!vehicle.available}
            onClick={() => {
              onClose();
              onBookNow(vehicle, selectedTier);
            }}
            className={`${vehicle.available ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'} px-5 py-2 font-bold text-xs shadow-md rounded-lg`}
          >
            {vehicle.available ? 'Book Now' : 'Not Available'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PricingModal;
