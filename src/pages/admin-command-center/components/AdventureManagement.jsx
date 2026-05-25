import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { API_BASE_URL } from '../../../config/api';
import { TRIP_TYPE_OPTIONS, getTripType, normalizeTripTypeForSave } from '../../../utils/adventureTripType';

const AdventureManagement = () => {
  const navigate = useNavigate();
  const [adventures, setAdventures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAdventure, setEditingAdventure] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    duration: '',
    tripType: 'Regular',
    price: '',
    maxParticipants: '',
    image: '',
    highlights: '',
    bestTime: '',
    included: ''
  });

  const [imageInputType, setImageInputType] = useState('url'); // 'url' or 'upload'
  const [selectedFile, setSelectedFile] = useState(null);

  const durationOptions = [
    { value: '1 Day', label: '1 Day' },
    { value: '2 Days', label: '2 Days' },
    { value: '3 Days', label: '3 Days' },
    { value: '4 Days', label: '4 Days' },
    { value: '5 Days', label: '5 Days' },
    { value: '1 Week', label: '1 Week' },
    { value: '2 Weeks', label: '2 Weeks' }
  ];

  useEffect(() => {
    fetchAdventures();
  }, []);

  const getAdminToken = () => sessionStorage.getItem('admin_token') || localStorage.getItem('adminToken') || localStorage.getItem('admin_token');

  const fetchAdventures = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/adventures`);
      if (response.ok) {
        const data = await response.json();
        setAdventures(data?.adventures || data || []);
      } else {
        console.error('Failed to fetch adventures from API');
        setAdventures([]);
      }
    } catch (error) {
      console.error('Error fetching adventures:', error);
      setAdventures([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
        e.target.value = ''; // Clear the input
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        alert('File size must be less than 5MB');
        e.target.value = ''; // Clear the input
        return;
      }

      setSelectedFile(file);
      // Create a preview URL for the selected file
      const previewUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, image: previewUrl }));
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      location: '',
      duration: '',
      tripType: 'Regular',
      price: '',
      maxParticipants: '',
      image: '',
      highlights: '',
      bestTime: '',
      included: ''
    });
    setImageInputType('url');
    setSelectedFile(null);
  };

  const buildAdventurePayload = () => {
    const tripType = normalizeTripTypeForSave(formData.tripType);
    return {
      title: formData.title.trim(),
      description: formData.description.trim(),
      location: formData.location.trim(),
      duration: formData.duration,
      tripType,
      price: parseFloat(formData.price) || 0,
      maxParticipants: parseInt(formData.maxParticipants, 10) || 0,
      image: formData.image,
      highlights: formData.highlights.split(',').map((h) => h.trim()).filter(Boolean),
      bestTime: formData.bestTime.trim(),
      included: formData.included.split(',').map((i) => i.trim()).filter(Boolean),
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.tripType) {
      alert('Please select a trip type.');
      return;
    }

    setLoading(true);
    
    try {
      const token = getAdminToken();
      let response;
      let headers = {
        'Authorization': `Bearer ${token}`
      };
      let body;

      if (imageInputType === 'upload' && selectedFile) {
        // Use FormData for file upload
        const formDataObj = new FormData();
        formDataObj.append('title', formData.title);
        formDataObj.append('description', formData.description);
        formDataObj.append('location', formData.location);
        formDataObj.append('duration', formData.duration);
        formDataObj.append('tripType', normalizeTripTypeForSave(formData.tripType));
        formDataObj.append('price', formData.price);
        formDataObj.append('maxParticipants', formData.maxParticipants);
        formDataObj.append('bestTime', formData.bestTime);
        formDataObj.append('highlights', JSON.stringify(formData.highlights.split(',').map(h => h.trim()).filter(Boolean)));
        formDataObj.append('included', JSON.stringify(formData.included.split(',').map(i => i.trim()).filter(Boolean)));
        formDataObj.append('image', selectedFile);
        
        body = formDataObj;
        // Do NOT set Content-Type for FormData
      } else {
        // Use JSON for URL-based image or no new image
        body = JSON.stringify(buildAdventurePayload());
        headers['Content-Type'] = 'application/json';
      }

      const url = editingAdventure 
        ? `${API_BASE_URL}/adventures/${editingAdventure._id}`
        : `${API_BASE_URL}/adventures`;
      
      const method = editingAdventure ? 'PUT' : 'POST';

      response = await fetch(url, {
        method,
        headers,
        body
      });

      if (response.ok) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        fetchAdventures();
        setShowAddForm(false);
        setEditingAdventure(null);
        resetForm();
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Server error: ${response.status}`;
        alert('Failed to save adventure: ' + errorMessage);
      }
    } catch (error) {
      console.error('Error saving adventure:', error);
      alert('Failed to save adventure: ' + (error.message || 'Network error'));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (adventure) => {
    setEditingAdventure(adventure);
    setFormData({
      title: adventure.title || '',
      description: adventure.description || '',
      location: adventure.location || '',
      duration: adventure.duration || '',
      tripType: getTripType(adventure),
      price: adventure.price?.toString() || '',
      maxParticipants: adventure.maxParticipants?.toString() || '',
      image: adventure.image || '',
      highlights: adventure.highlights?.join(', ') || '',
      bestTime: adventure.bestTime || '',
      included: adventure.included?.join(', ') || ''
    });
    
    // Set image input type based on existing image (assume URL if image exists)
    setImageInputType(adventure.image ? 'url' : 'url');
    setSelectedFile(null);
    setShowAddForm(true);
  };

  const handleDelete = async (adventureId) => {
    if (isDeleting) return;
    try {
      setIsDeleting(true);
      console.log('Attempting to delete adventure with ID:', adventureId);
      
      const token = getAdminToken();
      if (!token) {
        alert('You must be logged in to delete adventures');
        return;
      }
      console.log('Using token:', token);

      const response = await fetch(`${API_BASE_URL}/adventures/${adventureId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      console.log('Delete response:', data);
      
      if (response.ok && data.success) {
        console.log('Delete successful');
        setShowDeleteConfirm(null);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        await fetchAdventures(); // Refresh the list
      } else {
        const message = data.message || 'Failed to delete adventure';
        console.error('Delete failed:', message);
        alert(message);
      }
    } catch (error) {
      console.error('Error deleting adventure:', error);
      alert('Failed to delete adventure. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const getTripTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'family': return 'bg-green-100 text-green-800';
      case 'regular': return 'bg-blue-100 text-blue-800';
      case 'corporate': return 'bg-purple-100 text-purple-800';
      case 'group': return 'bg-yellow-100 text-yellow-800';
      case 'private': return 'bg-orange-100 text-orange-800';
      case 'adventure': return 'bg-cyan-100 text-cyan-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Icon name="Loader2" size={32} className="animate-spin text-cosmic-depth mx-auto mb-4" />
          <p className="text-gray-600">Loading adventures...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-100 text-green-800 px-4 py-2 rounded-lg flex items-center space-x-2 z-50">
          <Icon name="CheckCircle" size={16} />
          <span>Adventure {editingAdventure ? 'updated' : 'added'} successfully!</span>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-cosmic-depth">Adventure Management</h2>
        <Button
          onClick={() => {
            setShowAddForm(true);
            setEditingAdventure(null);
            resetForm();
          }}
          variant="default"
          size="sm"
          iconName="Plus"
          className="bg-stellar-gold text-cosmic-depth hover:bg-stellar-gold/90"
        >
          Add Adventure
        </Button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-lg premium-shadow border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingAdventure ? 'Edit Adventure' : 'Add New Adventure'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="text"
                label="Adventure Title"
                placeholder="Enter adventure title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
              />
              <Input
                type="text"
                label="Location"
                placeholder="Enter location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                required
              />
            </div>

            <Input
              type="textarea"
              label="Description"
              placeholder="Enter adventure description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Duration"
                placeholder="Select duration"
                options={durationOptions}
                value={formData.duration}
                onChange={(value) => handleInputChange('duration', value)}
                required
              />
              <Select
                label="Trip Type"
                placeholder="Select trip type"
                options={TRIP_TYPE_OPTIONS}
                value={formData.tripType}
                onChange={(value) => handleInputChange('tripType', value)}
                required
              />
              <Input
                type="number"
                label="Max Participants"
                placeholder="Enter max participants"
                value={formData.maxParticipants}
                onChange={(e) => handleInputChange('maxParticipants', e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="number"
                label="Price (KSH)"
                placeholder="Enter price in KSH"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                required
              />
              <Input
                type="text"
                label="Best Time"
                placeholder="e.g., Jun - Sep"
                value={formData.bestTime}
                onChange={(e) => handleInputChange('bestTime', e.target.value)}
              />
            </div>

            {/* Image Input Type Selection */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">Image Source:</span>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="imageInputType"
                      value="url"
                      checked={imageInputType === 'url'}
                      onChange={(e) => {
                        setImageInputType(e.target.value);
                        setSelectedFile(null);
                        if (e.target.value === 'url') {
                          setFormData(prev => ({ ...prev, image: '' }));
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">URL</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="imageInputType"
                      value="upload"
                      checked={imageInputType === 'upload'}
                      onChange={(e) => {
                        setImageInputType(e.target.value);
                        if (e.target.value === 'upload') {
                          setFormData(prev => ({ ...prev, image: '' }));
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Upload Photo</span>
                  </label>
                </div>
              </div>

              {imageInputType === 'url' ? (
                <Input
                  type="url"
                  label="Image URL"
                  placeholder="Enter image URL"
                  value={formData.image}
                  onChange={(e) => handleInputChange('image', e.target.value)}
                />
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Photo
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-stellar-gold file:text-cosmic-depth hover:file:bg-stellar-gold/90 file:cursor-pointer cursor-pointer"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Supported formats: JPEG, PNG, GIF, WebP. Max size: 5MB
                  </p>
                  {selectedFile && (
                    <div className="mt-2">
                      <p className="text-sm text-green-600">
                        ✓ Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Image Preview */}
              {formData.image && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image Preview
                  </label>
                  <div className="w-32 h-32 border border-gray-300 rounded-lg overflow-hidden">
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-500 text-sm" style={{display: 'none'}}>
                      Invalid Image
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Input
              type="text"
              label="Highlights (comma separated)"
              placeholder="e.g., Wildlife viewing, Photography, Cultural tours"
              value={formData.highlights}
              onChange={(e) => handleInputChange('highlights', e.target.value)}
            />

            <Input
              type="text"
              label="Included (comma separated)"
              placeholder="e.g., Transportation, Guide, Meals, Accommodation"
              value={formData.included}
              onChange={(e) => handleInputChange('included', e.target.value)}
            />

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingAdventure(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="default"
                className="bg-cosmic-depth hover:bg-cosmic-depth/90"
              >
                {editingAdventure ? 'Update Adventure' : 'Add Adventure'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Fleet-style Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
        {adventures.map((adventure) => (
          <div key={adventure._id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 group">
            {/* Image */}
            <div className="relative h-32 overflow-hidden">
              <img
                src={adventure.image || '/images/savannah.jpg'}
                alt={adventure.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              
              {/* Trip Type Badge */}
              <div className="absolute top-2 left-2">
                <div className={`px-2 py-1 rounded text-xs font-medium ${getTripTypeColor(getTripType(adventure))}`}>
                  {getTripType(adventure)}
                </div>
              </div>

              {/* Duration Badge */}
              <div className="absolute top-2 right-2">
                <div className="bg-stellar-gold text-cosmic-depth px-2 py-1 rounded text-xs font-bold">
                  {adventure.duration}
                </div>
              </div>

              {/* Price Badge */}
              <div className="absolute bottom-2 left-2">
                <div className="bg-white/90 backdrop-blur-sm rounded px-2 py-1">
                  <div className="text-xs font-bold text-cosmic-depth">KSH {adventure.price?.toLocaleString()}</div>
                </div>
              </div>

              {/* Availability Badge */}
              <div className="absolute bottom-2 right-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            </div>

            {/* Content */}
            <div className="p-3">
              <h3 className="text-sm font-bold text-cosmic-depth mb-2 line-clamp-1">{adventure.title}</h3>
              <p className="text-xs text-text-refined mb-2 flex items-center line-clamp-1">
                <Icon name="MapPin" size={12} className="mr-1" />
                {adventure.location}
              </p>

              {/* Participants */}
              <div className="text-xs text-text-refined mb-3 flex items-center">
                <Icon name="Users" size={12} className="mr-1" />
                {adventure.maxParticipants} max
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button
                  onClick={() => handleEdit(adventure)}
                  variant="default"
                  size="sm"
                  iconName="Edit"
                  iconPosition="left"
                  className="bg-cosmic-depth hover:bg-cosmic-depth/90 w-full text-xs py-2"
                >
                  Edit
                </Button>
                
                <Button
                  onClick={() => setShowDeleteConfirm(adventure._id)}
                  variant="outline"
                  size="sm"
                  iconName="Trash"
                  iconPosition="left"
                  className="border-red-300 text-red-600 hover:bg-red-50 w-full text-xs py-2"
                >
                  Delete
                </Button>
                
                {showDeleteConfirm === adventure._id && (
                  <div className="space-y-2">
                    <p className="text-xs text-red-600">Delete this adventure?</p>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleDelete(adventure._id)}
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
        ))}
      </div>

      {adventures.length === 0 && !showAddForm && (
        <div className="text-center py-12">
          <Icon name="MapPin" size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Adventures Yet</h3>
          <p className="text-gray-600 mb-4">Start by adding your first adventure experience.</p>
          <Button
            onClick={() => setShowAddForm(true)}
            variant="default"
            iconName="Plus"
            className="bg-stellar-gold text-cosmic-depth hover:bg-stellar-gold/90"
          >
            Add Your First Adventure
          </Button>
        </div>
      )}
    </div>
  );
};

export default AdventureManagement;