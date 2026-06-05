import React, { useEffect, useState } from 'react';
import Icon from '../AppIcon';
import Button from '../ui/Button';
import { initiateMpesaPayment } from '../../config/mpesaPayment';

const formatPhoneDisplay = (value) => {
  let cleaned = String(value || '').replace(/\D/g, '');
  if (cleaned.startsWith('254')) cleaned = cleaned.slice(3);
  if (cleaned.startsWith('0')) cleaned = cleaned.slice(1);
  cleaned = cleaned.slice(0, 9);
  if (!cleaned) return '';
  if (cleaned.length >= 6) {
    return `0${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`.trim();
  }
  if (cleaned.length >= 3) return `0${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
  return `0${cleaned}`;
};

// Strip formatting to raw digits for validation and submission
const stripPhone = (value) => String(value || '').replace(/\D/g, '');

const isValidKenyanPhone = (phone) => {
  const cleaned = stripPhone(phone);
  return cleaned.length === 10 && cleaned.startsWith('0') && (cleaned.startsWith('07') || cleaned.startsWith('01'));
};

/**
 * Inline M-Pesa pay section for post-booking confirmation (all services).
 * API: implement src/config/mpesaPayment.js
 */
const BookingMpesaPay = ({
  amount = 0,
  defaultPhone = '',
  accountReference = '',
  bookingId = '',
  bookingType = 'vehicle',
  serviceName = 'Booking',
  customerName = '',
  variant = 'light',
  allowAmountEntry = false,
  onSuccess
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState('');

  const isDark = variant === 'dark';
  const resolvedAmount = Number(allowAmountEntry ? payAmount : amount) || 0;

  useEffect(() => {
    setPhoneNumber(formatPhoneDisplay(defaultPhone));
    setPayAmount(amount > 0 ? String(amount) : '');
    setStatus(null);
    setError('');
  }, [defaultPhone, amount, bookingId]);

  const handlePay = async () => {
    if (!isValidKenyanPhone(phoneNumber)) {
      setError('Enter a valid M-Pesa number (e.g. 0712 345 678)');
      return;
    }
    if (resolvedAmount <= 0) {
      setError('Enter the amount to pay in KES');
      return;
    }

    setLoading(true);
    setError('');
    setStatus(null);

    try {
      const result = await initiateMpesaPayment({
        phoneNumber: stripPhone(phoneNumber),
        amount: resolvedAmount,
        accountReference: accountReference || `BOOKING_${bookingId || Date.now()}`,
        bookingId,
        bookingType,
        serviceName,
        customerName
      });

      if (result.success) {
        setStatus({ type: 'success', message: result.message || 'Payment received. Thank you!' });
        if (onSuccess) onSuccess(result);
      } else if (result.pending) {
        setStatus({
          type: 'pending',
          message:
            result.message ||
            'Check your phone for the M-Pesa prompt. If nothing appears, your STK API may still need to be connected.'
        });
      } else {
        setError(result.message || 'Could not start M-Pesa payment.');
      }
    } catch (err) {
      setError(err.message || 'Payment request failed.');
    } finally {
      setLoading(false);
    }
  };

  const boxClass = isDark
    ? 'bg-gray-800/80 border-gray-600'
    : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200';
  const labelClass = isDark ? 'text-gray-300' : 'text-gray-700';
  const mutedClass = isDark ? 'text-gray-400' : 'text-gray-600';
  const inputClass = isDark
    ? 'bg-gray-900 border-gray-600 text-white placeholder:text-gray-500 focus:ring-green-500'
    : 'bg-white border-gray-300 text-gray-900 focus:ring-green-500';

  return (
    <div className={`rounded-xl border p-4 sm:p-5 space-y-4 ${boxClass}`}>
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-green-500/20' : 'bg-green-100'}`}>
          <Icon name="Smartphone" className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-700'}`} />
        </div>
        <div>
          <h3 className={`font-semibold text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Pay directly with M-Pesa
          </h3>
          <p className={`text-sm mt-0.5 ${mutedClass}`}>
            Enter your Safaricom number. You will get an STK push on your phone to enter your PIN.
          </p>
        </div>
      </div>

      <div className={`text-center py-3 rounded-lg ${isDark ? 'bg-gray-900/60' : 'bg-white/80'}`}>
        <p className={`text-xs uppercase tracking-wide font-medium ${mutedClass}`}>Amount to pay</p>
        {allowAmountEntry ? (
          <input
            type="number"
            min="1"
            value={payAmount}
            onChange={(e) => setPayAmount(e.target.value)}
            placeholder="KES"
            className={`mt-1 w-full max-w-[200px] mx-auto block text-center text-2xl font-bold rounded-lg border px-3 py-2 ${inputClass}`}
          />
        ) : (
          <p className={`text-2xl sm:text-3xl font-bold mt-1 ${isDark ? 'text-green-400' : 'text-green-700'}`}>
            KES {resolvedAmount.toLocaleString()}
          </p>
        )}
        {serviceName && (
          <p className={`text-xs mt-1 ${mutedClass}`}>{serviceName}</p>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className={`block text-sm font-medium ${labelClass}`}>M-Pesa phone number</label>
          <button
            type="button"
            onClick={() => { setPhoneNumber(''); setError(''); }}
            className={`text-xs underline ${mutedClass} hover:opacity-70`}
            disabled={loading}
          >
            Clear
          </button>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon name="Phone" className={`w-4 h-4 ${mutedClass}`} />
          </div>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => {
              // Allow free typing — no live formatting so cursor stays put
              setPhoneNumber(e.target.value);
              setError('');
            }}
            placeholder="07XX XXX XXX"
            className={`block w-full pl-10 pr-3 py-3 rounded-lg border text-base focus:ring-2 focus:border-transparent ${inputClass}`}
            disabled={loading}
            maxLength={15}
          />
        </div>
      </div>

      {error && (
        <p className={`text-sm flex items-start gap-2 ${isDark ? 'text-red-400' : 'text-red-700'}`}>
          <Icon name="AlertCircle" size={16} className="flex-shrink-0 mt-0.5" />
          {error}
        </p>
      )}

      {status && (
        <p
          className={`text-sm flex items-start gap-2 ${
            status.type === 'success'
              ? isDark
                ? 'text-green-400'
                : 'text-green-800'
              : isDark
                ? 'text-amber-300'
                : 'text-amber-800'
          }`}
        >
          <Icon name={status.type === 'success' ? 'CheckCircle' : 'Info'} size={16} className="flex-shrink-0 mt-0.5" />
          {status.message}
        </p>
      )}

      <Button
        type="button"
        variant="default"
        fullWidth
        disabled={loading}
        onClick={handlePay}
        className="bg-[#00A859] hover:bg-[#008F4D] text-white font-semibold py-3 rounded-xl"
        iconName="Smartphone"
        iconPosition="left"
      >
        {loading ? 'Sending M-Pesa request…' : 'Pay Now'}
      </Button>

      <p className={`text-[11px] text-center leading-relaxed ${mutedClass}`}>
        Lipa na M-Pesa · Secure STK push · Ref: {accountReference || bookingId || 'pending'}
      </p>
    </div>
  );
};

export default BookingMpesaPay;
