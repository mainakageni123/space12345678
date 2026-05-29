import { API_BASE_URL } from './api';

/**
 * Initiate M-Pesa STK push (generic or linked to bookingId).
 */
export async function initiateMpesaPayment({
  phoneNumber,
  amount,
  accountReference,
  bookingId,
  bookingType,
  serviceName,
  customerName
}) {
  const endpoint = bookingId
    ? `${API_BASE_URL}/mpesa/pay-booking/${bookingId}`
    : `${API_BASE_URL}/mpesa/stkpush`;

  const body = bookingId
    ? { phoneNumber }
    : {
        phoneNumber,
        amount,
        accountReference: accountReference || `BOOKING_${bookingId || Date.now()}`,
        transactionDesc: serviceName || customerName || 'SpaceBorne booking',
        bookingId: bookingId || undefined
      };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    return {
      success: false,
      pending: false,
      message: data.message || data.error || 'Could not start M-Pesa payment'
    };
  }

  const checkoutRequestId =
    data.data?.CheckoutRequestID || data.data?.checkoutRequestId;

  if (checkoutRequestId) {
    const pollResult = await pollMpesaPayment(checkoutRequestId);
    return pollResult;
  }

  return {
    success: false,
    pending: true,
    message: data.message || 'Check your phone for the M-Pesa prompt.'
  };
}

async function pollMpesaPayment(checkoutRequestId, maxAttempts = 25) {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, 2000));

    try {
      const response = await fetch(`${API_BASE_URL}/mpesa/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkoutRequestId })
      });
      const data = await response.json();
      if (!data.success) continue;

      const resultCode = data.data?.ResultCode;
      const paymentStatus = data.payment?.status;

      if (paymentStatus === 'completed' || resultCode === '0' || resultCode === 0) {
        return {
          success: true,
          message: 'Payment received. Thank you!',
          checkoutRequestId,
          receipt: data.payment?.mpesaReceiptNumber
        };
      }

      if (resultCode && resultCode !== '1032' && resultCode !== 1032) {
        return {
          success: false,
          pending: false,
          message: data.data?.ResultDesc || 'Payment was not completed'
        };
      }
    } catch {
      /* keep polling */
    }
  }

  return {
    success: false,
    pending: true,
    message:
      'STK push sent. Enter your M-Pesa PIN on your phone. Payment may take a moment to confirm.'
  };
}
