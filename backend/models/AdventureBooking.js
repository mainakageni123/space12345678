const mongoose = require('mongoose');

const AdventureBookingSchema = new mongoose.Schema({
  // Required fields
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  phoneNumber: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  
  // Adventure Information
  adventureId: { type: String },
  adventureTitle: { type: String },
  adventureLocation: { type: String },
  adventurePrice: { type: Number },
  numberOfParticipants: { type: Number, default: 1 },
  preferredDate: { type: String },

  // Optional fields
  birthDate: { type: String },
  idNumber: { type: String, trim: true },
  specialRequests: { type: String },
  
  // Status and timestamps
  status: { type: String, default: 'pending', enum: ['pending', 'approved', 'rejected', 'cancelled', 'new', 'confirmed'] },
  approvedBy: { type: String }, // Admin who approved
  approvedAt: { type: Date }, // When it was approved
  rejectedBy: { type: String }, // Admin who rejected
  rejectedAt: { type: Date }, // When it was rejected
  rejectionReason: { type: String }, // Why it was rejected
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AdventureBooking', AdventureBookingSchema);
