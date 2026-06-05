const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const { initiateStkPush, isMpesaConfigured } = require('./mpesa');
const {
  sendWhatsApp,
  sendWhatsAppTo,
  notifyAdminPaymentReceived,
  sendCustomerApprovalNotification,
  sendCustomerRejectionNotification
} = require('./whatsapp');

const APP_URL = process.env.APP_URL || 'http://localhost:5173';

const findBookingByIdOrSuffix = async (idPart) => {
  const trimmed = String(idPart || '').trim();
  if (!trimmed) return null;

  if (/^[0-9a-fA-F]{24}$/i.test(trimmed)) {
    return Booking.findById(trimmed);
  }

  if (trimmed.length >= 6) {
    const suffix = trimmed.toLowerCase();
    const recent = await Booking.find({ status: { $in: ['pending', 'approved'] } })
      .sort({ createdAt: -1 })
      .limit(50);
    const match = recent.find((b) => b._id.toString().toLowerCase().endsWith(suffix));
    if (match) return match;
    const any = await Booking.find().sort({ createdAt: -1 }).limit(100);
    return any.find((b) => b._id.toString().toLowerCase().endsWith(suffix)) || null;
  }

  return null;
};

const shortBookingId = (id) => String(id).slice(-8).toUpperCase();

const startBookingPayment = async (booking) => {
  if (!isMpesaConfigured()) {
    console.warn('M-Pesa not configured — skipping STK push');
    return { stkSent: false, reason: 'mpesa_not_configured' };
  }

  const amount = Number(booking.vehiclePrice || 0);
  if (amount <= 0) {
    return { stkSent: false, reason: 'no_amount' };
  }

  const accountReference = `BK${shortBookingId(booking._id)}`;
  const stk = await initiateStkPush({
    phoneNumber: booking.phoneNumber,
    amount,
    accountReference,
    transactionDesc: 'Car hire booking'
  });

  const payment = await Payment.create({
    bookingId: booking._id,
    amount,
    phoneNumber: stk.formattedPhone,
    checkoutRequestId: stk.CheckoutRequestID,
    merchantRequestId: stk.MerchantRequestID,
    status: 'pending',
    accountReference
  });

  booking.paymentStatus = 'pending';
  await booking.save();

  return { stkSent: true, payment, stk };
};

const approveBooking = async (bookingId, approvedBy = 'Admin') => {
  const booking = await findBookingByIdOrSuffix(bookingId);
  if (!booking) {
    return { ok: false, error: 'Booking not found' };
  }

  if (booking.status === 'approved' || booking.status === 'confirmed') {
    return { ok: false, error: 'Booking already approved', booking };
  }

  if (booking.status === 'rejected' || booking.status === 'cancelled') {
    return { ok: false, error: `Cannot approve booking with status: ${booking.status}`, booking };
  }

  booking.status = 'approved';
  booking.approvedBy = approvedBy;
  booking.approvedAt = new Date();
  await booking.save();

  if (booking.vehicleId) {
    try {
      const Vehicle = require('../models/Vehicle');
      const vehicle = await Vehicle.findById(booking.vehicleId);
      if (vehicle) {
        vehicle.availability = false;
        await vehicle.save();
      }
    } catch (e) {
      console.warn('Vehicle availability update failed:', e.message);
    }
  }

  const paymentLink = `${APP_URL}/mpesa-pay?bookingId=${booking._id}`;
  await sendCustomerApprovalNotification(booking, paymentLink);

  let paymentResult = { stkSent: false };
  try {
    paymentResult = await startBookingPayment(booking);
  } catch (err) {
    console.error('STK push after approval failed:', err.message);
    paymentResult = { stkSent: false, error: err.message };
  }

  return { ok: true, booking, paymentResult };
};

const rejectBooking = async (bookingId, rejectedBy = 'Admin', rejectionReason = 'No reason provided') => {
  const booking = await findBookingByIdOrSuffix(bookingId);
  if (!booking) {
    return { ok: false, error: 'Booking not found' };
  }

  booking.status = 'rejected';
  booking.rejectedBy = rejectedBy;
  booking.rejectedAt = new Date();
  booking.rejectionReason = rejectionReason;
  booking.paymentStatus = 'unpaid';
  await booking.save();

  await sendCustomerRejectionNotification(booking, rejectionReason);

  return { ok: true, booking };
};

const handleMpesaCallback = async (stkCallback) => {
  const { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = stkCallback;

  const payment = await Payment.findOne({
    $or: [{ checkoutRequestId: CheckoutRequestID }, { merchantRequestId: MerchantRequestID }]
  });

  if (!payment) {
    console.warn('Payment record not found for callback:', CheckoutRequestID);
    return null;
  }

  payment.resultCode = ResultCode;
  payment.resultDescription = ResultDesc;

  if (ResultCode !== 0) {
    payment.status = ResultCode === 1032 ? 'cancelled' : 'failed';
    await payment.save();

    const booking = await Booking.findById(payment.bookingId);
    if (booking) {
      booking.paymentStatus = 'failed';
      await booking.save();
    }
    return { payment, success: false };
  }

  const metadata = {};
  if (CallbackMetadata?.Item) {
    CallbackMetadata.Item.forEach((item) => {
      metadata[item.Name] = item.Value;
    });
  }

  payment.status = 'completed';
  payment.mpesaReceiptNumber = metadata.MpesaReceiptNumber;
  payment.transactionDate = String(metadata.TransactionDate || '');
  payment.completedAt = new Date();
  await payment.save();

  const booking = await Booking.findById(payment.bookingId);
  if (booking) {
    booking.status = 'confirmed';
    booking.paymentStatus = 'paid';
    booking.mpesaReceiptNumber = metadata.MpesaReceiptNumber;
    booking.amountPaid = metadata.Amount || payment.amount;
    booking.paidAt = new Date();
    await booking.save();

    await notifyAdminPaymentReceived(booking, payment);
  }

  return { payment, booking, success: true, metadata };
};

module.exports = {
  findBookingByIdOrSuffix,
  shortBookingId,
  approveBooking,
  rejectBooking,
  startBookingPayment,
  handleMpesaCallback
};
