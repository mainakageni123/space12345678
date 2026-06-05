import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Icon from '../../components/AppIcon';
import { API_BASE_URL } from '../../config/api';
import { SUPPORT_TEL_URL, supportWhatsAppUrl } from '../../config/contact';
import { getAdventurePrice, formatKes } from '../../utils/adventurePricing';

const InstantBookingFlow = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Handle both vehicle and adventure bookings
  const selectedVehicle = location?.state?.selectedVehicle || {};
  const selectedAdventure = location?.state?.selectedAdventure || {};
  const selectedTier = location?.state?.selectedTier || null;
  const bookingType = selectedAdventure?.type === 'adventure' ? 'adventure' : 'vehicle';
  
  // Debug logging
  console.log('=== Booking Flow Debug ===');
  console.log('Booking Type:', bookingType);
  console.log('Selected Vehicle:', selectedVehicle);
  console.log('Vehicle images:', selectedVehicle?.images);
  console.log('First image:', selectedVehicle?.images?.[0]);
  console.log('Selected Adventure:', selectedAdventure);
  
  // Extract booking details based on type
  const adventurePrice = bookingType === 'adventure' ? getAdventurePrice(selectedAdventure) : 0;

  const bookingDetails = bookingType === 'adventure' ? {
    id: selectedAdventure.id,
    name: selectedAdventure.title,
    description: selectedAdventure.location,
    price: adventurePrice,
    icon: 'MapPin',
    priceLabel: 'Amount to pay',
    color: 'from-purple-600 to-purple-700'
  } : {
    id: selectedVehicle?.id || '',
    name: `${selectedVehicle?.make || ''} ${selectedVehicle?.model || ''}`.trim() || selectedVehicle?.name || 'Vehicle',
    description: selectedTier ? `Duration: ${selectedTier.duration}` : `${selectedVehicle?.make || ''} ${selectedVehicle?.model || ''}`.trim(),
    price: selectedTier ? selectedTier.value : (selectedVehicle?.pricePerDay || selectedVehicle?.price || 0),
    icon: 'Car',
    priceLabel: selectedTier ? selectedTier.label : 'Price per day',
    color: 'from-blue-600 to-blue-700'
  };
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: ''
  });

  const handleChange = (field, value) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!consentAccepted) {
      alert("You must agree to the Privacy Policy to complete your reservation.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Validate required fields
      const requiredFields = {
        firstName: 'First Name',
        lastName: 'Last Name',
        phoneNumber: 'Phone Number',
        email: 'Email'
      };

      for (const [field, label] of Object.entries(requiredFields)) {
        if (!form[field]?.trim()) {
          alert(`Please enter your ${label}`);
          setIsSubmitting(false);
          return;
        }
      }

      // Prepare booking data based on type
      const bookingData = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phoneNumber: form.phoneNumber.trim(),
        email: form.email.trim(),
        consentGiven: true,
        status: 'pending'
      };

      // Add type-specific data
      if (bookingType === 'adventure') {
        bookingData.adventureId = bookingDetails.id;
        bookingData.adventureTitle = selectedAdventure.title;
        bookingData.adventureLocation = selectedAdventure.location;
        bookingData.numberOfParticipants = 1;
        // Price is resolved on the server from the adventure record (matches listing price)
        bookingData.preferredDate = new Date().toISOString().split('T')[0];
      } else {
        bookingData.vehicleId = bookingDetails.id;
        bookingData.vehicleName = bookingDetails.name;
        bookingData.vehicleMake = selectedVehicle?.make || '';
        bookingData.vehicleModel = selectedVehicle?.model || '';
        bookingData.vehiclePrice = bookingDetails.price;
        if (selectedTier) {
          bookingData.duration = selectedTier.duration;
        }
      }

      console.log('Submitting booking:', bookingData);

      // Determine endpoint
      const endpoint = bookingType === 'adventure' 
        ? `${API_BASE_URL}/adventure-bookings`
        : `${API_BASE_URL}/bookings`;

      // Submit to backend API
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(bookingData)
      });

      const result = await response.json();
      console.log('Server response:', result);
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create reservation');
      }

      if (!result.success) {
        throw new Error(result.message || 'Failed to create reservation');
      }

      // Navigate to confirmation page with booking data
      navigate('/booking-confirmation', {
        state: {
          bookingData: result.booking,
          bookingType: bookingType
        }
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      alert(error.message || 'Error submitting reservation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      <main className="max-w-5xl mx-auto px-3 pt-20 pb-2">
        {showSuccess ? (
          <div className="space-y-2 animate-fadeIn">
            {/* Success Hero Section - Compact */}
            <div className="bg-gradient-to-br from-green-50 via-white to-blue-50 rounded-2xl shadow-lg overflow-hidden border border-green-100">
              <div className="p-3 text-center">
                {/* Success Icon */}
                <div className="mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-green-500/30">
                    <Icon name="CheckCircle" className="w-6 h-6 text-white" />
                  </div>
                </div>
                
                {/* Main Heading */}
                <h1 className="text-xl font-bold text-gray-900 mb-2">
                  Reservation Confirmed!
                </h1>
                
                {/* Reference Number */}
                <div className="inline-flex items-center gap-1 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full border border-gray-200 mb-2">
                  <Icon name="Hash" className="w-3 h-3 text-gray-500" />
                  <span className="text-xs font-mono font-semibold text-gray-700">
                    REF-{Date.now().toString().slice(-8).toUpperCase()}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  Thank you for choosing SpaceBorne! Your reservation has been successfully received and our team will contact you <span className="font-semibold text-green-600">in a few</span> to confirm all details.
                </p>
              </div>
            </div>

            {/* What Happens Next - Compact Grid */}
            <div className="bg-white rounded-xl shadow-lg p-2 border border-gray-100">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Icon name="Clock" className="w-3 h-3 text-white" />
                </div>
                <h2 className="text-base font-bold text-gray-900">What Happens Next?</h2>
              </div>
              
              {/* Horizontal Timeline */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { icon: 'CheckCircle2', title: 'Review', desc: 'Team reviewing', status: 'complete' },
                  { icon: 'Phone', title: 'Contact', desc: 'Call shortly', status: 'pending' },
                  { icon: 'FileText', title: 'Documents', desc: 'Finalize details', status: 'pending' },
                  { icon: 'Calendar', title: 'Ready', desc: 'Booking confirmed', status: 'pending' }
                ].map((step, index) => (
                  <div key={index} className="text-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-1 ${
                      step.status === 'complete' 
                        ? 'bg-green-500 shadow-md' 
                        : 'bg-gray-100 border-2 border-gray-300'
                    }`}>
                      <Icon name={step.icon} className={`w-4 h-4 ${
                        step.status === 'complete' ? 'text-white' : 'text-gray-400'
                      }`} />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-xs mb-0.5">{step.title}</h3>
                    <p className="text-[10px] text-gray-600 leading-tight">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact & Actions Combined */}
            <div className="grid grid-cols-2 gap-2">
              {/* WhatsApp */}
              <a 
                href={supportWhatsAppUrl('Hi, I just made a reservation and need assistance.')}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="bg-green-500 hover:bg-green-600 rounded-lg p-2 transition-all hover:scale-105 cursor-pointer shadow-md">
                  <div className="flex items-center justify-center gap-2 text-white">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    <span className="text-sm font-semibold">Text us on WhatsApp</span>
                  </div>
                </div>
              </a>
              
              {/* Call */}
              <a href={SUPPORT_TEL_URL}>
                <div className="bg-blue-600 hover:bg-blue-700 rounded-lg p-2 transition-all hover:scale-105 cursor-pointer shadow-md">
                  <div className="flex items-center justify-center gap-2 text-white">
                    <Icon name="Phone" className="w-4 h-4" />
                    <span className="text-sm font-semibold">Call Us</span>
                  </div>
                </div>
              </a>
            </div>

            {/* Action Buttons - Compact */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="default"
                className="w-full bg-gray-800 hover:bg-gray-900 py-2 text-sm font-semibold"
                onClick={() => navigate('/homepage')}
              >
                <Icon name="Home" className="w-4 h-4 mr-1" />
                Home
              </Button>
              <Button
                variant="outline"
                className="w-full border-2 border-gray-300 hover:bg-gray-50 py-2 text-sm font-semibold"
                onClick={() => {
                  setShowSuccess(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                <Icon name="Plus" className="w-4 h-4 mr-1" />
                New Booking
              </Button>
            </div>

            {/* Compact Footer Note */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-2 text-center">
              <p className="text-xs text-blue-900">
                <Icon name="Info" className="w-3 h-3 inline mr-1" />
                Check your email/phone for details. Contact support if no response in a few.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
            {/* Booking Summary Header */}
            {bookingDetails.id && (
              <div className="relative h-32 overflow-hidden">
                {/* Background Image or Gradient */}
                {bookingType === 'vehicle' && selectedVehicle?.images?.[0] ? (
                  <>
                    <img 
                      src={selectedVehicle.images[0]} 
                      alt={bookingDetails.name}
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(e) => {
                        console.log('Image failed to load:', selectedVehicle.images[0]);
                        e.target.style.display = 'none';
                      }}
                    />
                    {/* Dark overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70"></div>
                  </>
                ) : bookingType === 'adventure' && selectedAdventure?.image ? (
                  <>
                    <img 
                      src={selectedAdventure.image} 
                      alt={bookingDetails.name}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-900/70 via-purple-900/50 to-purple-900/70"></div>
                  </>
                ) : (
                  <div className={`absolute inset-0 bg-gradient-to-r ${bookingDetails.color}`}></div>
                )}
                
                {/* Content Overlay */}
                <div className="relative h-full flex items-center justify-between p-3 text-white z-10">
                  {/* Vehicle/Adventure Info */}
                  <div className="flex-1">
                    <h2 className="text-xl font-bold mb-0.5">{bookingDetails.name}</h2>
                    <p className="text-white/90 text-xs flex items-center gap-1">
                      <Icon name="MapPin" className="w-3 h-3" />
                      {bookingDetails.description}
                    </p>
                  </div>
                  
                  {/* Price */}
                  <div className="text-right">
                    <p className="text-white/80 text-xs">{bookingDetails.priceLabel}</p>
                    <p className="text-xl font-bold">{formatKes(bookingDetails.price)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Form Section */}
            <div className="p-4">
              <div className="mb-4">
                <h1 className="text-xl font-bold text-gray-900 mb-1">Complete Your Reservation</h1>
                <p className="text-sm text-gray-600">
                  Fill in your contact details and we'll reach out shortly to confirm your {bookingType === 'adventure' ? 'adventure' : 'vehicle rental'}.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-2">
                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      value={form.firstName}
                      onChange={(e) => handleChange('firstName', e.target.value)}
                      placeholder="John"
                      className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      value={form.lastName}
                      onChange={(e) => handleChange('lastName', e.target.value)}
                      placeholder="Doe"
                      className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Icon name="Phone" className="w-4 h-4 text-gray-400" />
                    </div>
                    <Input
                      type="tel"
                      value={form.phoneNumber}
                      onChange={(e) => handleChange('phoneNumber', e.target.value)}
                      placeholder="0712 345 678"
                      className="w-full pl-10 pr-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Icon name="Mail" className="w-4 h-4 text-gray-400" />
                    </div>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="john.doe@example.com"
                      className="w-full pl-10 pr-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Info Box */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded p-2">
                  <div className="flex gap-1.5">
                    <Icon name="Info" className="w-3 h-3 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-bold text-blue-900 text-[10px] mb-0.5">What happens next?</p>
                      <ul className="space-y-0.5 text-blue-800 text-[9px] leading-tight">
                        <li>✓ We'll review your reservation right away</li>
                        <li>✓ You'll receive a confirmation call/email shortly</li>
                        <li>✓ Payment details will be provided upon confirmation</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Consent Checkbox */}
                <div className="flex items-start gap-2.5 my-3 text-left">
                  <input
                    type="checkbox"
                    id="privacy-consent"
                    checked={consentAccepted}
                    onChange={(e) => setConsentAccepted(e.target.checked)}
                    required
                    className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="privacy-consent" className="text-xs text-gray-600 select-none cursor-pointer">
                    I agree to the SpaceBorne{' '}
                    <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-semibold">
                      Privacy Policy
                    </a>{' '}
                    and consent to my contact details being used for booking processing.
                  </label>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full py-2.5 text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Make Reservation'}
                </Button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default InstantBookingFlow;