import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const QuoteRequest = () => {
  const [formData, setFormData] = useState({
    serviceType: '',
    groupSize: '',
    pickupLocation: '',
    destination: '',
    serviceDate: '',
    serviceTime: '',
    duration: '',
    specialRequirements: '',
    contactName: '',
    company: '',
    email: '',
    phone: ''
  });

  const [estimatedPrice, setEstimatedPrice] = useState(null);

  const serviceTypes = [
    { value: 'corporate', label: 'Corporate & Personal' },
    { value: 'group', label: 'Group Transport' },
    { value: 'tourism', label: 'Tourism & Leisure' },
    { value: 'custom', label: 'Custom Solution' }
  ];

  const groupSizes = [
    { value: '1-4', label: '1-4 passengers' },
    { value: '5-8', label: '5-8 passengers' },
    { value: '9-15', label: '9-15 passengers' },
    { value: '16-25', label: '16-25 passengers' },
    { value: '26+', label: '26+ passengers' }
  ];

  const durations = [
    { value: 'hourly', label: 'Hourly Service' },
    { value: 'half-day', label: 'Half Day (4 hours)' },
    { value: 'full-day', label: 'Full Day (8 hours)' },
    { value: 'multi-day', label: 'Multi-Day Service' }
  ];

  const servicePricing = {
    'corporate': 15000,
    'group': 25000,
    'corporate-contract': 35000,
    'tourism': 20000,
    'custom': 30000
  };

  const groupMultipliers = {
    '1-4': 1,
    '5-8': 1.5,
    '9-15': 2.5,
    '16-25': 3.5,
    '26+': 4.5
  };

  const durationMultipliers = {
    'hourly': 1,
    'half-day': 3.5,
    'full-day': 6,
    'multi-day': 5.5,
    'ongoing': 4.5
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Recalculate estimated price when relevant fields change
    if (field === 'serviceType' || field === 'groupSize' || field === 'duration') {
      const updatedData = { ...formData, [field]: value };
      if (updatedData.serviceType && updatedData.groupSize && updatedData.duration) {
        const basePrice = servicePricing[updatedData.serviceType] || 0;
        const groupMultiplier = groupMultipliers[updatedData.groupSize] || 1;
        const durationMultiplier = durationMultipliers[updatedData.duration] || 1;
        
        const estimate = Math.round(basePrice * groupMultiplier * durationMultiplier);
        setEstimatedPrice(estimate);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const emailBody = `
        New Quote Request from SpaceBorne PSV Services
        
        Service Details:
        - Service Type: ${formData.serviceType}
        - Group Size: ${formData.groupSize}
        - Service Date: ${formData.serviceDate}
        - Service Time: ${formData.serviceTime}
        - Service Duration: ${formData.duration}
        
        Location Details:
        - Pickup Location: ${formData.pickupLocation}
        - Destination: ${formData.destination}
        
        Contact Information:
        - Name: ${formData.contactName}
        - Company: ${formData.company}
        - Email: ${formData.email}
        - Phone: ${formData.phone}
        
        Special Requirements:
        ${formData.specialRequirements}
      `;

      // Here you would implement your email sending logic
      // This could be an API call to your backend service
      const response = await fetch('/api/send-quote-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: 'Spacebornentreprices@gmail.com',
          subject: 'New PSV Service Quote Request',
          body: emailBody,
        }),
      });

      if (response.ok) {
        alert('Quote request sent successfully! We will contact you shortly.');
        setFormData({
          serviceType: '',
          groupSize: '',
          pickupLocation: '',
          destination: '',
          serviceDate: '',
          serviceTime: '',
          duration: '',
          specialRequirements: '',
          contactName: '',
          company: '',
          email: '',
          phone: ''
        });
        setEstimatedPrice(null);
      } else {
        throw new Error('Failed to send quote request');
      }
    } catch (error) {
      console.error('Error sending quote request:', error);
      alert('There was an error sending your quote request. Please try again later.');
    }
  };

  return (
    <section className="py-20 bg-muted">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left Content */}
          <div>
            <div className="inline-flex items-center space-x-2 bg-white rounded-full px-4 py-2 mb-6 premium-shadow">
              <Icon name="Calculator" size={16} className="text-cosmic-depth" />
              <span className="text-cosmic-depth font-medium text-sm">Instant Quote</span>
            </div>
            
            <h2 className="text-4xl lg:text-5xl font-bold text-cosmic-depth mb-6">
              Get Your Custom Quote
            </h2>
            
            <p className="text-xl text-text-refined mb-8 leading-relaxed">
              Receive an instant estimate for your PSV transportation needs. 
              Our intelligent pricing system considers all your requirements to provide 
              accurate, competitive quotes.
            </p>

            {/* Benefits */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center">
                  <Icon name="Clock" size={16} className="text-success" />
                </div>
                <span className="text-text-charcoal">Instant pricing estimates</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center">
                  <Icon name="Shield" size={16} className="text-success" />
                </div>
                <span className="text-text-charcoal">No hidden fees or charges</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center">
                  <Icon name="Users" size={16} className="text-success" />
                </div>
                <span className="text-text-charcoal">Dedicated account management</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center">
                  <Icon name="Phone" size={16} className="text-success" />
                </div>
                <span className="text-text-charcoal">24/7 customer support</span>
              </div>
            </div>
          </div>

          {/* Right Form */}
          <div className="bg-white rounded-2xl p-8 premium-shadow">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Service Type */}
              <div>
                <Select
                  label="Service Type"
                  placeholder="Select service type"
                  options={serviceTypes}
                  value={formData.serviceType}
                  onChange={(value) => handleInputChange('serviceType', value)}
                  required
                />
              </div>

              {/* Group Size */}
              <div>
                <Select
                  label="Group Size"
                  placeholder="Select group size"
                  options={groupSizes}
                  value={formData.groupSize}
                  onChange={(value) => handleInputChange('groupSize', value)}
                  required
                />
              </div>

              {/* Pickup Location */}
              <div>
                <Input
                  type="text"
                  label="Pickup Location"
                  placeholder="Enter pickup address"
                  value={formData.pickupLocation}
                  onChange={(e) => handleInputChange('pickupLocation', e.target.value)}
                  required
                />
              </div>

              {/* Destination */}
              <div>
                <Input
                  type="text"
                  label="Destination"
                  placeholder="Enter destination address"
                  value={formData.destination}
                  onChange={(e) => handleInputChange('destination', e.target.value)}
                  required
                />
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="date"
                  label="Service Date"
                  value={formData.serviceDate}
                  onChange={(e) => handleInputChange('serviceDate', e.target.value)}
                  required
                />
                <Input
                  type="time"
                  label="Service Time"
                  value={formData.serviceTime}
                  onChange={(e) => handleInputChange('serviceTime', e.target.value)}
                  required
                />
              </div>

              {/* Duration */}
              <div>
                <Select
                  label="Service Duration"
                  placeholder="Select duration"
                  options={durations}
                  value={formData.duration}
                  onChange={(value) => handleInputChange('duration', value)}
                  required
                />
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="text"
                  label="Contact Name"
                  placeholder="Your full name"
                  value={formData.contactName}
                  onChange={(e) => handleInputChange('contactName', e.target.value)}
                  required
                />
                <Input
                  type="text"
                  label="Company"
                  placeholder="Your company name"
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="email"
                  label="Email Address"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
                <Input
                  type="tel"
                  label="Phone Number"
                  placeholder="+2547244440293"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  required
                />
              </div>

              {/* Special Requirements */}
              <div>
                <Input
                  type="textarea"
                  label="Special Requirements"
                  placeholder="Any special requirements or notes"
                  value={formData.specialRequirements}
                  onChange={(e) => handleInputChange('specialRequirements', e.target.value)}
                />
              </div>

              {/* Estimated Price Display */}
              {estimatedPrice && (
                <div className="bg-cosmic-depth/5 rounded-lg p-4 text-center">
                  <p className="text-sm text-cosmic-depth font-medium mb-1">Estimated Price Range</p>
                  <p className="text-2xl font-bold text-cosmic-depth">
                    KSH {estimatedPrice.toLocaleString()} - KSH {Math.round(estimatedPrice * 1.2).toLocaleString()}
                  </p>
                  <p className="text-xs text-text-refined mt-1">
                    Final price may vary based on specific requirements
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <div>
                <Button
                  type="submit"
                  size="lg"
                  fullWidth
                  iconName="Send"
                  iconPosition="right"
                  className="bg-cosmic-depth hover:bg-cosmic-depth/90"
                >
                  Request Detailed Quote
                </Button>
                
                <p className="text-xs text-text-refined text-center mt-3">
                  You'll receive a detailed quote within 2 hours during business hours
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default QuoteRequest;