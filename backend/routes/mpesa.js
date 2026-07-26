const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const authMiddleware = require('../middleware/auth');
const {
  initiateStkPush,
  queryStkStatus,
  isMpesaConfigured,
  formatPhoneNumber,
  logKcbConfig,
  formatKcbError,
  testKcbConnection,
  getKcbDiagnostics,
  getKcbBaseUrl,
  useKcbLive
} = require('../services/mpesa');
const { startBookingPayment, handleMpesaCallback } = require('../services/bookingWorkflow');

router.get('/status', authMiddleware, (req, res) => {
  logKcbConfig();
  // Diagnostics logged server-side only (visible in Vercel Function logs)
  console.log('[KCB] Status check diagnostics:', JSON.stringify(getKcbDiagnostics()));
  res.json({
    success: true,
    configured: isMpesaConfigured().configured,
    env: process.env.KCB_BUNI_ENV ? 'SET' : 'MISSING',
    consumerKey: process.env.KCB_BUNI_CONSUMER_KEY ? 'SET' : 'MISSING',
    consumerSecret: process.env.KCB_BUNI_CONSUMER_SECRET ? 'SET' : 'MISSING',
    shortcode: process.env.KCB_BUNI_ORG_SHORTCODE ? 'SET' : 'MISSING',
    accountNumber: process.env.KCB_BUNI_ACCOUNT_NUMBER ? 'SET' : 'MISSING',
    callbackUrl: process.env.KCB_BUNI_CALLBACK_URL ? 'SET' : 'MISSING'
  });
});

router.get('/test-connection', authMiddleware, async (req, res) => {
  try {
    if (!isMpesaConfigured().configured) {
      return res.status(503).json({ success: false, error: 'KCB not fully configured' });
    }
    const result = await testKcbConnection();
    res.json({ success: true, message: 'KCB token obtained', ...result });
  } catch (error) {
    // Log full diagnostics server-side only
    console.error('[KCB] Test connection failed:', error.message, JSON.stringify(getKcbDiagnostics()));
    res.status(500).json({
      success: false,
      error: 'Payment service temporarily unavailable. Please try again shortly.'
    });
  }
});

router.post('/stkpush', async (req, res) => {
  try {
    const { phoneNumber, amount, accountReference, transactionDesc, bookingId } = req.body;

    if (!phoneNumber || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Phone number and amount are required'
      });
    }

    const configCheck = isMpesaConfigured();
    if (!configCheck.configured) {
      return res.status(503).json({
        success: false,
        error: 'M-Pesa is not configured. Missing: ' + configCheck.missing.join(', ')
      });
    }

    const stk = await initiateStkPush({
      phoneNumber,
      amount,
      accountReference,
      transactionDesc
    });

    let payment = null;
    if (bookingId) {
      const booking = await Booking.findById(bookingId);
      if (booking) {
        payment = await Payment.create({
          bookingId: booking._id,
          amount: Math.ceil(Number(amount)),
          phoneNumber: stk.formattedPhone,
          checkoutRequestId: stk.CheckoutRequestID,
          merchantRequestId: stk.MerchantRequestID,
          status: 'pending',
          accountReference: accountReference || `BK${String(bookingId).slice(-8)}`
        });
        booking.paymentStatus = 'pending';
        await booking.save();
      }
    }

    res.status(200).json({
      success: true,
      message: 'STK push sent successfully',
      data: {
        MerchantRequestID: stk.MerchantRequestID,
        CheckoutRequestID: stk.CheckoutRequestID,
        ResponseCode: stk.ResponseCode,
        ResponseDescription: stk.ResponseDescription,
        CustomerMessage: stk.CustomerMessage,
        paymentId: payment?._id
      }
    });
  } catch (error) {
    console.error('STK Push Error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to initiate payment',
      message: formatKcbError(error)
    });
  }
});

router.post('/callback', async (req, res) => {
  try {
    console.log('M-Pesa Callback:', JSON.stringify(req.body, null, 2));

    const { Body } = req.body;
    if (!Body?.stkCallback) {
      return res.status(200).json({ success: true, message: 'Callback received' });
    }

    await handleMpesaCallback(Body.stkCallback);
    res.status(200).json({ success: true, message: 'Callback processed' });
  } catch (error) {
    console.error('Callback Error:', error);
    res.status(200).json({ success: true, message: 'Callback received' });
  }
});

router.post('/query', async (req, res) => {
  try {
    const { checkoutRequestId } = req.body;

    if (!checkoutRequestId) {
      return res.status(400).json({
        success: false,
        error: 'CheckoutRequestID is required'
      });
    }

    const data = await queryStkStatus(checkoutRequestId);
    const payment = await Payment.findOne({ checkoutRequestId }).populate('bookingId');

    res.status(200).json({
      success: true,
      data,
      payment: payment
        ? {
            status: payment.status,
            mpesaReceiptNumber: payment.mpesaReceiptNumber,
            bookingId: payment.bookingId?._id
          }
        : null
    });
  } catch (error) {
    console.error('Query Error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to query payment status',
      message: error.response?.data?.errorMessage || error.message
    });
  }
});

router.get('/admin/transactions', authMiddleware, async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate({
        path: 'bookingId',
        select: 'customerName vehicleName vehiclePrice status paymentStatus createdAt'
      })
      .sort({ createdAt: -1 })
      .limit(200);

    const totalRevenue = payments
      .filter((p) => p.status === 'completed')
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    const completedCount = payments.filter((p) => p.status === 'completed').length;
    const pendingCount = payments.filter((p) => p.status === 'pending').length;
    const failedCount = payments.filter((p) => p.status === 'failed' || p.status === 'cancelled').length;

    res.status(200).json({
      success: true,
      summary: {
        totalRevenue,
        totalTransactions: payments.length,
        completedCount,
        pendingCount,
        failedCount,
        provider: 'KCB Buni M-Pesa Gateway'
      },
      payments
    });
  } catch (error) {
    console.error('Admin transactions fetch error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch payment transactions' });
  }
});

router.post('/pay-booking/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { phoneNumber: overridePhone } = req.body || {};

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({ success: false, error: 'Booking is already paid' });
    }

    // Allow payment for approved, confirmed, or pending bookings (direct checkout option)
    if (!['approved', 'confirmed', 'pending'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        error: 'Booking must be in a pending, approved, or confirmed state to pay',
        status: booking.status
      });
    }

    const configCheck = isMpesaConfigured();
    if (!configCheck.configured) {
      return res.status(503).json({
        success: false,
        error: 'M-Pesa is not configured. Missing: ' + configCheck.missing.join(', ')
      });
    }

    if (overridePhone) {
      booking.phoneNumber = overridePhone;
      await booking.save();
    }

    const result = await startBookingPayment(booking);

    if (!result.stkSent) {
      return res.status(400).json({
        success: false,
        error: result.reason || result.error || 'Could not start payment'
      });
    }

    res.status(200).json({
      success: true,
      message: 'STK push sent to customer phone',
      data: {
        CheckoutRequestID: result.stk.CheckoutRequestID,
        MerchantRequestID: result.stk.MerchantRequestID,
        CustomerMessage: result.stk.CustomerMessage,
        amount: booking.vehiclePrice,
        phoneNumber: formatPhoneNumber(booking.phoneNumber)
      },
      paymentId: result.payment._id
    });
  } catch (error) {
    // Full diagnostics go to server logs only (Vercel Function logs)
    console.error('[KCB] Pay booking error:', error.message, JSON.stringify(getKcbDiagnostics()));
    res.status(500).json({
      success: false,
      error: 'Payment temporarily unavailable. Please try again shortly.'
    });
  }
});

module.exports = router;
