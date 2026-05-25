import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';
import { mapVehicle, mapVehicles } from '../utils/mapVehicle';

// Helper function to handle API errors
const handleApiError = (error) => {
  console.error('API Error:', error);
  if (error.response) {
    // Server responded with an error
    throw new Error(error.response.data.message || 'Server error occurred');
  } else if (error.request) {
    // Request was made but no response received
    throw new Error('No response from server. Please check your connection.');
  } else {
    // Error occurred while setting up the request
    throw new Error('Failed to make request. Please try again.');
  }
};

const VehicleContext = createContext();

export const VehicleProvider = ({ children }) => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all vehicles
  const fetchVehicles = async (filters = {}) => {
    setLoading(true);
    try {
      console.log('Starting to fetch vehicles from:', API_BASE_URL);
      const queryParams = new URLSearchParams();
      
      // Add all valid filters to query params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value);
        }
      });

      const url = `${API_BASE_URL}/vehicles?${queryParams}`;
      console.log('Fetching vehicles from:', url);
      
      console.log('Making fetch request to:', url);
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        mode: 'cors'
      }).catch(err => {
        console.error('Network error during fetch:', err);
        throw new Error('Network error: ' + err.message);
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        console.error('Failed to fetch vehicles:', response.status, response.statusText);
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch vehicles: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Fetched vehicles data:', data);
      
      if (!Array.isArray(data)) {
        console.error('Unexpected response format:', data);
        // Try to extract array from response
        const vehicles = data.vehicles || data || [];
        if (Array.isArray(vehicles)) {
          setVehicles(mapVehicles(vehicles));
          setError(null);
          return;
        }
        throw new Error('Unexpected response format from server');
      }
      
      const mappedVehicles = mapVehicles(data);
      console.log('Mapped vehicles:', mappedVehicles);
      setVehicles(mappedVehicles);
      setError(null);
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch vehicles';
      console.error('Error fetching vehicles:', {
        message: errorMessage,
        error: err,
        url: `${API_BASE_URL}/vehicles`,
        statusText: err.statusText,
        status: err.status,
        stack: err.stack
      });
      setError(`Failed to load vehicles. Please check if the backend server is running on port 3001. Error: ${errorMessage}. Backend URL: ${API_BASE_URL}`);
    } finally {
      setLoading(false);
    }
  };

  // Add a new vehicle
  const addVehicle = async (vehicleData) => {
    setLoading(true);
    console.log('Starting to add vehicle:', vehicleData);
    try {
      const formData = new FormData();

      // If caller passed image/File directly (selectedImage), prefer that
      if (vehicleData.image instanceof File) {
        formData.append('image', vehicleData.image);
      }

      // If images array provided, use first file
      if (!formData.has('image') && vehicleData.images && vehicleData.images.length > 0 && vehicleData.images[0] instanceof File) {
        formData.append('image', vehicleData.images[0]);
      }

      // Append non-file fields. Serialize arrays/objects as JSON strings where appropriate.
      Object.keys(vehicleData).forEach(key => {
        const value = vehicleData[key];
        if (value === undefined || value === null) return;

        // Skip file entries we've already appended
        if (key === 'image' || key === 'images') return;

        if (typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      });
      
      const adminToken = localStorage.getItem('adminToken') || sessionStorage.getItem('admin_token');
      const headers = {};
      if (adminToken) {
        headers['Authorization'] = `Bearer ${adminToken}`;
      }

      console.log('Sending request to:', `${API_BASE_URL}/vehicles`);
      const response = await fetch(`${API_BASE_URL}/vehicles`, {
        method: 'POST',
        body: formData,
        headers,
      });

      console.log('Response status:', response.status);
      if (response.status === 401 || response.status === 403) {
        window.location.href = '/admin-login';
        throw new Error('Session expired. Redirecting to login.');
      }
      
      // Read the response only once
      const responseData = await response.json().catch(e => {
        console.error('Error parsing JSON:', e);
        throw new Error('Failed to parse server response');
      });
      
      console.log('Response data:', responseData);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || 'Error adding vehicle. Please try again.');
        throw new Error(errorData.message || 'Error adding vehicle. Please try again.');
      }
      // On success, refetch vehicles to update the list
      await fetchVehicles();
      setError(null);
      return responseData;
    } catch (err) {
      setError(err.message);
      console.error('Error adding vehicle:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update a vehicle
  const updateVehicle = async (id, updateData) => {
    setLoading(true);
    try {
      const formData = new FormData();
      
      Object.keys(updateData).forEach(key => {
        if (key === 'features' || key === 'specifications') {
          formData.append(key, JSON.stringify(updateData[key]));
        } else if (key === 'image' && updateData[key] instanceof File) {
          formData.append('image', updateData[key]);
        } else {
          formData.append(key, updateData[key]);
        }
      });

      const response = await fetch(`${API_BASE_URL}/vehicles/${id}`, {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to update vehicle');
      
      const updatedVehicle = await response.json();
      const mapped = mapVehicle(updatedVehicle);
      setVehicles(prev => prev.map(vehicle => 
        (vehicle.id === id || vehicle._id === id) ? mapped : vehicle
      ));
      setError(null);
      return updatedVehicle;
    } catch (err) {
      setError(err.message);
      console.error('Error updating vehicle:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete a vehicle
  const deleteVehicle = async (id) => {
    setLoading(true);
    try {
      console.log('Deleting vehicle:', id);
      // Use sessionStorage for admin token (per-session auth)
      const adminToken = sessionStorage.getItem('admin_token');
      if (!adminToken) {
        setError('No admin token found. Please login again.');
        alert('Authentication expired. Please login again.');
        return false;
      }
      const response = await fetch(`${API_BASE_URL}/vehicles/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      if (!response.ok) {
        let errorMsg = 'Failed to delete vehicle';
        try {
          const errorData = await response.json();
          errorMsg = errorData.message || errorMsg;
        } catch (e) {
          errorMsg = response.statusText || errorMsg;
        }
        setError(errorMsg);
        alert(errorMsg);
        return false;
      }
      setVehicles(prev => prev.filter(vehicle => 
        (vehicle.id || vehicle._id).toString() !== id.toString()
      ));
      setError(null);
      console.log('Vehicle deleted successfully');
      return true;
    } catch (err) {
      setError(err.message);
      alert('Error deleting vehicle: ' + err.message);
      console.error('Error deleting vehicle:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Toggle vehicle availability
  const toggleAvailability = async (id, availability) => {
    setLoading(true);
    try {
      const adminToken = sessionStorage.getItem('admin_token');
      if (!adminToken) {
        throw new Error('No admin token found. Please login again.');
      }

      const response = await fetch(`${API_BASE_URL}/vehicles/${id}/availability`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ availability })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update availability');
      }

      const result = await response.json();
      
      // Update local state
      setVehicles(prev => prev.map(vehicle => 
        (vehicle.id === id || vehicle._id === id) 
          ? { ...vehicle, available: availability } 
          : vehicle
      ));
      
      return result;
    } catch (err) {
      setError(err.message);
      console.error('Error toggling availability:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fetch vehicles on component mount
  useEffect(() => {
    fetchVehicles();
  }, []);

  return (
    <VehicleContext.Provider value={{ 
      vehicles, 
      loading, 
      error, 
      addVehicle, 
      updateVehicle, 
      deleteVehicle, 
      fetchVehicles,
      toggleAvailability 
    }}>
      {children}
    </VehicleContext.Provider>
  );
};

export const useVehicles = () => {
  const context = useContext(VehicleContext);
  if (!context) {
    throw new Error('useVehicles must be used within a VehicleProvider');
  }
  return context;
};
