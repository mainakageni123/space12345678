const mongoose = require('mongoose');

const SystemLogSchema = new mongoose.Schema({
    service: {
        type: String,
        required: true,
        enum: ['bookings', 'payments', 'email', 'file_storage', 'system']
    },
    type: {
        type: String,
        required: true,
        enum: ['health_check', 'error', 'security_update', 'maintenance']
    },
    status: {
        type: String,
        required: true,
        enum: ['healthy', 'warning', 'error']
    },
    message: String,
    details: mongoose.Schema.Types.Mixed,
    responseTime: Number,
    timestamp: {
        type: Date,
        default: Date.now
    }
});

// Index for quick lookups
SystemLogSchema.index({ service: 1, timestamp: -1 });
SystemLogSchema.index({ type: 1, timestamp: -1 });

module.exports = mongoose.model('SystemLog', SystemLogSchema);