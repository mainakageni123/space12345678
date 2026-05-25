import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../../config/api';
import { useAdminAuth } from '../../../contexts/AdminAuthContext';

const AddVehicle = () => {
  const navigate = useNavigate();
  const { admin } = useAdminAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);
  const [errors, setErrors] = useState({});
  
  const [vehicleData, setVehicleData] = useState({
    name: '',
    type: 'Sedan',
    price: '',
    description: '',
    make: '',
    model: '',
    year: '',
    color: '',
    licensePlate: '',
    vin: '',
    fuelEfficiency: '',
    location: '',
    seats: '',
    transmission: 'Automatic',
    fuelType: 'Petrol'
  });

  const [selectedImages, setSelectedImages] = useState([]);
  
  const [pricing, setPricing] = useState({
    hourly1: '',
    hourly3: '',
    hourly6: '',
    hourly12: '',
    daily: '',
    daily2: '',
    daily3: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setVehicleData(prev => {
      const updated = {
        ...prev,
        [name]: value
      };
      return updated;
    });

    if (name === 'price') {
      setPricing(prev => ({
        ...prev,
        daily: value
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

  const handlePricingChange = (e) => {
    const { name, value } = e.target;
    setPricing(prev => {
      const updated = {
        ...prev,
        [name]: value
      };
      return updated;
    });

    if (name === 'daily') {
      setVehicleData(prev => ({
        ...prev,
        price: value
      }));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      // Validate each file
      const validFiles = [];
      const errors = [];
      
      files.forEach((file, index) => {
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          errors.push(`Image ${index + 1} size must be less than 5MB`);
          return;
        }
        // Validate file type
        if (!file.type.match(/^image\/(jpeg|png|gif|webp|jpg)$/)) {
          errors.push(`Image ${index + 1} must be JPG, PNG, GIF, or WEBP`);
          return;
        }
        validFiles.push(file);
      });
      
      if (errors.length > 0) {
        setErrors(prev => ({
          ...prev,
          image: errors.join('. ')
        }));
        return;
      }
      
      setSelectedImages(prevImages => [...prevImages, ...validFiles]);
      // Clear error if exists
      if (errors.image) {
        setErrors(prev => ({
          ...prev,
          image: null
        }));
      }
    }
  };

  const removeImage = (indexToRemove) => {
    setSelectedImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const validateForm = () => {
    const newErrors = {};
    // Required fields validation
    // Only require make, model, type, seats, and image
    if (!vehicleData.make) newErrors.make = 'Make is required';
    if (!vehicleData.model) newErrors.model = 'Model is required';
    if (!vehicleData.type) newErrors.type = 'Vehicle type is required';
    if (selectedImages.length === 0) newErrors.image = 'At least one vehicle image is required';
    if (!vehicleData.seats) newErrors.seats = 'Number of seats is required';

    // Additional validations
    if (vehicleData.price && (isNaN(vehicleData.price) || vehicleData.price <= 0)) {
      newErrors.price = 'Daily rate must be a positive number';
    }
    if (vehicleData.seats && (isNaN(vehicleData.seats) || vehicleData.seats <= 0)) {
      newErrors.seats = 'Number of seats must be a positive number';
    }
    if (vehicleData.year) {
      const currentYear = new Date().getFullYear();
      const year = parseInt(vehicleData.year);
      if (isNaN(year) || year < 1900 || year > currentYear + 1) {
        newErrors.year = `Year must be between 1900 and ${currentYear + 1}`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const token = sessionStorage.getItem('admin_token') || localStorage.getItem('adminToken') || localStorage.getItem('admin_token');
    if (!token) {
      setNotification({
        type: 'error',
        message: 'Authentication error. Please log in again.'
      });
      // Optionally, redirect to login page
      navigate('/admin-login', { replace: true });
      return;
    }

    if (!validateForm()) {
      setNotification({
        type: 'error',
        message: 'Please fill in all required fields'
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      
      // Add all image files with the field name expected by Multer
      selectedImages.forEach((image) => {
        formData.append('images', image);
      });
      
      // Add all vehicle data
      Object.keys(vehicleData).forEach(key => {
        if (vehicleData[key] !== '') {
          formData.append(key, vehicleData[key]);
        }
      });
      
      // Add specifications as JSON (required fields)
      const specifications = {
        seats: parseInt(vehicleData.seats),
        transmission: vehicleData.transmission,
        fuelType: vehicleData.fuelType
      };
      formData.append('specifications', JSON.stringify(specifications));
      formData.append('pricing', JSON.stringify(pricing));

      const response = await fetch(`${API_BASE_URL}/vehicles`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type header when using FormData
        }
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication expired. Please log in again.');
        } else {
          throw new Error(result.message || 'Failed to add vehicle');
        }
      }

      if (response.ok && result.success) {
        setNotification({
          type: 'success',
          message: 'Vehicle added successfully!'
        });
        
        // Reset form if staying on page
        const resetForm = () => {
          setVehicleData({
            name: '',
            type: 'Sedan',
            price: '',
            description: '',
            make: '',
            model: '',
            year: '',
            color: '',
            licensePlate: '',
            vin: '',
            fuelEfficiency: '',
            location: '',
            seats: '',
            transmission: 'Automatic',
            fuelType: 'Petrol'
          });
          setPricing({
            hourly1: '',
            hourly3: '',
            hourly6: '',
            hourly12: '',
            daily: '',
            daily2: '',
            daily3: ''
          });
          setSelectedImages([]);
          setNotification(null);
        };
        
        // Show success UI with buttons
        setNotification({
          type: 'success',
          message: 'Vehicle added successfully!',
          actions: (
            <div className="mt-4 flex gap-4">
              <button
                onClick={() => navigate('/admin-command-center')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Return to Fleet
              </button>
              <button
                onClick={resetForm}
                className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
              >
                Add Another Vehicle
              </button>
            </div>
          )
        });
      } else {
        throw new Error(result.message || 'Failed to add vehicle');
      }
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

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add New Vehicle</h1>
            <p className="text-gray-600">Enter the details of the new vehicle.</p>
          </div>
          <button
            onClick={() => navigate('/admin-command-center')}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Notification */}
        {notification && (
          <div className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md p-4 rounded-lg shadow-lg
            ${notification.type === 'success' 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'}`}
          >
            <div className="flex flex-col">
              <div className="flex items-center justify-between">
                <span className="font-medium">{notification.message}</span>
                {!notification.actions && (
                  <button
                    onClick={() => setNotification(null)}
                    className="ml-4 text-lg hover:opacity-70"
                  >
                    ×
                  </button>
                )}
              </div>
              {notification.actions && (
                <div>{notification.actions}</div>
              )}
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Required Fields Legend */}
          <div className="text-sm text-gray-600 mb-4">
            <span className="text-red-500">*</span> indicates required field
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  name="description"
                  value={vehicleData.description}
                  onChange={handleInputChange}
                  placeholder="Enter vehicle description..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Make <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="make"
                  value={vehicleData.make}
                  onChange={handleInputChange}
                  placeholder="e.g., Toyota"
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.make ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.make && <p className="text-sm text-red-600 mt-1">{errors.make}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Model <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="model"
                  value={vehicleData.model}
                  onChange={handleInputChange}
                  placeholder="e.g., Camry"
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.model ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.model && <p className="text-sm text-red-600 mt-1">{errors.model}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year (Optional)
                </label>
                <input
                  type="number"
                  name="year"
                  value={vehicleData.year}
                  onChange={handleInputChange}
                  placeholder="e.g., 2023"
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.year ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.year && <p className="text-sm text-red-600 mt-1">{errors.year}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="type"
                  value={vehicleData.type}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.type ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="SUV">SUV</option>
                  <option value="Sedan">Sedan</option>
                  <option value="Van">Van</option>
                  <option value="Truck">Truck</option>
                  <option value="Luxury">Luxury</option>
                </select>
                {errors.type && <p className="text-sm text-red-600 mt-1">{errors.type}</p>}
              </div>
            </div>

            {/* Vehicle Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Vehicle Details</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Daily Rate (KES) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={vehicleData.price}
                  onChange={handleInputChange}
                  placeholder="e.g., 5000"
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.price ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.price && <p className="text-sm text-red-600 mt-1">{errors.price}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="location"
                  value={vehicleData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., Nairobi"
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.location ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.location && <p className="text-sm text-red-600 mt-1">{errors.location}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Seats <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="seats"
                  value={vehicleData.seats}
                  onChange={handleInputChange}
                  placeholder="e.g., 5"
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.seats ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.seats && <p className="text-sm text-red-600 mt-1">{errors.seats}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transmission <span className="text-red-500">*</span>
                </label>
                <select
                  name="transmission"
                  value={vehicleData.transmission}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.transmission ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="Automatic">Automatic</option>
                  <option value="Manual">Manual</option>
                </select>
                {errors.transmission && <p className="text-sm text-red-600 mt-1">{errors.transmission}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fuel Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="fuelType"
                  value={vehicleData.fuelType}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.fuelType ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Electric">Electric</option>
                </select>
                {errors.fuelType && <p className="text-sm text-red-600 mt-1">{errors.fuelType}</p>}
              </div>
            </div>
          </div>

          {/* Pricing Tiers */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Pricing Tiers (KES)</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">1 Hour Rate</label>
                <input
                  type="number"
                  name="hourly1"
                  value={pricing.hourly1}
                  onChange={handlePricingChange}
                  placeholder="e.g. 500"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">3 Hours Rate</label>
                <input
                  type="number"
                  name="hourly3"
                  value={pricing.hourly3}
                  onChange={handlePricingChange}
                  placeholder="e.g. 1200"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">6 Hours Rate</label>
                <input
                  type="number"
                  name="hourly6"
                  value={pricing.hourly6}
                  onChange={handlePricingChange}
                  placeholder="e.g. 2200"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">12 Hours Rate</label>
                <input
                  type="number"
                  name="hourly12"
                  value={pricing.hourly12}
                  onChange={handlePricingChange}
                  placeholder="e.g. 3500"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">24 Hours / Daily Rate</label>
                <input
                  type="number"
                  name="daily"
                  value={pricing.daily}
                  onChange={handlePricingChange}
                  placeholder="e.g. 5000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">48 Hours / 2-Day Rate</label>
                <input
                  type="number"
                  name="daily2"
                  value={pricing.daily2}
                  onChange={handlePricingChange}
                  placeholder="e.g. 9500"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">72 Hours / 3-Day Rate</label>
                <input
                  type="number"
                  name="daily3"
                  value={pricing.daily3}
                  onChange={handlePricingChange}
                  placeholder="e.g. 14000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Additional Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <input
                  type="text"
                  name="color"
                  value={vehicleData.color}
                  onChange={handleInputChange}
                  placeholder="e.g., Black"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <input
                  type="text"
                  name="licensePlate"
                  value={vehicleData.licensePlate}
                  onChange={handleInputChange}
                  placeholder="e.g., KCA 123A"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  VIN
                </label>
                <input
                  type="text"
                  name="vin"
                  value={vehicleData.vin}
                  onChange={handleInputChange}
                  placeholder="Vehicle Identification Number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fuel Efficiency
                </label>
                <input
                  type="text"
                  name="fuelEfficiency"
                  value={vehicleData.fuelEfficiency}
                  onChange={handleInputChange}
                  placeholder="e.g., 12 km/l"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Vehicle Images</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle Images <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.image ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <p className="text-sm text-gray-500 mt-1">
                Upload one or more images of the vehicle (JPG, PNG, GIF, WEBP). You can select multiple images at once.
              </p>
              {errors.image && <p className="text-sm text-red-600 mt-1">{errors.image}</p>}
            </div>

            {selectedImages.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Selected Images ({selectedImages.length})
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {selectedImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        title="Remove image"
                      >
                        ×
                      </button>
                      <p className="text-xs text-gray-600 mt-1 truncate" title={image.name}>
                        {image.name}
                      </p>
                    </div>
                  ))}
                </div>
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
                  ➕ Add Vehicle
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVehicle;