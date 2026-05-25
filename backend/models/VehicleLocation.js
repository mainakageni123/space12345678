const mongoose = require('mongoose');

const VehicleLocationSchema = new mongoose.Schema({
    vehicleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: true
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],  // [longitude, latitude]
            required: true
        }
    },
    speed: {
        type: Number,
        default: 0
    },
    heading: {
        type: Number,  // Direction in degrees (0-360)
        default: 0
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'error'],
        default: 'active'
    },
    signalStrength: {
        type: Number,
        min: 0,
        max: 100,
        default: 100
    },
    lastUpdate: {
        type: Date,
        default: Date.now
    }
});

// Add geospatial index for location queries
VehicleLocationSchema.index({ location: '2dsphere' });

// Add index for vehicleId for faster lookups
VehicleLocationSchema.index({ vehicleId: 1 });

module.exports = mongoose.model('VehicleLocation', VehicleLocationSchema);