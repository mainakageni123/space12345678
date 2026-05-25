const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    email: { type: String, required: true },
    licenseNumber: String,
    idType: String,
    idNumber: String,
    residentialAddress: String,
    nextOfKin: String,
    nextOfKinPhone: String,
    status: { type: String, enum: ['new', 'read'], default: 'new' }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);


