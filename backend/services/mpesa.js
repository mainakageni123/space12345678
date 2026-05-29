const axios = require('axios');

const KCB_HTTP_TIMEOUT_MS = Number(process.env.KCB_HTTP_TIMEOUT_MS) || 25000;
const axiosKcb = axios.create({ timeout: KCB_HTTP_TIMEOUT_MS });

let configLogged = false;

// KCB Buni Credentials (with fallback to standard MPESA variables)
const KCB_CONSUMER_KEY = process.env.KCB_BUNI_CONSUMER_KEY || process.env.MPESA_CONSUMER_KEY || '';
const KCB_CONSUMER_SECRET = process.env.KCB_BUNI_CONSUMER_SECRET || process.env.MPESA_CONSUMER_SECRET || '';
const KCB_SHORTCODE = process.env.KCB_BUNI_ORG_SHORTCODE || process.env.MPESA_SHORTCODE || '';
const KCB_PASSKEY = process.env.KCB_BUNI_ORG_PASSKEY || process.env.MPESA_PASSKEY || '';
const KCB_CALLBACK_URL = process.env.KCB_BUNI_CALLBACK_URL || process.env.MPESA_CALLBACK_URL || 'https://yourdomain.com/api/mpesa/callback';
const KCB_ENV = process.env.KCB_BUNI_ENV || process.env.MPESA_ENV || '';

const useKcbLive = () => String(KCB_ENV || '').toLowerCase().startsWith('prod');

const UAT_TOKEN_URL =
  process.env.KCB_BUNI_UAT_TOKEN_URL || 'https://uat.buni.kcbgroup.com/token';
const LIVE_TOKEN_URL = process.env.KCB_BUNI_TOKEN_URL || 'https://accounts.buni.kcbgroup.com/oauth2/token';
const UAT_REQUEST_URL =
  process.env.KCB_BUNI_UAT_STK_PUSH_URL || 'https://uat.buni.kcbgroup.com/mm/api/request/1.0.0';
const LIVE_REQUEST_URL = process.env.KCB_BUNI_STK_PUSH_URL || 'https://api.kcbgroup.com/mm/api/request/1.0.0';

const getTokenUrl = () => (useKcbLive() ? LIVE_TOKEN_URL : UAT_TOKEN_URL);
const getRequestUrl = () => (useKcbLive() ? LIVE_REQUEST_URL : UAT_REQUEST_URL);

const logKcbConfig = () => {
  if (configLogged) return;
  configLogged = true;
  console.log('[KCB] config check:', {
    env: KCB_ENV ? 'SET' : 'MISSING',
    mode: useKcbLive() ? 'live' : 'uat',
    consumerKey: KCB_CONSUMER_KEY ? 'SET' : 'MISSING',
    consumerSecret: KCB_CONSUMER_SECRET ? 'SET' : 'MISSING',
    shortcode: KCB_SHORTCODE ? 'SET' : 'MISSING',
    callbackUrl: KCB_CALLBACK_URL ? 'SET' : 'MISSING',
    tokenHost: getTokenUrl().replace(/\/token.*$/, ''),
    stkHost: getRequestUrl().replace(/\/mm\/api.*$/, '')
  });
};

const formatKcbError = (err) => {
  const code = err.code || err.cause?.code;
  if (code === 'ETIMEDOUT' || code === 'ECONNABORTED') {
    return useKcbLive()
      ? 'Payment gateway timed out. KCB live API may need your server IP whitelisted — contact buni@kcbgroup.com with your Netlify outbound IP.'
      : 'Payment gateway timed out. KCB UAT may block cloud hosts — try again or test from a whitelisted server.';
  }
  if (code === 'ENOTFOUND' || code === 'ECONNREFUSED') {
    return 'Could not reach the payment gateway. Check KCB_BUNI_ENV and API URLs in environment variables.';
  }
  return err.response?.data?.errorMessage || err.response?.data?.message || err.message;
};

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
  logKcbConfig();
  if (!KCB_CONSUMER_KEY || !KCB_CONSUMER_SECRET) {
    throw new Error('KCB Buni API credentials not configured');
  }
  if (!KCB_ENV) {
    console.warn('[KCB] KCB_BUNI_ENV is not set — defaulting to UAT endpoints');
  }
  const auth = Buffer.from(`${KCB_CONSUMER_KEY}:${KCB_CONSUMER_SECRET}`).toString('base64');

  try {
    const response = await axiosKcb.post(
      getTokenUrl(),
      'grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    return response.data.access_token;
  } catch (err) {
    const msg = formatKcbError(err);
    console.error('[KCB] token request failed:', msg, err.code || '');
    throw new Error(msg);
  }
};

/**
 * Initiate M-Pesa STK push via KCB Buni MpesaExpressAPIService
 */
const initiateStkPush = async ({
  phoneNumber,
  amount,
  accountReference = 'SpaceBorne',
  transactionDesc = 'Booking payment'
}) => {
  const formattedPhone = formatPhoneNumber(phoneNumber);
  const accessToken = await getAccessToken();

  const invoiceNumber = `${KCB_SHORTCODE}-${accountReference}`;

  const payload = {
    phoneNumber: formattedPhone,
    amount: String(Math.ceil(Number(amount))),
    invoiceNumber,
    sharedShortCode: true,
    orgShortCode: '',
    orgPassKey: '',
    transactionDescription: transactionDesc.slice(0, 50),
    callbackUrl: KCB_CALLBACK_URL
  };

  let response;
  try {
    response = await axiosKcb.post(getRequestUrl(), payload, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
  } catch (err) {
    const msg = formatKcbError(err);
    console.error('[KCB] STK push failed:', msg, err.code || '');
    throw new Error(msg);
  }

  return {
    MerchantRequestID: response.data.MerchantRequestID || invoiceNumber,
    CheckoutRequestID: response.data.CheckoutRequestID || `CH_${Date.now()}`,
    ResponseCode: response.data.ResponseCode || '0',
    ResponseDescription:
      response.data.ResponseDescription || 'Success. Request accepted for processing',
    CustomerMessage:
      response.data.CustomerMessage || 'Check your phone for the M-Pesa prompt.',
    formattedPhone
  };
};

const queryStkStatus = async () => ({
  ResponseCode: '0',
  ResponseDescription: 'Query received. Status will be updated via M-Pesa Callback webhook.',
  ResultCode: '0',
  ResultDesc: 'Pending callback'
});

const isMpesaConfigured = () =>
  Boolean(KCB_CONSUMER_KEY && KCB_CONSUMER_SECRET && KCB_SHORTCODE);

module.exports = {
  formatPhoneNumber,
  initiateStkPush,
  queryStkStatus,
  isMpesaConfigured,
  logKcbConfig,
  formatKcbError,
  MPESA_CALLBACK_URL: KCB_CALLBACK_URL
};
