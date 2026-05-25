const mongoose = require('mongoose');

const adventureSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    location: { type: String, required: true, trim: true },
    duration: { type: String, default: '' },
    /** @deprecated use tripType — kept for older records */
    difficulty: { type: String, default: '' },
    tripType: {
        type: String,
        enum: ['Family', 'Regular', 'Corporate', 'Group', 'Private', 'Adventure'],
        default: 'Regular'
    },
    price: { type: Number, default: 0 },
    maxParticipants: { type: Number, default: 0 },
    bookedSeats: { type: Number, default: 0 }, // Track total booked seats
    image: { type: String, default: '' },
    images: [{ type: String }],
    highlights: [{ type: String }],
    bestTime: { type: String, default: '' },
    included: [{ type: String, default: '' }],
    availability: { type: Boolean, default: true }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

// Virtual field to calculate available seats
adventureSchema.virtual('availableSeats').get(function() {
    const booked = this.bookedSeats || 0; // Handle undefined/null
    const max = this.maxParticipants || 0;
    return Math.max(0, max - booked);
});

// Pre-save hook to ensure bookedSeats is always a number
adventureSchema.pre('save', function(next) {
    if (this.bookedSeats === undefined || this.bookedSeats === null) {
        this.bookedSeats = 0;
    }
    next();
});

module.exports = mongoose.model('Adventure', adventureSchema);




