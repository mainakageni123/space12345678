import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import { useVehicles } from '../../../contexts/VehicleContext';
import { cn } from '../../../utils/cn';

// Notification component
const Notification = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    } text-white z-50 flex items-center gap-2 animate-fade-in`}>
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-80">×</button>
    </div>
  );
};

const AddVehicleDuplicate = () => {
  const navigate = useNavigate();
  const { addVehicle } = useVehicles();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [errors, setErrors] = useState({});
  const [vehicleData, setVehicleData] = useState({
    name: '',  // Required
    type: 'Sedan',  // Required
    price: '',  // Required
    description: '',
    features: [],
    specifications: {
      seats: '',  // Required
      transmission: 'Automatic',  // Required
      fuelType: 'Petrol'  // Required
    },
    make: '',
    model: '',
    year: '',
    color: '',
    licensePlate: '',
    vin: '',
    fuelEfficiency: '',
    location: '',
    availability: true
  });

  const requiredFields = ['name', 'type', 'price', 'image', 'specifications.seats', 'specifications.transmission', 'specifications.fuelType'];

  const [selectedImages, setSelectedImages] = useState([]);
  
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length > 5) {
      setNotification({
        type: 'error',
        message: 'Maximum 5 images allowed'
      });
      return;
    }
    if (files.length < 1) {
      setNotification({
        type: 'error',
        message: 'At least 1 image is required'
      });
      return;
    }
    setSelectedImages(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    const newErrors = {};
    requiredFields.forEach(field => {
      if (!vehicleData[field] && field !== 'image') {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      }
    });
    
    if (selectedImages.length === 0) {
      newErrors.image = 'At least 1 vehicle image is required';
    }
    if (selectedImages.length > 5) {
      newErrors.image = 'Maximum 5 images allowed';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setNotification({
        type: 'error',
        message: 'Please fill in all required fields'
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Build payload expected by context: plain object with nested specs and image File
      const payload = {
        ...vehicleData,
        specifications: {
          ...vehicleData.specifications,
          seats: Number(vehicleData.specifications.seats || 0)
        },
        price: Number(vehicleData.price || 0),
        images: selectedImages
      };

      await addVehicle(payload);
      
      // Show success notification
      setShowSuccessMessage(true);
      setNotification({
        type: 'success',
        message: 'Vehicle added successfully!'
      });
      
      // Clear form after successful submission
      setVehicleData({
        name: '',
        type: 'Sedan',
        price: '',
        description: '',
        features: [],
        specifications: {
          seats: '',
          transmission: 'Automatic',
          fuelType: 'Petrol'
        },
        make: '',
        model: '',
        year: '',
        color: '',
        licensePlate: '',
        vin: '',
        fuelEfficiency: '',
        location: '',
        availability: true
      });
      setSelectedImages([]);
      
    } catch (error) {
      console.error('Error adding vehicle:', error);
      setNotification({
        type: 'error',
        message: error.message || 'Failed to add vehicle. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested specifications fields
    if (name.startsWith('specifications.')) {
      const specField = name.split('.')[1];
      setVehicleData(prev => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [specField]: value
        }
      }));
    } else {
      setVehicleData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Common input component for consistent styling
  const FormInput = ({ label, name, type = 'text', required = false, placeholder, ...props }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={vehicleData[name] || ''}
        onChange={handleChange}
        placeholder={placeholder}
        className={cn(
          "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
          errors[name] && "border-red-500 focus:ring-red-500 focus:border-red-500"
        )}
        {...props}
      />
      {errors[name] && <p className="text-sm text-red-600">{errors[name]}</p>}
    </div>
  );

  // Common select component
  const FormSelect = ({ label, name, required = false, options = [], ...props }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        name={name}
        value={vehicleData[name] || ''}
        onChange={handleChange}
        className={cn(
          "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
          errors[name] && "border-red-500 focus:ring-red-500 focus:border-red-500"
        )}
        {...props}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {errors[name] && <p className="text-sm text-red-600">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add New Vehicle (Duplicate)</h1>
            <p className="text-gray-600">Enter the details of the new vehicle.</p>
          </div>
          <button
            onClick={() => navigate('/admin-command-center')}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <Icon name="ArrowLeft" size={20} />
            Back to Dashboard
          </button>
        </div>

        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
              
              <FormInput
                label="Description (Optional)"
                name="description"
                placeholder="Enter vehicle description..."
                type="textarea"
                rows={4}
              />
              
              <FormInput
                label="Make"
                name="make"
                placeholder="e.g., Toyota"
                required
              />
              
              <FormInput
                label="Model"
                name="model"
                placeholder="e.g., Camry"
                required
              />
              
              <FormInput
                label="Year"
                name="year"
                type="number"
                placeholder="e.g., 2023"
                required
              />
              
              <FormSelect
                label="Type"
                name="type"
                required
                options={[
                  { value: 'SUV', label: 'SUV' },
                  { value: 'Sedan', label: 'Sedan' },
                  { value: 'Van', label: 'Van' },
                  { value: 'Truck', label: 'Truck' },
                  { value: 'Luxury', label: 'Luxury' }
                ]}
              />
            </div>

            {/* Vehicle Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Vehicle Details</h3>
              
              <FormInput
                label="Daily Rate (KES)"
                name="price"
                type="number"
                placeholder="e.g., 5000"
                required
              />
              
              <FormInput
                label="Location"
                name="location"
                placeholder="e.g., Nairobi"
                required
              />
              
              <FormInput
                label="Number of Seats"
                name="specifications.seats"
                type="number"
                placeholder="e.g., 5"
                required
              />
              
              <FormSelect
                label="Transmission"
                name="specifications.transmission"
                required
                options={[
                  { value: 'Automatic', label: 'Automatic' },
                  { value: 'Manual', label: 'Manual' }
                ]}
              />

              <FormSelect
                label="Fuel Type"
                name="specifications.fuelType"
                required
                options={[
                  { value: 'Petrol', label: 'Petrol' },
                  { value: 'Diesel', label: 'Diesel' },
                  { value: 'Hybrid', label: 'Hybrid' },
                  { value: 'Electric', label: 'Electric' }
                ]}
              />
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Additional Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Color"
                name="color"
                placeholder="e.g., Black"
              />
              
              <FormInput
                label="License Plate"
                name="licensePlate"
                placeholder="e.g., KCA 123A"
              />
              
              <FormInput
                label="VIN"
                name="vin"
                placeholder="Vehicle Identification Number"
              />
              
              <FormInput
                label="Fuel Efficiency"
                name="fuelEfficiency"
                placeholder="e.g., 12 km/l"
              />
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Vehicle Images</h3>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Vehicle Images <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-sm text-gray-500">
                Upload 1-5 images of the vehicle (JPG, PNG, GIF)
              </p>
              {errors.image && <p className="text-sm text-red-600">{errors.image}</p>}
            </div>

            {selectedImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {selectedImages.map((file, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setSelectedImages(prev => prev.filter((_, i) => i !== index))}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={() => navigate('/admin-command-center')}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Adding Vehicle...
                </>
              ) : (
                <>
                  <Icon name="Plus" size={16} />
                  Add Vehicle
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVehicleDuplicate;
