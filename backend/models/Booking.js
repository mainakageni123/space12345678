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
  approvedBy: { type: String }, // Admin who approved
  approvedAt: { type: Date }, // When it was approved
  rejectedBy: { type: String }, // Admin who rejected
  rejectedAt: { type: Date }, // When it was rejected
  rejectionReason: { type: String }, // Why it was rejected
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', BookingSchema);
