import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import BookingMpesaPay from '../../components/booking/BookingMpesaPay';
import { API_BASE_URL } from '../../config/api';
import { SUPPORT_TEL_URL, supportWhatsAppUrl } from '../../config/contact';

const Confirmation = () => {
  const { state } = useLocation();
  const bookingData = state?.bookingData || {};
  const bookingType = state?.bookingType || 'vehicle';
  const bookingId = bookingData._id;

  const [booking, setBooking] = useState(bookingData);

  useEffect(() => {
    if (!bookingId) return;
    const poll = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/bookings/${bookingId}`);
        const data = await res.json();
        if (data.success) setBooking(data.booking);
      } catch {
        /* ignore */
      }
    };
    poll();
    const t = setInterval(poll, 10000);
    return () => clearInterval(t);
  }, [bookingId]);

  const totalAmount =
    bookingType === 'adventure'
      ? Number(booking?.adventurePrice ?? bookingData.adventurePrice ?? 0)
      : Number(booking?.vehiclePrice ?? bookingData.vehiclePrice ?? 0);

  const displayName =
    bookingType === 'adventure'
      ? booking?.adventureTitle || bookingData.adventureTitle
      : `${booking?.vehicleMake || bookingData.vehicleMake || ''} ${booking?.vehicleModel || bookingData.vehicleModel || ''}`.trim() ||
        booking?.vehicleName ||
        bookingData.vehicleName;

  const isApproved = booking?.status === 'approved' || booking?.status === 'confirmed';
  const isPaid = booking?.paymentStatus === 'paid';
  const canPay = !isPaid && bookingType === 'vehicle' && bookingId; // Allow immediate payment without waiting for approval

  const waUrl = supportWhatsAppUrl(
    `Hi, I want to confirm my booking for ${displayName} worth KES ${totalAmount}.`
  );

  const formatPrice = (price) => `KES ${Number(price || 0).toLocaleString()}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white shadow-sm rounded-xl p-8 space-y-6">
          <h1 className="text-2xl font-semibold text-gray-900">Booking Created Successfully!</h1>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-amber-900 font-medium">
              {isPaid
                ? 'Payment received — your booking is confirmed.'
                : isApproved
                  ? 'Approved — complete M-Pesa payment below.'
                  : 'Pending admin approval. You will receive a WhatsApp message when approved.'}
            </p>
          </div>

          <div className="space-y-3 text-gray-700">
            <h2 className="text-lg font-semibold">Booking Details</h2>
            <p>
              <span className="font-medium">{bookingType === 'adventure' ? 'Adventure:' : 'Vehicle:'}</span>{' '}
              {displayName}
            </p>
            <p>
              <span className="font-medium">Amount:</span> {formatPrice(totalAmount)}
            </p>
            <p>
              <span className="font-medium">Customer:</span> {booking?.firstName} {booking?.lastName}
            </p>
            <p>
              <span className="font-medium">Phone:</span> {booking?.phoneNumber}
            </p>
            <p>
              <span className="font-medium">Status:</span>{' '}
              <span className="font-semibold text-amber-600">{(booking?.status || 'pending').toUpperCase()}</span>
            </p>
          </div>

          {canPay && (
            <BookingMpesaPay
              amount={totalAmount}
              defaultPhone={booking?.phoneNumber}
              bookingId={bookingId}
              accountReference={`BK_${String(bookingId).slice(-8)}`}
              serviceName={displayName}
              customerName={`${booking?.firstName} ${booking?.lastName}`}
              allowAmountEntry={true}
            />
          )}

          <div className="border-t pt-6 space-y-4">
            <h2 className="text-lg font-semibold">Need help?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a href={waUrl} target="_blank" rel="noreferrer">
                <Button variant="outline" fullWidth>
                  Text us on WhatsApp
                </Button>
              </a>
              <a href={SUPPORT_TEL_URL}>
                <Button variant="outline" fullWidth>
                  Call Us
                </Button>
              </a>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row gap-3">
            <Link to="/booking-success" state={{ bookingId, amount: totalAmount }}>
              <Button variant="ghost">Track booking status</Button>
            </Link>
            <Link to="/fleet-discovery">
              <Button variant="ghost">Back to Fleet</Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Confirmation;
