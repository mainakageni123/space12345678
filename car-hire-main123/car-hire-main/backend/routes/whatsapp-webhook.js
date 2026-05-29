const express = require('express');
const twilio = require('twilio');
const { approveBooking, rejectBooking, shortBookingId } = require('../services/bookingWorkflow');
const { sendWhatsApp } = require('../services/whatsapp');

const router = express.Router();

const parseCommand = (body) => {
  const text = String(body || '').trim();
  const approveMatch = text.match(/^APPROVE\s+(\S+)/i);
  if (approveMatch) {
    return { action: 'approve', bookingId: approveMatch[1] };
  }

  const rejectMatch = text.match(/^REJECT\s+(\S+)(?:\s+(.+))?$/i);
  if (rejectMatch) {
    return {
      action: 'reject',
      bookingId: rejectMatch[1],
      reason: (rejectMatch[2] || 'Rejected by admin').trim()
    };
  }

  return null;
};

const validateTwilioRequest = (req) => {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!authToken) {
    console.warn('TWILIO_AUTH_TOKEN missing — skipping webhook signature check');
    return true;
  }

  const signature = req.headers['x-twilio-signature'];
  if (!signature) return false;

  const webhookBase = process.env.TWILIO_WEBHOOK_URL || process.env.APP_URL || '';
  const url = webhookBase
    ? `${webhookBase.replace(/\/$/, '')}/api/whatsapp/webhook`
    : `${req.protocol}://${req.get('host')}${req.originalUrl}`;

  return twilio.validateRequest(authToken, signature, url, req.body);
};

const isAdminSender = (from) => {
  const admin = process.env.ADMIN_WHATSAPP_NUMBER || '';
  if (!admin) return true;
  const normalize = (n) => String(n).replace(/\s/g, '').toLowerCase();
  return normalize(from) === normalize(admin);
};

router.post('/webhook', async (req, res) => {
  try {
    if (!validateTwilioRequest(req)) {
      console.warn('Invalid Twilio signature on WhatsApp webhook');
      return res.status(403).type('text/xml').send('<Response></Response>');
    }

    const { Body, From } = req.body;
    const command = parseCommand(Body);

    if (!command) {
      await sendWhatsApp(
        `ℹ️ Unknown command. Reply:\n✅ APPROVE <bookingId>\n❌ REJECT <bookingId> <reason>`
      );
      return res.type('text/xml').send('<Response></Response>');
    }

    if (!isAdminSender(From)) {
      console.warn('WhatsApp command from non-admin:', From);
      return res.type('text/xml').send('<Response></Response>');
    }

    if (command.action === 'approve') {
      const result = await approveBooking(command.bookingId, `WhatsApp:${From}`);

      if (!result.ok) {
        await sendWhatsApp(`❌ Approve failed: ${result.error}`);
        return res.type('text/xml').send('<Response></Response>');
      }

      const { booking, paymentResult } = result;
      const stkNote = paymentResult.stkSent
        ? 'M-Pesa STK push sent to customer.'
        : paymentResult.reason === 'mpesa_not_configured'
          ? 'M-Pesa not configured — share payment link manually.'
          : 'Could not send STK push.';

      await sendWhatsApp(
        `✅ *Booking Approved*\nID: ${shortBookingId(booking._id)}\nCustomer: ${booking.firstName} ${booking.lastName}\n${stkNote}`
      );
    } else if (command.action === 'reject') {
      const result = await rejectBooking(command.bookingId, `WhatsApp:${From}`, command.reason);

      if (!result.ok) {
        await sendWhatsApp(`❌ Reject failed: ${result.error}`);
        return res.type('text/xml').send('<Response></Response>');
      }

      await sendWhatsApp(
        `❌ *Booking Rejected*\nID: ${shortBookingId(result.booking._id)}\nReason: ${command.reason}`
      );
    }

    res.type('text/xml').send('<Response></Response>');
  } catch (err) {
    console.error('WhatsApp webhook error:', err);
    res.type('text/xml').send('<Response></Response>');
  }
});

module.exports = router;
