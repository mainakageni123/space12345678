const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  make: {
    type: String,
    required: true
  },
  model: {
    type: String,
    required: true
  },
  image: {
    data: Buffer,
    contentType: String,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Sedan', 'SUV', 'Van', 'Luxury', 'Sports', 'Electric', 'Hybrid']
  },
  price: {
    type: Number,
    required: true
  },
  description: String,
  features: [String],
  specifications: {
    seats: Number,
    transmission: {
      type: String,
      enum: ['Automatic', 'Manual']
    },
    fuelType: {
      type: String,
      enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid']
    }
  },
  image: String,
  status: {
    type: String,
    enum: ['available', 'maintenance', 'reserved'],
    default: 'available'
  },
  color: String,
  vin: String,
  licensePlate: String,
  location: String,
  fuelEfficiency: String,
  safetyRating: {
    type: Number,
    min: 0,
    max: 5
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Vehicle', vehicleSchema);