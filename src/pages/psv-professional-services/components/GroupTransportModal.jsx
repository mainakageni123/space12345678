import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { API_BASE_URL } from '../../../config/api';
import PsvModalShell, { PsvInput, psvInputClass, DarkSelect } from './PsvModalShell';
import { getPsvBookingErrorMessage } from '../utils/psvBookingErrors';

const GROUP_SIZE_OPTIONS = [
  { value: '8-12', label: '8 - 12 people' },
  { value: '13-20', label: '13 - 20 people' },
  { value: '21-35', label: '21 - 35 people' },
  { value: '36-55', label: '36 - 55 people' },
  { value: '55+', label: '55+ people' }
];

const TogglePair = ({ label, value, onChange, options }) => (
  <div>
    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">{label}</p>
    <div className="flex gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`flex-1 py-3 px-3 rounded-lg text-sm font-semibold border transition-all ${
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

const GroupTransportModal = ({ isOpen, onClose }) => {
  const [form, setForm] = useState({
    fullName: '',
    secondContact: '',
    phoneNumber: '',
    email: '',
    pickupLocation: '',
    dropoffLocation: '',
    travelDate: '',
    groupSize: '',
    tripDirection: 'one-way',
    additionalNotes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/psv-bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceType: 'group', ...form })
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
      title="Group transport"
      badge="8 - 15+ people"
      badgeClass="bg-green-500/20 text-green-400 border-green-500/30"
      success={success}
      successTitle="Request submitted"
      successMessage="We confirm within 2 hours with payment details and vehicle info."
      onSuccessClose={handleClose}
      footer={
        !success && (
          <>
            {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
            <Button
              type="submit"
              form="group-transport-form"
              disabled={loading}
              className="w-full bg-adventure-orange hover:bg-adventure-orange/90 py-3.5 flex items-center justify-center gap-2 text-white font-semibold"
            >
              {loading ? 'Submitting...' : 'Submit booking request'}
              {!loading && <Icon name="ArrowUpRight" size={16} />}
            </Button>
            <p className="text-center text-xs text-gray-500 mt-2">
              We confirm within 2 hours with payment details and vehicle info.
            </p>
          </>
        )
      }
    >
      <form id="group-transport-form" onSubmit={handleSubmit} className="space-y-5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-3">Contact details</p>
          <div className="space-y-3">
            <PsvInput
              label="Full name *"
              value={form.fullName}
              onChange={(e) => set('fullName', e.target.value)}
              required
              className={psvInputClass}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <PsvInput
                label="Second contact *"
                value={form.secondContact}
                onChange={(e) => set('secondContact', e.target.value)}
                required
                className={psvInputClass}
              />
              <PsvInput
                label="Mobile number *"
                value={form.phoneNumber}
                onChange={(e) => set('phoneNumber', e.target.value)}
                required
                placeholder="+254 7XX XXX XXX"
                className={psvInputClass}
              />
            </div>
            <PsvInput
              label="Email address *"
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              required
              className={psvInputClass}
            />
          </div>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-3">Trip details</p>
          <div className="space-y-3">
            <PsvInput
              label="Pick up location *"
              value={form.pickupLocation}
              onChange={(e) => set('pickupLocation', e.target.value)}
              required
              placeholder="e.g. Westlands, Nairobi"
              className={psvInputClass}
            />
            <PsvInput
              label="Drop off location *"
              value={form.dropoffLocation}
              onChange={(e) => set('dropoffLocation', e.target.value)}
              required
              placeholder="e.g. Maasai Mara, Narok"
              className={psvInputClass}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <PsvInput
                label="Travel date *"
                type="date"
                value={form.travelDate}
                onChange={(e) => set('travelDate', e.target.value)}
                required
                className={dateInputClass}
              />
              <DarkSelect
                label="Group size *"
                options={GROUP_SIZE_OPTIONS}
                value={form.groupSize}
                onChange={(v) => set('groupSize', v)}
                placeholder="Select group size"
                required
              />
            </div>
          </div>
        </div>

        <TogglePair
          label="Trip type"
          value={form.tripDirection}
          onChange={(v) => set('tripDirection', v)}
          options={[
            { value: 'one-way', label: 'One way' },
            { value: 'return', label: 'Return' }
          ]}
        />

        <div>
          <label className="text-sm font-medium text-gray-300 mb-1.5 block">Additional notes</label>
          <textarea
            value={form.additionalNotes}
            onChange={(e) => set('additionalNotes', e.target.value)}
            placeholder="Any special requirements or trip purpose..."
            rows={3}
            className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 min-h-[80px]"
          />
        </div>
      </form>
    </PsvModalShell>
  );
};

export default GroupTransportModal;
