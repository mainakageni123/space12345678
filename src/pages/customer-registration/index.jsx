import React, { useState } from 'react';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';

const CustomerRegistration = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    dateOfBirth: {
      year: '',
      month: '',
      day: ''
    },
    licenseNumber: '',
    licenseExpiration: {
      year: '',
      month: '',
      day: ''
    },
    licenseType: '',
    idNumber: '',
    residentialAddress: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    photo: null
  });

  const licenseTypes = [
    { value: 'select-type', label: 'Select Type' },
    { value: 'full', label: 'Full License' },
    { value: 'provisional', label: 'Provisional' },
    { value: 'international', label: 'International' }
  ];

  const monthOptions = [
    { value: '', label: 'Month' },
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];

  const yearOptions = Array.from({ length: 80 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return { value: year.toString(), label: year.toString() };
  });

  const dayOptions = Array.from({ length: 31 }, (_, i) => {
    const day = (i + 1).toString().padStart(2, '0');
    return { value: day, label: day };
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        return {
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value
          }
        };
      }
      return {
        ...prev,
        [field]: value
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log(formData);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Customer Registration</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {/* Personal Information */}
              <Input
                label="First Name"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                placeholder="Enter first name"
                required
              />
              <Input
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                placeholder="Enter last name"
                required
              />
            </div>

            <Input
              label="Phone Number"
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              placeholder="Enter phone number"
              required
            />

            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter email address"
              required
            />

            {/* Date of Birth */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
              <div className="grid grid-cols-3 gap-4">
                <Select
                  options={yearOptions}
                  value={formData.dateOfBirth.year}
                  onChange={(value) => handleInputChange('dateOfBirth.year', value)}
                  placeholder="Year"
                />
                <Select
                  options={monthOptions}
                  value={formData.dateOfBirth.month}
                  onChange={(value) => handleInputChange('dateOfBirth.month', value)}
                  placeholder="Month"
                />
                <Select
                  options={dayOptions}
                  value={formData.dateOfBirth.day}
                  onChange={(value) => handleInputChange('dateOfBirth.day', value)}
                  placeholder="Day"
                />
              </div>
            </div>

            {/* Driver License Information */}
            <div className="space-y-4">
              <Input
                label="Driver License Number"
                value={formData.licenseNumber}
                onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                placeholder="Enter license number"
                required
              />

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">License Expiration</label>
                <div className="grid grid-cols-3 gap-4">
                  <Select
                    options={yearOptions}
                    value={formData.licenseExpiration.year}
                    onChange={(value) => handleInputChange('licenseExpiration.year', value)}
                    placeholder="Year"
                  />
                  <Select
                    options={monthOptions}
                    value={formData.licenseExpiration.month}
                    onChange={(value) => handleInputChange('licenseExpiration.month', value)}
                    placeholder="Month"
                  />
                  <Select
                    options={dayOptions}
                    value={formData.licenseExpiration.day}
                    onChange={(value) => handleInputChange('licenseExpiration.day', value)}
                    placeholder="Day"
                  />
                </div>
              </div>

              <Select
                label="Type of ID"
                options={licenseTypes}
                value={formData.licenseType}
                onChange={(value) => handleInputChange('licenseType', value)}
                placeholder="Select ID type"
              />
            </div>

            <Input
              label="ID Number"
              value={formData.idNumber}
              onChange={(e) => handleInputChange('idNumber', e.target.value)}
              placeholder="Enter ID number"
              required
            />

            <Input
              label="Residential Address / Hotel"
              value={formData.residentialAddress}
              onChange={(e) => handleInputChange('residentialAddress', e.target.value)}
              placeholder="Enter your address"
              required
            />

            <div className="grid grid-cols-2 gap-4">
              {/* Emergency Contact */}
              <Input
                label="Next of Kin Name"
                value={formData.emergencyContactName}
                onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                placeholder="Enter next of kin name"
                required
              />
              <Input
                label="Next of Kin Phone Number"
                value={formData.emergencyContactPhone}
                onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                placeholder="Enter next of kin phone"
                required
              />
            </div>

            {/* Profile Photo */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Photo</label>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                  {formData.photo ? (
                    <img
                      src={URL.createObjectURL(formData.photo)}
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <Button
                  type="button"
                  onClick={() => document.getElementById('photo-upload').click()}
                >
                  Add
                </Button>
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleInputChange('photo', e.target.files[0])}
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Submit
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CustomerRegistration;