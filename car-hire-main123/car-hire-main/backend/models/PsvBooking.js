const mongoose = require('mongoose');

const PsvBookingSchema = new mongoose.Schema({
  serviceType: {
    type: String,
    required: true,
    enum: ['group', 'corporate']
  },
  serviceLabel: { type: String, default: '' },

  fullName: { type: String, required: true, trim: true },
  secondContact: { type: String, required: true, trim: true },
  phoneNumber: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },

  // Group transport
  pickupLocation: { type: String, trim: true },
  dropoffLocation: { type: String, trim: true },
  travelDate: { type: String, trim: true },
  groupSize: { type: String, trim: true },
  tripDirection: { type: String, enum: ['one-way', 'return', ''], default: '' },

  // Corporate transport
  dailyPickup: { type: String, trim: true },
  dailyDropoff: { type: String, trim: true },
  startDate: { type: String, trim: true },
  scheduleDuration: { type: String, trim: true },
  preferredDays: { type: String, enum: ['weekdays', 'daily', 'custom', ''], default: '' },
  departureTime: { type: String, enum: ['morning', 'evening', ''], default: '' },
  companyName: { type: String, trim: true },

  additionalNotes: { type: String, trim: true, default: '' },

  status: {
    type: String,
    default: 'pending',
    enum: ['pending', 'approved', 'rejected', 'cancelled', 'new', 'confirmed']
  },
  approvedBy: { type: String },
  approvedAt: { type: Date },
  rejectedBy: { type: String },
  rejectedAt: { type: Date },
  rejectionReason: { type: String },

  // Privacy Policy consent tracking
  consentGiven: {
    type: Boolean,
    required: true,
    default: false
  },
  consentTimestamp: {
    type: Date,
    default: Date.now
  },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PsvBooking', PsvBookingSchema);
