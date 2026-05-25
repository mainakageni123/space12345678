import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import { useNavigate } from 'react-router-dom';

const BookingWidget = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    location: '',
    startDate: '',
    endDate: '',
    type: 'Sedan'
  });

  const setField = (name, value) => setForm(prev => ({ ...prev, [name]: value }));
  const canSearch = form.location && form.startDate && form.endDate;

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-2xl premium-shadow p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto -mt-16 sm:-mt-20 relative z-30">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Pick-up Location</label>
          <input
            type="text"
            placeholder="e.g., Nairobi"
            value={form.location}
            onChange={e => setField('location', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cosmic-depth"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
          <input
            type="date"
            value={form.startDate}
            onChange={e => setField('startDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cosmic-depth"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
          <input
            type="date"
            value={form.endDate}
            onChange={e => setField('endDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cosmic-depth"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
          <select
            value={form.type}
            onChange={e => setField('type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cosmic-depth"
          >
            <option>Sedan</option>
            <option>SUV</option>
            <option>Van</option>
            <option>Luxury</option>
          </select>
        </div>
      </div>

      <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="text-sm text-gray-600">
          <span className="hidden sm:inline">Flexible with dates?</span> Get better rates on weekdays.
        </div>
        <Button
          variant="default"
          iconName="Search"
          className={`w-full sm:w-auto ${canSearch ? 'bg-cosmic-depth hover:bg-cosmic-depth/90' : 'bg-gray-300 cursor-not-allowed'}`}
          disabled={!canSearch}
          onClick={() => navigate('/fleet-discovery', { state: { filters: form } })}
        >
          <span className="flex items-center gap-2">
            <Icon name="Search" />
            Search Vehicles
          </span>
        </Button>
      </div>
    </div>
  );
};

export default BookingWidget;