import React, { useState } from 'react';
import MpesaPayment from '../components/MpesaPayment';
import Button from '../components/ui/Button';
import Icon from '../components/AppIcon';

/**
 * Example implementation of M-Pesa payment integration
 * This shows how to use the MpesaPayment component in your booking flow
 */
const PaymentExample = () => {
  const [showPayment, setShowPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);

  // Example booking data
  const bookingData = {
    bookingId: 'BOOK123456',
    vehicleName: 'Toyota Land Cruiser',
    amount: 5000,
    duration: '3 days'
  };

  const handlePaymentSuccess = (paymentData) => {
    console.log('Payment successful:', paymentData);
    setPaymentDetails(paymentData);
    setPaymentSuccess(true);
    setShowPayment(false);
    
    // TODO: Update booking status in your database
    // Example:
    // updateBookingPaymentStatus(bookingData.bookingId, {
    //   status: 'paid',
    //   checkoutRequestId: paymentData.checkoutRequestId,
    //   paidAt: new Date()
    // });
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Booking Summary Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Booking Summary</h2>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between">
              <span className="text-gray-600">Booking ID:</span>
              <span className="font-semibold">{bookingData.bookingId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Vehicle:</span>
              <span className="font-semibold">{bookingData.vehicleName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Duration:</span>
              <span className="font-semibold">{bookingData.duration}</span>
            </div>
            <div className="border-t pt-3 flex justify-between text-lg">
              <span className="text-gray-900 font-bold">Total Amount:</span>
              <span className="font-bold text-green-600">
                KES {bookingData.amount.toLocaleString()}
              </span>
            </div>
          </div>

          {!paymentSuccess ? (
            <Button
              variant="default"
              fullWidth
              onClick={() => setShowPayment(true)}
              className="bg-green-600 hover:bg-green-700 text-white py-3 text-lg"
            >
              <Icon name="Smartphone" className="w-5 h-5 mr-2" />
              Pay with M-Pesa
            </Button>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Icon name="CheckCircle" className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-green-900">Payment Successful!</h3>
                  <p className="text-sm text-green-700">
                    Your booking has been confirmed
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Payment Instructions */}
        {!paymentSuccess && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Icon name="Info" className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <h4 className="font-semibold mb-2">How M-Pesa Payment Works:</h4>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Click "Pay with M-Pesa" button</li>
                  <li>Enter your Safaricom phone number</li>
                  <li>Check your phone for M-Pesa prompt</li>
                  <li>Enter your M-Pesa PIN to complete payment</li>
                  <li>Wait for confirmation</li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* Success Details */}
        {paymentSuccess && paymentDetails && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4">Payment Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Transaction ID:</span>
                <span className="font-mono text-xs">
                  {paymentDetails.checkoutRequestId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="text-green-600 font-semibold">Completed</span>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                fullWidth
                onClick={() => window.print()}
              >
                <Icon name="Printer" className="w-4 h-4 mr-2" />
                Print Receipt
              </Button>
              <Button
                variant="default"
                fullWidth
                onClick={() => window.location.href = '/bookings'}
              >
                View My Bookings
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <MpesaPayment
            amount={bookingData.amount}
            accountReference={bookingData.bookingId}
            onSuccess={handlePaymentSuccess}
            onCancel={handlePaymentCancel}
          />
        </div>
      )}
    </div>
  );
};

export default PaymentExample;
