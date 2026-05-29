const twilio = require('twilio');

const getTwilioClient = () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!accountSid || !authToken) return null;
  return twilio(accountSid, authToken);
};

const fromNumber = () => process.env.TWILIO_WHATSAPP_NUMBER;
const adminNumber = () => process.env.ADMIN_WHATSAPP_NUMBER;

const shortId = (id) => String(id).slice(-8).toUpperCase();

/**
 * Send WhatsApp to admin (default)
 */
const sendWhatsApp = async (body) => {
  const from = fromNumber();
  const to = adminNumber();

  try {
    if (!from || !to) {
      console.warn('WhatsApp credentials missing. Skipping notification.');
      return null;
    }

    const client = getTwilioClient();
    if (!client) return null;

    const message = await client.messages.create({ body, from, to });
    console.log('WhatsApp sent:', message.sid);
    return message;
  } catch (error) {
    console.error('WhatsApp send failed:', error.message);
    return null;
  }
};

/**
 * Send WhatsApp to a specific number (customer)
 */
const sendWhatsAppTo = async (phoneNumber, body) => {
  const from = fromNumber();
  if (!from || !phoneNumber) return null;

  let to = String(phoneNumber).trim();
  if (!to.startsWith('whatsapp:')) {
    let digits = to.replace(/\D/g, '');
    if (digits.startsWith('0')) digits = '254' + digits.slice(1);
    if (!digits.startsWith('254')) digits = '254' + digits;
    to = `whatsapp:+${digits}`;
  }

  try {
    const client = getTwilioClient();
    if (!client) return null;

    const message = await client.messages.create({ body, from, to });
    console.log('WhatsApp to customer sent:', message.sid);
    return message;
  } catch (error) {
    console.error('Customer WhatsApp failed:', error.message);
    return null;
  }
};

const notifyNewCarBooking = async (booking) => {
  const id = shortId(booking._id);
  const message = `🚗 *New Car Booking*

👤 ${booking.firstName} ${booking.lastName}
📱 ${booking.phoneNumber}
📧 ${booking.email}
🚙 ${booking.vehicleName || 'Not specified'}
💰 KES ${Number(booking.vehiclePrice || 0).toLocaleString()}
📅 Status: ${(booking.status || 'pending').toUpperCase()}

*Booking ID:* \`${id}\`
*Full ID:* ${booking._id}

Reply to approve or reject:
✅ \`APPROVE ${id}\`
❌ \`REJECT ${id} reason here\`

SpaceBorne Car Hire`;

  return sendWhatsApp(message);
};

const notifyNewAdventureBooking = async (booking) => {
  const message = `🌍 *New Adventure Booking*

👤 ${booking.firstName} ${booking.lastName}
📱 ${booking.phoneNumber}
✨ ${booking.adventureTitle || 'Not specified'}
💰 KES ${Number(booking.adventurePrice || 0).toLocaleString()}
📅 ${(booking.status || 'pending').toUpperCase()}

SpaceBorne Admin`;

  return sendWhatsApp(message);
};

const notifyNewPsvBooking = async (booking) => {
  const isGroup = booking.serviceType === 'group';
  const routeInfo = isGroup
    ? `📍 ${booking.pickupLocation} → ${booking.dropoffLocation}`
    : `📍 ${booking.dailyPickup} → ${booking.dailyDropoff}`;

  const message = `🚌 *New PSV Booking*

👤 ${booking.fullName}
📱 ${booking.phoneNumber}
${routeInfo}

SpaceBorne PSV Admin`;

  return sendWhatsApp(message);
};

const sendCustomerApprovalNotification = async (booking, paymentLink) => {
  const amount = Number(booking.vehiclePrice || 0).toLocaleString();
  const body = `✅ *Booking Approved — SpaceBorne*

Hi ${booking.firstName}, your booking for *${booking.vehicleName || 'your vehicle'}* has been approved.

💰 Amount: KES ${amount}
📱 An M-Pesa STK push has been sent to ${booking.phoneNumber}. Enter your PIN on your phone to pay.

Or pay here: ${paymentLink}

Booking ref: ${shortId(booking._id)}`;

  return sendWhatsAppTo(booking.phoneNumber, body);
};

const sendCustomerRejectionNotification = async (booking, reason) => {
  const body = `❌ *Booking Update — SpaceBorne*

Hi ${booking.firstName}, we're sorry — your booking for *${booking.vehicleName || 'your vehicle'}* could not be confirmed.

Reason: ${reason || 'Not specified'}

Contact us if you have questions.`;

  return sendWhatsAppTo(booking.phoneNumber, body);
};

const notifyAdminPaymentReceived = async (booking, payment) => {
  const message = `💰 *Payment Received*

Booking: ${shortId(booking._id)}
Customer: ${booking.firstName} ${booking.lastName}
Amount: KES ${Number(booking.amountPaid || payment.amount).toLocaleString()}
Receipt: ${payment.mpesaReceiptNumber || 'N/A'}
Status: CONFIRMED ✅`;

  return sendWhatsApp(message);
};

module.exports = {
  sendWhatsApp,
  sendWhatsAppTo,
  notifyNewCarBooking,
  notifyNewAdventureBooking,
  notifyNewPsvBooking,
  sendCustomerApprovalNotification,
  sendCustomerRejectionNotification,
  notifyAdminPaymentReceived
};
