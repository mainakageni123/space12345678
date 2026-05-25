import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';

function useQuery() {
  const { search } = useLocation();
  return React.useMemo(() => new URLSearchParams(search), [search]);
}

const MpesaPay = () => {
  const query = useQuery();
  const pickupDate = query.get('pickupDate') || '';
  const returnDate = query.get('returnDate') || '';
  const vehicle = query.get('vehicle') || '';
  const phone = query.get('phone') || '';

  const simulatePayment = () => {
    try {
      const payments = JSON.parse(localStorage.getItem('payments') || '[]');
      const tx = {
        id: `TX-${Date.now()}`,
        pickupDate,
        returnDate,
        vehicle,
        phone,
        status: 'success',
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem('payments', JSON.stringify([...payments, tx]));
      alert('M-Pesa payment simulated as SUCCESS. We will contact you shortly.');
    } catch (e) {
      console.error('Payment storage failed', e);
      alert('Could not record payment.');
    }
  };

  return (
    <div className="min-h-screen bg-surface-premium">
      <Header />
      <main className="max-w-3xl mx-auto px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl premium-shadow p-8 space-y-6">
          <h1 className="text-3xl font-bold text-cosmic-depth">M-Pesa Payment</h1>
          <p className="text-text-refined">Confirm your booking details and proceed to pay.</p>

          <div className="rounded-xl border border-border p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-text-refined">Pickup Date</div>
                <div className="text-cosmic-depth font-medium">{pickupDate || '—'}</div>
              </div>
              <div>
                <div className="text-text-refined">Return Date</div>
                <div className="text-cosmic-depth font-medium">{returnDate || '—'}</div>
              </div>
              <div>
                <div className="text-text-refined">Vehicle</div>
                <div className="text-cosmic-depth font-medium">{vehicle || '—'}</div>
              </div>
              <div>
                <div className="text-text-refined">Phone</div>
                <div className="text-cosmic-depth font-medium">{phone || '—'}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button
              variant="default"
              iconName="Smartphone"
              className="bg-[#00A859] hover:bg-[#008F4D] text-white"
              onClick={simulatePayment}
            >
              Pay Now
            </Button>
            <a href={`tel:${phone || '0724440293'}`}>
              <Button variant="outline" iconName="Phone" className="border-cosmic-depth text-cosmic-depth hover:bg-cosmic-depth hover:text-white" asChild>
                <span>Call Us</span>
              </Button>
            </a>
            <Link to="/instant-booking-flow">
              <Button variant="outline" iconName="ArrowLeft" className="border-border text-text-refined hover:bg-cosmic-silver/50" asChild>
                <span>Back</span>
              </Button>
            </Link>
          </div>

          <div className="text-xs text-text-refined">
            Note: This is a demo payment screen. For live M‑Pesa STK push integration, we will connect to your backend API.
          </div>
        </div>
      </main>
    </div>
  );
};

export default MpesaPay;
