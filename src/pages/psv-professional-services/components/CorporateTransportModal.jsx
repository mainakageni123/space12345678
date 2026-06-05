import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { API_BASE_URL } from '../../../config/api';
import PsvModalShell, { PsvInput, psvInputClass, DarkSelect } from './PsvModalShell';
import { getPsvBookingErrorMessage } from '../utils/psvBookingErrors';

const DURATION_OPTIONS = [
  { value: '1-week', label: '1 week' },
  { value: '1-month', label: '1 month' },
  { value: '3-months', label: '3 months' },
  { value: 'ongoing', label: 'Ongoing' }
];

const ToggleGroup = ({ label, value, onChange, options }) => (
  <div>
    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">{label}</p>
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`flex-1 min-w-[calc(50%-4px)] sm:min-w-[80px] py-3 px-3 rounded-lg text-sm font-semibold border transition-all ${
            value === opt.value
              ? 'bg-cyan-600 border-cyan-500 text-white'
              : 'bg-gray-800 border-gray-600 text-gray-200 hover:border-gray-500'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  </div>
);

const CorporateTransportModal = ({ isOpen, onClose }) => {
  const [form, setForm] = useState({
    fullName: '',
    secondContact: '',
    phoneNumber: '',
    email: '',
    dailyPickup: '',
    dailyDropoff: '',
    startDate: '',
    scheduleDuration: '',
    preferredDays: 'weekdays',
    departureTime: 'morning',
    companyName: '',
    additionalNotes: ''
  });
  const [consentGiven, setConsentGiven] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!consentGiven) {
      setError('You must agree to the data privacy terms before submitting.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/psv-bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceType: 'corporate', ...form, consentGiven })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(getPsvBookingErrorMessage(res, data));
      }
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSuccess(false);
    setError('');
    onClose();
  };

  const dateInputClass = `${psvInputClass} [color-scheme:dark]`;

  return (
    <PsvModalShell
      isOpen={isOpen}
      onClose={handleClose}
      title="Corporate & Personal"
      badge="Corporate & Personal"
      badgeClass="bg-stellar-gold/20 text-stellar-gold border-stellar-gold/30"
      success={success}
      successTitle="Seat reserved"
      successMessage="Guaranteed confirmation within 2 hours. Same driver assigned daily."
      onSuccessClose={handleClose}
      footer={
        !success && (
          <>
            {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
            <Button
              type="submit"
              form="corporate-transport-form"
              disabled={loading}
              className="w-full bg-adventure-orange hover:bg-adventure-orange/90 py-3.5 flex items-center justify-center gap-2 text-white font-semibold"
            >
              {loading ? 'Submitting...' : 'Reserve my seat'}
              {!loading && <Icon name="ArrowUpRight" size={16} />}
            </Button>
            <p className="text-center text-xs text-gray-500 mt-2">
              Guaranteed confirmation within 2 hours. Same driver assigned daily.
            </p>
          </>
        )
      }
    >
      <form id="corporate-transport-form" onSubmit={handleSubmit} className="space-y-5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-3">Contact details</p>
          <div className="space-y-3">
            <PsvInput label="Full name *" value={form.fullName} onChange={(e) => set('fullName', e.target.value)} required className={psvInputClass} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <PsvInput label="Emergency contact *" value={form.secondContact} onChange={(e) => set('secondContact', e.target.value)} required className={psvInputClass} />
              <PsvInput label="Mobile number *" value={form.phoneNumber} onChange={(e) => set('phoneNumber', e.target.value)} required placeholder="+254 7XX XXX XXX" className={psvInputClass} />
            </div>
            <PsvInput label="Email address *" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required className={psvInputClass} />
          </div>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-3">Route details</p>
          <div className="space-y-3">
            <PsvInput label="Daily pick up location *" value={form.dailyPickup} onChange={(e) => set('dailyPickup', e.target.value)} required placeholder="e.g. Kilimani, Nairobi" className={psvInputClass} />
            <PsvInput label="Daily drop off location *" value={form.dailyDropoff} onChange={(e) => set('dailyDropoff', e.target.value)} required placeholder="e.g. Upper Hill, Nairobi" className={psvInputClass} />
          </div>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-3">Schedule</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <PsvInput label="Start date *" type="date" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} required className={dateInputClass} />
            <DarkSelect label="Duration *" options={DURATION_OPTIONS} value={form.scheduleDuration} onChange={(v) => set('scheduleDuration', v)} placeholder="Select duration" required />
          </div>
        </div>

        <ToggleGroup
          label="Preferred days"
          value={form.preferredDays}
          onChange={(v) => set('preferredDays', v)}
          options={[
            { value: 'weekdays', label: 'Weekdays' },
            { value: 'daily', label: 'Daily' },
            { value: 'custom', label: 'Custom' }
          ]}
        />

        <ToggleGroup
          label="Departure time"
          value={form.departureTime}
          onChange={(v) => set('departureTime', v)}
          options={[
            { value: 'morning', label: 'Morning' },
            { value: 'evening', label: 'Evening' }
          ]}
        />

        <PsvInput label="Company name (optional)" value={form.companyName} onChange={(e) => set('companyName', e.target.value)} placeholder="Your organization" className={psvInputClass} />

        <div>
          <label className="text-sm font-medium text-gray-300 mb-1.5 block">Additional notes</label>
          <textarea
            value={form.additionalNotes}
            onChange={(e) => set('additionalNotes', e.target.value)}
            placeholder="Any special requirements or preferences..."
            rows={3}
            className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 min-h-[80px]"
          />
        </div>

        {/* Kenya DPA 2019 consent */}
        <div className="flex items-start gap-3 rounded-lg border border-gray-700 bg-gray-800/60 p-3">
          <input
            id="corporate-consent"
            type="checkbox"
            checked={consentGiven}
            onChange={(e) => setConsentGiven(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-cyan-500 cursor-pointer flex-shrink-0"
          />
          <label htmlFor="corporate-consent" className="text-xs text-gray-400 leading-relaxed cursor-pointer">
            I consent to SpaceBorne collecting and processing my personal data (name, phone, email,
            route details) to arrange corporate transport services, in accordance with the{' '}
            <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline hover:text-cyan-300">
              Privacy Policy
            </a>{' '}
            and the Kenya Data Protection Act 2019.
          </label>
        </div>
      </form>
    </PsvModalShell>
  );
};

export default CorporateTransportModal;
