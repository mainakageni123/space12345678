const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  // Required fields
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  phoneNumber: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  
  // Vehicle Information (optional until vehicle is selected)
  vehicleId: { type: String },
  vehicleName: { type: String },
  vehicleMake: { type: String },
  vehicleModel: { type: String },
  vehiclePrice: { type: Number },
  duration: { type: String },

  
  // Optional fields
  birthDate: { type: String },
  licenseNumber: { type: String, trim: true },
  idNumber: { type: String, trim: true },
  
  // Status and timestamps
  status: { type: String, default: 'pending', enum: ['pending', 'approved', 'rejected', 'cancelled', 'new', 'confirmed'] },
  approvedBy: { type: String },
  approvedAt: { type: Date },
  rejectedBy: { type: String },
  rejectedAt: { type: Date },
  rejectionReason: { type: String },

  // M-Pesa payment tracking
  paymentStatus: {
    type: String,
    default: 'unpaid',
    enum: ['unpaid', 'pending', 'paid', 'failed']
  },
  mpesaReceiptNumber: { type: String },
  amountPaid: { type: Number },
  paidAt: { type: Date },

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

module.exports = mongoose.model('Booking', BookingSchema);
