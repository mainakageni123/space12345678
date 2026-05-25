import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/ui/Header';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const BookingConfirmation = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white shadow-sm rounded-xl p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Icon name="CheckCircle" className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">
            Booking Request Received!
          </h1>
          
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Thank you for your booking request. We will contact you shortly to confirm your reservation and provide further details.
          </p>
          
          <div className="space-y-4">
            <Button
              variant="primary"
              className="w-full"
              onClick={() => navigate('/')}
            >
              Return to Home
            </Button>
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => navigate('/fleet-discovery')}
            >
              Browse More Vehicles
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BookingConfirmation;