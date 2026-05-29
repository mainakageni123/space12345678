const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
  amount: { type: Number, required: true },
  phoneNumber: { type: String, required: true },
  checkoutRequestId: { type: String, index: true },
  merchantRequestId: { type: String, index: true },
  mpesaReceiptNumber: { type: String },
  transactionDate: { type: String },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  resultCode: { type: Number },
  resultDescription: { type: String },
  accountReference: { type: String },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
});

module.exports = mongoose.model('Payment', PaymentSchema);
