import React from 'react';
import ActionButton from './ActionButton';

const HeroActions = () => {
  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      {/* Premium Vehicles Button */}
      <ActionButton 
        to="/fleet-discovery" 
        icon="Car" 
        variant="default"
      >
        Rent Premium Vehicles
      </ActionButton>

      {/* Trips & Tours Button */}
      <ActionButton 
        to="/road-trip-adventures" 
        icon="Map" 
        variant="light"
      >
        Explore Trips & Tours
      </ActionButton>

      {/* PSV Services Button */}
      <ActionButton 
        to="/psv-professional-services" 
        icon="Users" 
        variant="light"
      >
        Book PSV Services
      </ActionButton>

      {/* Service Features */}
      <div className="grid grid-cols-3 gap-4 mt-8 text-white/90">
        <div className="flex items-center justify-center gap-2">
          <Icon name="Shield" size={20} />
          <span className="text-sm font-medium">Fully Insured</span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <Icon name="Star" size={20} />
          <span className="text-sm font-medium">Premium Service</span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <Icon name="Clock" size={20} />
          <span className="text-sm font-medium">24/7 Support</span>
        </div>
      </div>
    </div>
  );
};

export default HeroActions;