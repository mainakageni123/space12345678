import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Header from '../components/ui/Header';
import Button from '../components/ui/Button';
import Icon from '../components/AppIcon';
import BookingMpesaPay from '../components/booking/BookingMpesaPay';
import { API_BASE_URL } from '../config/api';

const BookingSuccess = () => {
  const { state } = useLocation();
  const bookingId = state?.bookingId;
  const [booking, setBooking] = useState(state?.booking || null);

  useEffect(() => {
    if (!bookingId) return;

    const load = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/bookings/${bookingId}`);
        const data = await res.json();
        if (data.success && data.booking) setBooking(data.booking);
      } catch {
        /* use state fallback */
      }
    };

    load();
    const interval = setInterval(load, 8000);
    return () => clearInterval(interval);
  }, [bookingId]);

  const isPaid = booking?.paymentStatus === 'paid' || booking?.status === 'confirmed';
  const isApproved = booking?.status === 'approved' || isPaid;
  const canPay = !isPaid && booking?.paymentStatus !== 'paid'; // Allow immediate payment without waiting for approval
  const amount = booking?.vehiclePrice || state?.amount || 0;

  if (isPaid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <Header />
        <main className="max-w-2xl mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                <Icon name="CheckCircle" className="w-12 h-12 text-white" />
              </div>
            </div>
            <div className="text-center space-y-3">
              <h1 className="text-3xl font-bold text-gray-900">Payment Successful!</h1>
              <p className="text-lg text-gray-600">Your booking is confirmed.</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 space-y-2 text-gray-700">
              <p className="flex justify-between">
                <span className="font-medium">Booking ID:</span>
                <span className="font-mono text-sm">{bookingId}</span>
              </p>
              <p className="flex justify-between">
                <span className="font-medium">Amount Paid:</span>
                <span className="text-green-600 font-bold">KES {Number(amount).toLocaleString()}</span>
              </p>
              {booking?.mpesaReceiptNumber && (
                <p className="flex justify-between">
                  <span className="font-medium">M-Pesa Receipt:</span>
                  <span className="font-mono text-sm">{booking.mpesaReceiptNumber}</span>
                </p>
              )}
            </div>
            <Link to="/">
              <Button variant="default" fullWidth className="bg-green-600 hover:bg-green-700">
                Back to Home
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-blue-50">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center">
              <Icon name="Clock" className="w-12 h-12 text-amber-600" />
            </div>
          </div>

          <div className="text-center space-y-3">
            <h1 className="text-3xl font-bold text-gray-900">Booking Submitted</h1>
            {!isApproved ? (
              <p className="text-lg text-gray-600">
                Your booking is pending admin approval. You will receive a WhatsApp message when it is
                approved, then you can pay via M-Pesa.
              </p>
            ) : (
              <p className="text-lg text-gray-600">
                Your booking was approved. Complete payment below with M-Pesa.
              </p>
            )}
          </div>

          {bookingId && (
            <p className="text-center text-sm text-gray-500 font-mono">Ref: {bookingId}</p>
          )}

          {canPay && bookingId && (
            <BookingMpesaPay
              amount={amount}
              defaultPhone={booking?.phoneNumber || ''}
              accountReference={`BK_${String(bookingId).slice(-8)}`}
              bookingId={bookingId}
              bookingType="vehicle"
              serviceName={booking?.vehicleName || 'Car hire'}
              customerName={`${booking?.firstName || ''} ${booking?.lastName || ''}`.trim()}
              onSuccess={() => {
                setBooking((b) => (b ? { ...b, paymentStatus: 'paid', status: 'confirmed' } : b));
              }}
            />
          )}

          {isApproved && !canPay && booking?.paymentStatus === 'pending' && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-blue-800 text-sm">
              M-Pesa prompt sent to your phone. Enter your PIN to complete payment.
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {bookingId && (
              <Link to={`/mpesa-pay?bookingId=${bookingId}`}>
                <Button variant="default" fullWidth className="bg-[#00A859] hover:bg-[#008F4D] text-white">
                  Pay Now
                </Button>
              </Link>
            )}
            <Link to="/">
              <Button variant="ghost" fullWidth>
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BookingSuccess;
