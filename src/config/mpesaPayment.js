import { API_BASE_URL } from './api';

/**
 * Initiate M-Pesa STK push via backend (KCB Buni).
 */
export async function initiateMpesaPayment({
  phoneNumber,
  amount,
  accountReference,
  bookingId,
  serviceName,
  customerName
}) {
  const endpoint = bookingId
    ? `${API_BASE_URL}/mpesa/pay-booking/${bookingId}`
    : `${API_BASE_URL}/mpesa/stkpush`;

  const normalizedPhone = String(phoneNumber || '').replace(/\s/g, '');

  const body = bookingId
    ? { phoneNumber: normalizedPhone }
    : {
        phoneNumber: normalizedPhone,
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
      message: data.message || data.error || 'Could not start M-Pesa payment',
      diagnostics: data.diagnostics || null
    };
  }

  const customerMessage =
    data.data?.CustomerMessage || data.message || 'Check your phone for the M-Pesa PIN prompt.';

  return {
    success: false,
    pending: true,
    message: customerMessage,
    checkoutRequestId: data.data?.CheckoutRequestID
  };
}
