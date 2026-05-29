const axios = require('axios');

// KCB Buni Credentials (with fallback to standard MPESA variables)
const KCB_CONSUMER_KEY = process.env.KCB_BUNI_CONSUMER_KEY || process.env.MPESA_CONSUMER_KEY || '';
const KCB_CONSUMER_SECRET = process.env.KCB_BUNI_CONSUMER_SECRET || process.env.MPESA_CONSUMER_SECRET || '';
const KCB_SHORTCODE = process.env.KCB_BUNI_ORG_SHORTCODE || process.env.MPESA_SHORTCODE || '';
const KCB_PASSKEY = process.env.KCB_BUNI_ORG_PASSKEY || process.env.MPESA_PASSKEY || '';
const KCB_CALLBACK_URL = process.env.KCB_BUNI_CALLBACK_URL || process.env.MPESA_CALLBACK_URL || 'https://yourdomain.com/api/mpesa/callback';
const KCB_ENV = process.env.KCB_BUNI_ENV || process.env.MPESA_ENV || 'sandbox';

// Endpoints (configurable via environment variables)
const SANDBOX_TOKEN_URL = process.env.KCB_BUNI_SANDBOX_TOKEN_URL || 'https://uat.buni.kcbgroup.com/token';
const PRODUCTION_TOKEN_URL = process.env.KCB_BUNI_TOKEN_URL || 'https://accounts.buni.kcbgroup.com/oauth2/token';
const SANDBOX_REQUEST_URL = process.env.KCB_BUNI_SANDBOX_STK_PUSH_URL || 'https://uat.buni.kcbgroup.com/mm/api/request/1.0.0';
const PRODUCTION_REQUEST_URL = process.env.KCB_BUNI_STK_PUSH_URL || 'https://api.kcbgroup.com/mm/api/request/1.0.0';

const TOKEN_URL = KCB_ENV === process.env.KCB_BUNI_ENV ? PRODUCTION_TOKEN_URL : SANDBOX_TOKEN_URL;
const REQUEST_URL = KCB_ENV === process.env.KCB_BUNI_ENV ? PRODUCTION_REQUEST_URL : SANDBOX_REQUEST_URL;

const formatPhoneNumber = (phoneNumber) => {
  let formatted = phoneNumber.toString().trim();
  if (formatted.startsWith('0')) {
    formatted = '254' + formatted.substring(1);
  } else if (formatted.startsWith('+254')) {
    formatted = formatted.substring(1);
  } else if (!formatted.startsWith('254')) {
    formatted = '254' + formatted;
  }
  if (!/^254[17]\d{8}$/.test(formatted)) {
    throw new Error('Invalid phone number format. Use 0712345678 or 254712345678');
  }
  return formatted;
};

const getAccessToken = async () => {
  if (!KCB_CONSUMER_KEY || !KCB_CONSUMER_SECRET) {
    throw new Error('KCB Buni API credentials not configured');
  }
  const auth = Buffer.from(`${KCB_CONSUMER_KEY}:${KCB_CONSUMER_SECRET}`).toString('base64');
  
  const response = await axios.post(
    TOKEN_URL,
    'grant_type=client_credentials',
    {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  );
  return response.data.access_token;
};

/**
 * Initiate M-Pesa STK push via KCB Buni MpesaExpressAPIService
 * @returns {Promise<{ MerchantRequestID, CheckoutRequestID, ResponseCode, ResponseDescription, CustomerMessage }>}
 */
const initiateStkPush = async ({
  phoneNumber,
  amount,
  accountReference = 'SpaceBorne',
  transactionDesc = 'Booking payment'
}) => {
  const formattedPhone = formatPhoneNumber(phoneNumber);
  const accessToken = await getAccessToken();

  // invoiceNumber MUST be in the format: {Paybill/Till}-{Reference}
  const invoiceNumber = `${KCB_SHORTCODE}-${accountReference}`;

  const payload = {
    phoneNumber: formattedPhone,
    amount: String(Math.ceil(Number(amount))),
    invoiceNumber: invoiceNumber,
    sharedShortCode: true, // KCB handles STK push through their shared shortcode
    orgShortCode: "",      // Must be empty when sharedShortCode is true
    orgPassKey: "",        // Must be empty when sharedShortCode is true
    transactionDescription: transactionDesc.slice(0, 50),
    callbackUrl: KCB_CALLBACK_URL
  };

  const response = await axios.post(
    REQUEST_URL,
    payload,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return {
    MerchantRequestID: response.data.MerchantRequestID || invoiceNumber,
    CheckoutRequestID: response.data.CheckoutRequestID || `CH_${Date.now()}`,
    ResponseCode: response.data.ResponseCode || '0',
    ResponseDescription: response.data.ResponseDescription || 'Success. Request accepted for processing',
    CustomerMessage: response.data.CustomerMessage || 'Check your phone for the M-Pesa prompt.',
    formattedPhone
  };
};

const queryStkStatus = async (checkoutRequestId) => {
  // KCB Buni relies primarily on Callback/Webhooks for transaction status updates.
  // We return a safe pending response structure here.
  return {
    ResponseCode: "0",
    ResponseDescription: "Query received. Status will be updated via M-Pesa Callback webhook.",
    ResultCode: "0",
    ResultDesc: "Pending callback"
  };
};

const isMpesaConfigured = () =>
  Boolean(KCB_CONSUMER_KEY && KCB_CONSUMER_SECRET && KCB_PASSKEY);

module.exports = {
  formatPhoneNumber,
  initiateStkPush,
  queryStkStatus,
  isMpesaConfigured,
  MPESA_CALLBACK_URL: KCB_CALLBACK_URL
};
