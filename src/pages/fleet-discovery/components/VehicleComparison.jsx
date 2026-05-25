import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const VehicleComparison = ({ vehicles, onRemoveFromComparison, onClearComparison, onBookVehicle }) => {
  if (!vehicles || vehicles?.length === 0) return null;

  const comparisonFeatures = [
    { key: 'pricePerDay', label: 'Daily Rate', format: (value) => `$${value?.toFixed(2)}` },
    { key: 'passengers', label: 'Passengers', format: (value) => `${value} people` },
    { key: 'transmission', label: 'Transmission', format: (value) => value },
    { key: 'fuelEfficiency', label: 'Fuel Efficiency', format: (value) => `${value} MPG` },
    { key: 'safetyRating', label: 'Safety Rating', format: (value) => `${value}/5 stars` },
    { key: 'class', label: 'Vehicle Class', format: (value) => value }
  ];

  return (
    <div className="bg-surface-premium rounded-xl premium-shadow p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-text-charcoal">
          Compare Vehicles ({vehicles?.length})
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearComparison}
          iconName="X"
          iconPosition="left"
          className="text-text-refined hover:text-text-charcoal"
        >
          Clear All
        </Button>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-full">
          {/* Vehicle Headers */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {vehicles?.map((vehicle) => (
              <div key={vehicle?.id} className="text-center">
                <div className="relative mb-4">
                  <Image
                    src={vehicle?.images?.[0]}
                    alt={`${vehicle?.make} ${vehicle?.model}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => onRemoveFromComparison(vehicle?.id)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white brand-transition"
                  >
                    <Icon name="X" size={12} />
                  </button>
                </div>
                <h4 className="font-semibold text-text-charcoal">
                  {vehicle?.make} {vehicle?.model}
                </h4>
                <p className="text-sm text-text-refined">{vehicle?.year}</p>
              </div>
            ))}
          </div>

          {/* Comparison Table */}
          <div className="space-y-4">
            {comparisonFeatures?.map((feature) => (
              <div key={feature?.key} className="border-b border-border pb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="md:col-span-full lg:col-span-1 mb-2 lg:mb-0">
                    <h5 className="font-medium text-text-charcoal">{feature?.label}</h5>
                  </div>
                  {vehicles?.map((vehicle) => (
                    <div key={vehicle?.id} className="text-center lg:text-left">
                      <span className="text-text-charcoal">
                        {feature?.format(vehicle?.[feature?.key])}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Special Features */}
            <div className="border-b border-border pb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="md:col-span-full lg:col-span-1 mb-2 lg:mb-0">
                  <h5 className="font-medium text-text-charcoal">Special Features</h5>
                </div>
                {vehicles?.map((vehicle) => (
                  <div key={vehicle?.id} className="text-center lg:text-left">
                    <div className="space-y-1">
                      {vehicle?.specialFeatures?.slice(0, 3)?.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2 justify-center lg:justify-start">
                          <Icon name="Check" size={14} className="text-green-500" />
                          <span className="text-sm text-text-charcoal">{feature}</span>
                        </div>
                      ))}
                      {vehicle?.specialFeatures?.length > 3 && (
                        <p className="text-xs text-text-refined">
                          +{vehicle?.specialFeatures?.length - 3} more features
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Availability & Actions */}
            <div className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="md:col-span-full lg:col-span-1 mb-2 lg:mb-0">
                  <h5 className="font-medium text-text-charcoal">Actions</h5>
                </div>
                {vehicles?.map((vehicle) => (
                  <div key={vehicle?.id} className="text-center lg:text-left">
                    <div className="space-y-2">
                      <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                        vehicle?.available 
                          ? 'bg-green-100 text-green-800' :'bg-red-100 text-red-800'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${
                          vehicle?.available ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                        <span>{vehicle?.available ? 'Available' : 'Booked'}</span>
                      </div>
                      <div>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => onBookVehicle(vehicle)}
                          disabled={!vehicle?.available}
                          className="bg-adventure-orange hover:bg-adventure-orange/90 disabled:opacity-50"
                          fullWidth
                        >
                          {vehicle?.available ? 'Book Now' : 'Unavailable'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Recommendation */}
      <div className="mt-6 p-4 bg-cosmic-silver/30 rounded-lg">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-stellar-gold rounded-lg flex items-center justify-center flex-shrink-0">
            <Icon name="Lightbulb" size={16} className="text-text-charcoal" />
          </div>
          <div>
            <h5 className="font-medium text-text-charcoal mb-1">Our Recommendation</h5>
            <p className="text-sm text-text-refined">
              Based on your comparison, we recommend the vehicle with the best balance of features, 
              price, and availability for your specific needs. Consider your trip duration and purpose 
              when making your final decision.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleComparison;