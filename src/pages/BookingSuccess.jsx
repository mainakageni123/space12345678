import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Header from '../components/ui/Header';
import Button from '../components/ui/Button';
import Icon from '../components/AppIcon';

const BookingSuccess = () => {
  const { state } = useLocation();
  const bookingId = state?.bookingId || 'N/A';
  const amount = state?.amount || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 animate-bounce">
              <Icon name="CheckCircle" className="w-12 h-12 text-white" />
            </div>
          </div>

          {/* Success Message */}
          <div className="text-center space-y-3">
            <h1 className="text-3xl font-bold text-gray-900">
              🎉 Payment Successful!
            </h1>
            <p className="text-lg text-gray-600">
              Your booking has been confirmed and payment received.
            </p>
          </div>

          {/* Payment Details */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">Payment Details</h2>
            <div className="space-y-2 text-gray-700">
              <p className="flex justify-between">
                <span className="font-medium">Booking ID:</span>
                <span className="font-mono text-sm">{bookingId}</span>
              </p>
              <p className="flex justify-between">
                <span className="font-medium">Amount Paid:</span>
                <span className="text-green-600 font-bold">KES {Number(amount).toLocaleString()}</span>
              </p>
              <p className="flex justify-between">
                <span className="font-medium">Payment Method:</span>
                <span>M-Pesa</span>
              </p>
              <p className="flex justify-between">
                <span className="font-medium">Status:</span>
                <span className="text-green-600 font-semibold">✓ Confirmed</span>
              </p>
            </div>
          </div>

          {/* What's Next */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">📋 What's Next?</h2>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <Icon name="CheckCircle2" className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>You'll receive a confirmation SMS shortly</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="CheckCircle2" className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Our team will contact you within 24 hours</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="CheckCircle2" className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Check your email for booking details</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <Link to="/fleet-discovery">
              <Button variant="outline" fullWidth>
                <Icon name="Car" className="w-5 h-5 mr-2" />
                Browse More Vehicles
              </Button>
            </Link>
            <Link to="/">
              <Button variant="default" fullWidth className="bg-green-600 hover:bg-green-700">
                <Icon name="Home" className="w-5 h-5 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>

          {/* Contact Support */}
          <div className="text-center text-sm text-gray-500 border-t pt-6">
            <p>Need help? Contact us:</p>
            <div className="flex justify-center gap-4 mt-2">
              <a href="tel:+254724440293" className="text-blue-600 hover:underline">
                📞 Call Us
              </a>
              <a href="https://wa.me/254724440293" target="_blank" rel="noreferrer" className="text-green-600 hover:underline">
                💬 WhatsApp
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BookingSuccess;
