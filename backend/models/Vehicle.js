const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        type: String,
        required: true
    },
    images: [{
        type: String,
        required: true
    }],
    make: {
        type: String,
        required: true,
        trim: true
    },
    model: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        required: true,
        enum: ['SUV', 'Sedan', 'Van', 'Truck', 'Luxury'] // Add other types as needed
    },
    seats: {
        type: Number,
        required: true,
        min: 1
    },
    price: {
        type: Number,
        required: false,
        min: 0
    },
    description: {
        type: String,
        required: false,
        default: ''
    },
    features: [{
        type: String,
        trim: true
    }],
    specifications: {
        transmission: {
            type: String,
            required: false,
            enum: ['Manual', 'Automatic']
        },
        fuelType: {
            type: String,
            required: false,
            enum: ['Petrol', 'Diesel', 'Hybrid', 'Electric']
        }
    },
    pricing: {
        hourly1:  { type: Number, min: 0 },   // 1 hour rate
        hourly3:  { type: Number, min: 0 },   // 3 hours rate
        hourly6:  { type: Number, min: 0 },   // 6 hours rate
        hourly12: { type: Number, min: 0 },   // 12 hours rate
        daily:    { type: Number, min: 0 },   // 24 hours (1 day)
        daily2:   { type: Number, min: 0 },   // 48 hours (2 days)
        daily3:   { type: Number, min: 0 },   // 72 hours (3 days)
    },
    availability: {
        type: Boolean,
        default: true
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    // Additional fields for enhanced vehicle information
    year: {
        type: Number,
        min: 1900,
        max: new Date().getFullYear() + 1
    },
    color: {
        type: String,
        trim: true
    },
    licensePlate: {
        type: String,
        trim: true
    },
    vin: {
        type: String,
        trim: true
    },
    fuelEfficiency: {
        type: String,
        trim: true
    },
    location: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Vehicle', vehicleSchema);