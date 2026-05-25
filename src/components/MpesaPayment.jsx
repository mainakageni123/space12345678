import React, { useState } from 'react';
import { API_BASE_URL } from '../config/api';
import Icon from './AppIcon';
import Button from './ui/Button';

const MpesaPayment = ({ amount, accountReference, onSuccess, onCancel }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkoutRequestId, setCheckoutRequestId] = useState('');
  const [showPinPrompt, setShowPinPrompt] = useState(false);

  const formatPhoneNumber = (value) => {
    // Remove all non-digits
    let cleaned = value.replace(/\D/g, '');
    
    // Allow empty input
    if (cleaned.length === 0) {
      return '';
    }
    
    // Handle different formats (remove prefixes)
    if (cleaned.startsWith('254')) {
      cleaned = cleaned.substring(3);
    } else if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }
    
    // Limit to 9 digits (after removing leading 0)
    cleaned = cleaned.substring(0, 9);
    
    // Don't format if empty after cleanup
    if (cleaned.length === 0) {
      return '';
    }
    
    // Add formatting with 0 prefix
    if (cleaned.length >= 6) {
      return `0${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6)}`.trim();
    } else if (cleaned.length >= 3) {
      return `0${cleaned.substring(0, 3)} ${cleaned.substring(3)}`;
    } else {
      return `0${cleaned}`;
    }
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
    setError('');
  };

  const validatePhoneNumber = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    // Should be exactly 9 digits after removing leading 0
    if (cleaned.length !== 10 || !cleaned.startsWith('0')) {
      return false;
    }
    // Should start with 07 or 01
    return cleaned.startsWith('07') || cleaned.startsWith('01');
  };

  const handlePayment = async () => {
    // Validate phone number
    if (!phoneNumber.trim()) {
      setError('Please enter your phone number');
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      setError('Please enter a valid phone number (e.g., 0712345678)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/mpesa/stkpush`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber.replace(/\s/g, ''),
          amount: amount,
          accountReference: accountReference || 'SpaceBorne',
          transactionDesc: `Payment for ${accountReference || 'booking'}`
        })
      });

      const data = await response.json();

      if (data.success) {
        setCheckoutRequestId(data.data.CheckoutRequestID);
        setShowPinPrompt(true);
        
        // Poll for payment status
        pollPaymentStatus(data.data.CheckoutRequestID);
      } else {
        const errorMessage = data.message || data.error || 'Failed to initiate payment';
        console.error('Payment initiation failed:', data);
        setError(errorMessage + '. Please check your M-Pesa credentials or try again later.');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError('Failed to connect to payment service. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const pollPaymentStatus = async (checkoutId) => {
    let attempts = 0;
    const maxAttempts = 20; // Poll for 20 seconds (20 * 1000ms)

    const pollInterval = setInterval(async () => {
      attempts++;

      try {
        const response = await fetch(`${API_BASE_URL}/mpesa/query`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            checkoutRequestId: checkoutId
          })
        });

        const data = await response.json();

        if (data.success) {
          const { ResultCode, ResultDesc } = data.data;

          // ResultCode 0 means success
          if (ResultCode === '0' || ResultCode === 0) {
            clearInterval(pollInterval);
            setShowPinPrompt(false);
            if (onSuccess) {
              onSuccess({
                checkoutRequestId: checkoutId,
                resultDesc: ResultDesc
              });
            }
          } else if (ResultCode !== '1032') {
            // Any result code other than 0 or 1032 (request in progress) means failure
            clearInterval(pollInterval);
            setShowPinPrompt(false);
            setError(ResultDesc || 'Payment failed. Please try again.');
          }
        }

        // Stop polling after max attempts
        if (attempts >= maxAttempts) {
          clearInterval(pollInterval);
          setShowPinPrompt(false);
          setError('Payment timeout. Please check your M-Pesa messages.');
        }
      } catch (err) {
        console.error('Poll error:', err);
      }
    }, 1000); // Poll every second
  };

  return (
    <div className="bg-white rounded-lg p-6 max-w-md w-full">
      {!showPinPrompt ? (
        <>
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Icon name="Smartphone" className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-center mb-2">Pay with M-Pesa</h2>
          <p className="text-gray-600 text-center mb-6">
            Enter your phone number to receive an STK push prompt
          </p>

          <div className="mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600 mb-1">Amount to Pay</p>
              <p className="text-3xl font-bold text-green-600">KES {amount?.toLocaleString()}</p>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              M-Pesa Phone Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon name="Phone" className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="tel"
                value={phoneNumber}
                onChange={handlePhoneChange}
                placeholder="0712 345 678"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg"
                disabled={loading}
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Enter the phone number registered with M-Pesa
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <Icon name="AlertCircle" className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handlePayment}
              disabled={loading || !phoneNumber}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <Icon name="CheckCircle" className="w-5 h-5 mr-2" />
                  Pay Now
                </>
              )}
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center animate-pulse">
              <Icon name="Smartphone" className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-center mb-2">Enter Your PIN</h2>
          <p className="text-gray-600 text-center mb-6">
            Check your phone for the M-Pesa prompt and enter your PIN to complete payment
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Icon name="Info" className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Waiting for confirmation...</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Check your phone for M-Pesa prompt</li>
                  <li>Enter your M-Pesa PIN</li>
                  <li>Amount: KES {amount?.toLocaleString()}</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <Icon name="AlertCircle" className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MpesaPayment;
