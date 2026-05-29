import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import MpesaPayment from '../../components/MpesaPayment';
import { API_BASE_URL } from '../../config/api';

function useQuery() {
  const { search } = useLocation();
  return React.useMemo(() => new URLSearchParams(search), [search]);
}

const MpesaPay = () => {
  const query = useQuery();
  const bookingId = query.get('bookingId') || '';
  const [booking, setBooking] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [paid, setPaid] = useState(false);

  const pickupDate = query.get('pickupDate') || '';
  const returnDate = query.get('returnDate') || '';
  const vehicle = query.get('vehicle') || '';
  const phone = query.get('phone') || '';

  useEffect(() => {
    if (!bookingId) return;

    const load = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/bookings/${bookingId}`);
        const data = await res.json();
        if (!data.success) {
          setLoadError(data.error || 'Booking not found');
          return;
        }
        setBooking(data.booking);
        if (data.booking.paymentStatus === 'paid') setPaid(true);
      } catch (e) {
        setLoadError('Could not load booking');
      }
    };

    load();
  }, [bookingId]);

  const amount = booking?.vehiclePrice || Number(query.get('amount')) || 0;
  const displayVehicle = booking?.vehicleName || vehicle || 'Your booking';
  const displayPhone = booking?.phoneNumber || phone;
  const accountRef = bookingId ? `BK_${bookingId.slice(-8)}` : 'SpaceBorne';

  const needsApproval = false; // Direct payments do not need to wait for admin approval

  return (
    <div className="min-h-screen bg-surface-premium">
      <Header />
      <main className="max-w-3xl mx-auto px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl premium-shadow p-8 space-y-6">
          <h1 className="text-3xl font-bold text-cosmic-depth">M-Pesa Payment</h1>

          {loadError && (
            <p className="text-red-600 text-sm">{loadError}</p>
          )}

          {paid ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-green-800">
              <p className="font-semibold">Payment already received for this booking.</p>
              {booking?.mpesaReceiptNumber && (
                <p className="text-sm mt-2">Receipt: {booking.mpesaReceiptNumber}</p>
              )}
              <Link to="/booking-success" state={{ bookingId, amount }} className="inline-block mt-4">
                <Button variant="default">View confirmation</Button>
              </Link>
            </div>
          ) : needsApproval ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-amber-900">
              <p className="font-semibold">Waiting for admin approval</p>
              <p className="text-sm mt-2">
                You will get a WhatsApp message when your booking is approved. Then return here to pay
                via M-Pesa, or use the STK push sent to your phone.
              </p>
            </div>
          ) : (
            <>
              <p className="text-text-refined">
                Pay for <strong>{displayVehicle}</strong> — KES {Number(amount).toLocaleString()}
              </p>

              <div className="rounded-xl border border-border p-4 text-sm space-y-2">
                {pickupDate && <p>Pickup: {pickupDate}</p>}
                {returnDate && <p>Return: {returnDate}</p>}
                {displayPhone && <p>Phone: {displayPhone}</p>}
                {bookingId && <p className="font-mono text-xs">Booking: {bookingId}</p>}
              </div>

              <MpesaPayment
                amount={amount}
                accountReference={accountRef}
                bookingId={bookingId || undefined}
                onSuccess={() => setPaid(true)}
                onCancel={() => {}}
              />
            </>
          )}

          <div className="flex gap-3">
            <Link to="/fleet-discovery">
              <Button variant="outline" iconName="ArrowLeft">
                Back to fleet
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MpesaPay;
