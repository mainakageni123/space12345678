import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import { useVehicles } from '../../../contexts/VehicleContext';
import Image from '../../../components/AppImage';

const VehicleManagement = () => {
  const navigate = useNavigate();
  const { vehicles, deleteVehicle } = useVehicles();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const handleAddVehicle = () => {
    navigate('/admin-command-center/add-vehicle');
  };

  const handleEditVehicle = (id) => {
    navigate(`/admin-command-center/edit-vehicle/${id}`);
  };

  const handleDeleteVehicle = (id) => {
    deleteVehicle(id);
     setShowDeleteConfirm(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-cosmic-depth">Vehicle Fleet Management</h2>
          <p className="text-text-refined mt-1">Manage your fleet inventory and vehicle details</p>
        </div>
        <button
          onClick={handleAddVehicle}
          className="px-6 py-3 bg-stellar-gold text-cosmic-depth rounded-lg hover:bg-stellar-gold/90 flex items-center space-x-2 font-medium"
        >
          <Icon name="Plus" size={20} />
          <span>Add New Vehicle</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map((vehicle) => (
          <div key={vehicle.id} className="bg-white rounded-xl overflow-hidden border border-gray-100 premium-shadow">
            <div className="relative h-48">
              <Image
                src={vehicle.image || '/images/no_image.png'}
                alt={vehicle.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4 flex space-x-2">
                <button
                  onClick={() => handleEditVehicle(vehicle.id)}
                  className="p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white text-cosmic-depth"
                >
                  <Icon name="Edit" size={16} />
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(vehicle.id)}
                  className="p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white text-error"
                >
                  <Icon name="Trash" size={16} />
                </button>
              </div>
              <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-medium ${
                vehicle.status === 'available' ? 'bg-success/20 text-success' :
                vehicle.status === 'maintenance' ? 'bg-warning/20 text-warning' :
                'bg-error/20 text-error'
              }`}>
                {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
              </div>
            </div>

            <div className="p-4">
              <h3 className="text-lg font-semibold text-cosmic-depth mb-2">{vehicle.name}</h3>
              
              <div className="space-y-2 text-sm text-text-refined">
                <div className="flex items-center space-x-2">
                  <Icon name="Tag" size={14} />
                  <span>{vehicle.category}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon name="MapPin" size={14} />
                  <span>{vehicle.location}</span>
                </div>
                {vehicle.category === 'Electric' ? (
                  <div className="flex items-center space-x-2">
                    <Icon name="Battery" size={14} />
                    <span>{vehicle.batteryLevel}% Battery</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Icon name="Droplet" size={14} />
                    <span>{vehicle.fuelLevel}% Fuel</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-cosmic-depth mb-4">Confirm Delete</h3>
            <p className="text-text-refined mb-6">
              Are you sure you want to delete this vehicle? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-text-refined hover:text-cosmic-depth"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteVehicle(showDeleteConfirm)}
                className="px-4 py-2 bg-error text-white rounded-lg hover:bg-error/90"
              >
                Delete Vehicle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleManagement;
