import React, { useState } from 'react';
import Header from '../../../components/ui/Header';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';

const ManualBookingPage = () => {
  const [bookingData, setBookingData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    vehicleType: '',
    pickupLocation: '',
    dropoffLocation: '',
    pickupDate: '',
    pickupTime: '',
    returnDate: '',
    returnTime: '',
    numberOfPassengers: '',
    specialRequirements: ''
  });

  const vehicleTypes = [
    { value: 'luxury-sedan', label: 'Luxury Sedan' },
    { value: 'suv', label: 'SUV' },
    { value: 'van', label: 'Van' },
    { value: 'bus', label: 'Bus' }
  ];

  const kenyanCities = [
    { value: 'nairobi', label: 'Nairobi' },
    { value: 'mombasa', label: 'Mombasa' },
    { value: 'kisumu', label: 'Kisumu' },
    { value: 'nakuru', label: 'Nakuru' },
    { value: 'eldoret', label: 'Eldoret' },
    { value: 'malindi', label: 'Malindi' },
    { value: 'nanyuki', label: 'Nanyuki' }
  ];

  const handleInputChange = (field, value) => {
    setBookingData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Here you would implement your booking submission logic
      // This could be an API call to your backend service
      const response = await fetch('/api/admin/create-booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      if (response.ok) {
        alert('Booking created successfully!');
        // Reset form
        setBookingData({
          customerName: '',
          customerPhone: '',
          customerEmail: '',
          vehicleType: '',
          pickupLocation: '',
          dropoffLocation: '',
          pickupDate: '',
          pickupTime: '',
          returnDate: '',
          returnTime: '',
          numberOfPassengers: '',
          specialRequirements: ''
        });
      } else {
        throw new Error('Failed to create booking');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-surface-premium">
      <Header />
      
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-charcoal mb-2">Create Manual Booking</h1>
          <p className="text-text-refined">Create a new booking for a customer through the admin system.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-xl p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-text-charcoal">Customer Information</h2>
              <Input
                label="Customer Name"
                value={bookingData.customerName}
                onChange={(e) => handleInputChange('customerName', e.target.value)}
                required
              />
              <Input
                label="Phone Number"
                value={bookingData.customerPhone}
                onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                required
              />
              <Input
                label="Email Address"
                type="email"
                value={bookingData.customerEmail}
                onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                required
              />
            </div>

            {/* Booking Details */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-text-charcoal">Booking Details</h2>
              <Select
                label="Vehicle Type"
                value={bookingData.vehicleType}
                onChange={(e) => handleInputChange('vehicleType', e.target.value)}
                options={vehicleTypes}
                required
              />
              <Input
                label="Number of Passengers"
                type="number"
                min="1"
                value={bookingData.numberOfPassengers}
                onChange={(e) => handleInputChange('numberOfPassengers', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Trip Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-text-charcoal">Trip Information</h2>
              <Select
                label="Pickup Location"
                value={bookingData.pickupLocation}
                onChange={(e) => handleInputChange('pickupLocation', e.target.value)}
                options={kenyanCities}
                required
              />
              <Input
                label="Pickup Date"
                type="date"
                value={bookingData.pickupDate}
                onChange={(e) => handleInputChange('pickupDate', e.target.value)}
                required
              />
              <Input
                label="Pickup Time"
                type="time"
                value={bookingData.pickupTime}
                onChange={(e) => handleInputChange('pickupTime', e.target.value)}
                required
              />
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-text-charcoal">&nbsp;</h2>
              <Select
                label="Drop-off Location"
                value={bookingData.dropoffLocation}
                onChange={(e) => handleInputChange('dropoffLocation', e.target.value)}
                options={kenyanCities}
                required
              />
              <Input
                label="Return Date"
                type="date"
                value={bookingData.returnDate}
                onChange={(e) => handleInputChange('returnDate', e.target.value)}
                required
              />
              <Input
                label="Return Time"
                type="time"
                value={bookingData.returnTime}
                onChange={(e) => handleInputChange('returnTime', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Special Requirements */}
          <div>
            <h2 className="text-xl font-semibold text-text-charcoal mb-4">Additional Information</h2>
            <textarea
              className="w-full h-32 px-3 py-2 border border-border rounded-lg bg-surface-premium text-text-charcoal focus:outline-none focus:ring-2 focus:ring-cosmic-depth focus:border-transparent"
              placeholder="Special requirements or notes..."
              value={bookingData.specialRequirements}
              onChange={(e) => handleInputChange('specialRequirements', e.target.value)}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              variant="default"
              className="bg-cosmic-depth hover:bg-cosmic-depth/90"
            >
              Create Booking
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManualBookingPage;