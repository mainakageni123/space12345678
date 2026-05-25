import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon.jsx';
import Button from '../../../components/ui/Button';
import { useVehicles } from '../../../contexts/VehicleContext';
import { API_BASE_URL } from '../../../config/api';

const FleetStatus = () => {
  const navigate = useNavigate();
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const { vehicles, deleteVehicle, fetchVehicles, toggleAvailability } = useVehicles();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleAddVehicle = () => {
    navigate('/admin-command-center/add-vehicle');
  };

  const handleEditVehicle = (vehicleId) => {
    navigate(`/admin-command-center/edit-vehicle/${vehicleId}`);
  };

  const handleDeleteClick = (vehicleId) => {
    setShowDeleteConfirm(vehicleId);
  };

  const handleDeleteConfirm = async (vehicleId) => {
    if (isDeleting) return;
    try {
      setIsDeleting(true);
      
      await deleteVehicle(vehicleId); // This will handle both API call and state update
      setShowDeleteConfirm(null);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      alert('Failed to delete vehicle. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const getClassBadgeColor = (vehicleClass) => {
    switch (vehicleClass?.toLowerCase()) {
      case 'economy':
        return 'bg-green-100 text-green-800';
      case 'premium':
        return 'bg-blue-100 text-blue-800';
      case 'luxury':
        return 'bg-purple-100 text-purple-800';
      case 'adventure':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <section className="p-6 relative">
      {showSuccess && (
        <div className="absolute top-4 right-4 bg-success/10 text-success px-4 py-2 rounded-lg flex items-center space-x-2">
          <Icon name="CheckCircle" size={16} />
          <span>Vehicle successfully removed</span>
        </div>
      )}
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-cosmic-depth">Fleet Status</h2>
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            iconName="Filter"
            className="border-cosmic-depth text-cosmic-depth"
          >
            Track All
          </Button>
          <Button
            onClick={handleAddVehicle}
            variant="default"
            size="sm"
            iconName="Plus"
            className="bg-stellar-gold text-cosmic-depth"
          >
            Add Vehicle
          </Button>
        </div>
      </div>

      {/* Fleet-style Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
        {vehicles.map((vehicle) => {
          const vid = vehicle.id || vehicle._id;
          return (
            <div key={vid} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 group">
              {/* Image */}
              <div className="relative h-32 overflow-hidden">
                <img
                  src={vehicle.images?.[0] || '/public/assets/images/no_image.png'}
                  alt={`${vehicle.make} ${vehicle.model}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Class Badge */}
                <div className="absolute top-2 left-2">
                  <div className={`px-2 py-1 rounded text-xs font-medium ${getClassBadgeColor(vehicle.class)}`}>
                    {vehicle.class || 'Vehicle'}
                  </div>
                </div>

                {/* Delete Button */}
                <div className="absolute top-2 right-2">
                  <button
                    onClick={() => {
                      if (isDeleting) return;
                      handleDeleteClick(vid);
                    }}
                    className="w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                  >
                    <Icon name="Trash" size={12} />
                  </button>
                </div>

                {/* Price Badge */}
                <div className="absolute bottom-2 left-2">
                  <div className="bg-white/90 backdrop-blur-sm rounded px-2 py-1">
                    <div className="text-xs font-bold text-cosmic-depth">
                      KSH {vehicle.pricePerDay || vehicle.price || '3500'}
                    </div>
                  </div>
                </div>

                {/* Availability Badge/Toggle */}
                <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-0.5 shadow-sm border border-gray-100">
                  <div className={`w-2 h-2 rounded-full ${vehicle.available ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                  <span className="text-[10px] font-bold text-cosmic-depth uppercase tracking-tighter">
                    {vehicle.available ? 'Avail' : 'Booked'}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-3">
                <h3 className="text-sm font-bold text-cosmic-depth mb-2 line-clamp-1">
                  {vehicle.make} {vehicle.model}
                </h3>
                
                {/* Vehicle Details */}
                <div className="text-xs text-text-refined mb-2 space-y-1">
                  <div className="flex items-center">
                    <Icon name="Users" size={12} className="mr-1" />
                    <span>{vehicle.specifications?.seats || '4'} Seats</span>
                  </div>
                  <div className="flex items-center">
                    <Icon name="Settings" size={12} className="mr-1" />
                    <span>{vehicle.specifications?.transmission || 'Auto'}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Button
                    onClick={() => handleEditVehicle(vid)}
                    variant="default"
                    size="sm"
                    iconName="Edit"
                    iconPosition="left"
                    className="bg-cosmic-depth hover:bg-cosmic-depth/90 w-full text-xs py-2 mb-1"
                  >
                    Edit
                  </Button>

                  <Button
                    onClick={async () => {
                      try {
                        await toggleAvailability(vid, !vehicle.available);
                      } catch (err) {
                        alert('Failed to update availability');
                      }
                    }}
                    variant="outline"
                    size="sm"
                    className={`w-full text-xs py-2 border-2 ${
                      vehicle.available 
                        ? 'border-red-200 text-red-600 hover:bg-red-50' 
                        : 'border-green-200 text-green-600 hover:bg-green-50'
                    }`}
                  >
                    <Icon name={vehicle.available ? "XCircle" : "CheckCircle"} size={12} className="mr-1 inline" />
                    {vehicle.available ? 'Mark as Booked' : 'Mark Available'}
                  </Button>
                  
                  {showDeleteConfirm === vid && (
                    <div className="space-y-2">
                      <p className="text-xs text-red-600">Delete this vehicle?</p>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleDeleteConfirm(vid)}
                          variant="default"
                          size="sm"
                          className="bg-red-500 hover:bg-red-600 text-white flex-1 text-xs py-1"
                          disabled={isDeleting}
                        >
                          {isDeleting ? 'Deleting...' : 'Yes'}
                        </Button>
                        <Button
                          onClick={() => setShowDeleteConfirm(null)}
                          variant="outline"
                          size="sm"
                          className="border-gray-300 text-gray-700 flex-1 text-xs py-1"
                          disabled={isDeleting}
                        >
                          No
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default FleetStatus;