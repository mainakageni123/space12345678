const axios = require('axios');

const KCB_HTTP_TIMEOUT_MS = Number(process.env.KCB_HTTP_TIMEOUT_MS) || 25000;
const axiosKcb = axios.create({ timeout: KCB_HTTP_TIMEOUT_MS });

let configLogged = false;

const envTrim = (value) => String(value || '').trim().replace(/^["']|["']$/g, '');

const KCB_CONSUMER_KEY = envTrim(process.env.KCB_BUNI_CONSUMER_KEY || process.env.MPESA_CONSUMER_KEY);
const KCB_CONSUMER_SECRET = envTrim(process.env.KCB_BUNI_CONSUMER_SECRET || process.env.MPESA_CONSUMER_SECRET);
const KCB_SHORTCODE = envTrim(process.env.KCB_BUNI_ORG_SHORTCODE || process.env.MPESA_SHORTCODE);
const KCB_ACCOUNT_NUMBER = envTrim(process.env.KCB_BUNI_ACCOUNT_NUMBER);
const KCB_CALLBACK_URL = envTrim(process.env.KCB_BUNI_CALLBACK_URL || process.env.MPESA_CALLBACK_URL);
const KCB_ENV = envTrim(process.env.KCB_BUNI_ENV || process.env.MPESA_ENV);

const useKcbLive = () => String(KCB_ENV || '').toLowerCase().startsWith('prod');

const getKcbBaseUrl = () => {
  if (process.env.KCB_BUNI_BASE_URL) {
    return process.env.KCB_BUNI_BASE_URL.replace(/\/$/, '');
  }
  return useKcbLive() ? 'https://api.buni.kcbgroup.com' : 'https://uat.buni.kcbgroup.com';
};

// Returns the OAuth2 token URL — NEVER appends grant_type to the URL;
// it always goes in the POST body (OAuth2 spec / KCB Buni requirement).
const getTokenUrl = () => {
  let url = process.env.KCB_BUNI_TOKEN_URL || '';
  if (url) {
    url = url.split('?')[0].trim();
    // Auto-fix legacy or incorrect token URLs pointing to api.buni instead of accounts.buni
    if (url.includes('api.buni.kcbgroup.com')) {
      url = 'https://accounts.buni.kcbgroup.com/oauth2/token';
    }
    return url;
  }
  if (!useKcbLive() && process.env.KCB_BUNI_UAT_TOKEN_URL) {
    return process.env.KCB_BUNI_UAT_TOKEN_URL.split('?')[0].trim();
  }
  return 'https://accounts.buni.kcbgroup.com/oauth2/token';
};

const getStkPushUrl = () => {
  if (useKcbLive() && process.env.KCB_BUNI_STK_PUSH_URL) {
    return process.env.KCB_BUNI_STK_PUSH_URL;
  }
  if (!useKcbLive() && process.env.KCB_BUNI_UAT_STK_PUSH_URL) {
    return process.env.KCB_BUNI_UAT_STK_PUSH_URL;
  }
  return `${getKcbBaseUrl()}/mm/api/request/1.0.0/stkpush`;
};

const logKcbConfig = () => {
  if (configLogged) return;
  configLogged = true;
  console.log('[KCB] config check:', {
    env: KCB_ENV ? 'SET' : 'MISSING',
    mode: useKcbLive() ? 'live' : 'uat',
    consumerKey: KCB_CONSUMER_KEY ? 'SET' : 'MISSING',
    consumerSecret: KCB_CONSUMER_SECRET ? 'SET' : 'MISSING',
    shortcode: KCB_SHORTCODE ? 'SET' : 'MISSING',
    accountNumber: KCB_ACCOUNT_NUMBER ? 'SET' : 'MISSING',
    callbackUrl: KCB_CALLBACK_URL ? 'SET' : 'MISSING',
    baseUrl: getKcbBaseUrl(),
    tokenUrl: getTokenUrl(),
    stkUrl: getStkPushUrl()
  });
};

const formatKcbError = (err) => {
  const code = err.code || err.cause?.code;
  if (code === 'ETIMEDOUT' || code === 'ECONNABORTED') {
    return useKcbLive()
      ? 'Could not reach KCB payment servers from this host. Ask KCB (buni@kcbgroup.com) to whitelist Netlify/AWS/Vercel outbound IPs for your Paybill.'
      : 'KCB test server timed out. Cloud hosts are often blocked — use UAT from a local machine or ask KCB to whitelist your server IP.';
  }
  if (code === 'ENOTFOUND' || code === 'ECONNREFUSED') {
    return 'Could not reach KCB. Set KCB_BUNI_BASE_URL or check KCB_BUNI_ENV in environment variables.';
  }
  const data = err.response?.data;
  const msg =
    data?.errorMessage ||
    data?.error_description ||
    data?.header?.statusDescription ||
    data?.response?.ResponseDescription ||
    data?.message ||
    err.message;

  const text = String(msg || '');
  if (text && text.length < 200) {
    return text; // Return the exact error KCB sent back!
  }
  return text;
  return text;
};

let lastRawKcbError = null;

const getKcbDiagnostics = () => {
  const rawKey = process.env.KCB_BUNI_CONSUMER_KEY || '';
  const rawSecret = process.env.KCB_BUNI_CONSUMER_SECRET || '';
  const keyHadWhitespace = rawKey !== rawKey.trim();
  const secretHadWhitespace = rawSecret !== rawSecret.trim();

  return {
    mode: useKcbLive() ? 'live' : 'uat',
    baseUrl: getKcbBaseUrl(),
    tokenUrl: getTokenUrl(),
    envValue: KCB_ENV || null,
    accountNumber: KCB_ACCOUNT_NUMBER || null,
    invoiceNumberFormat: KCB_ACCOUNT_NUMBER
      ? `${KCB_ACCOUNT_NUMBER}-{reference}`
      : null,
    consumerKeyLength: KCB_CONSUMER_KEY.length,
    consumerSecretLength: KCB_CONSUMER_SECRET.length,
    consumerKeyPreview: KCB_CONSUMER_KEY
      ? `${KCB_CONSUMER_KEY.slice(0, 4)}…${KCB_CONSUMER_KEY.slice(-4)}`
      : null,
    consumerSecretPreview: KCB_CONSUMER_SECRET
      ? `${KCB_CONSUMER_SECRET.slice(0, 4)}…${KCB_CONSUMER_SECRET.slice(-4)}`
      : null,
    lastKcbError: lastRawKcbError,
    keyHadWhitespace,
    secretHadWhitespace,
    hint: useKcbLive()
      ? 'Use PROD KEYS from Buni → DefaultApplication → PROD KEYS'
      : 'Use SANDBOX KEYS from Buni, or set KCB_BUNI_ENV empty / non-prod for UAT'
  };
};

const formatPhoneNumber = (phoneNumber) => {
  let digits = String(phoneNumber || '').replace(/\D/g, '');
  if (digits.startsWith('0')) {
    digits = '254' + digits.slice(1);
  } else if (digits.startsWith('254')) {
    /* ok */
  } else if (digits.length === 9) {
    digits = '254' + digits;
  } else if (!digits.startsWith('254')) {
    digits = '254' + digits;
  }
  if (!/^254[17]\d{8}$/.test(digits)) {
    throw new Error('Invalid phone number. Use 0712345678 or 254712345678');
  }
  return digits;
};

const parseKcbStkResponse = (data) => {
  const body = data?.response || data;
  const header = data?.header;
  const responseCode = body?.ResponseCode ?? header?.statusCode;
  if (responseCode !== undefined && responseCode !== '0' && responseCode !== 0) {
    throw new Error(
      body?.ResponseDescription ||
        header?.statusDescription ||
        'M-Pesa request was rejected by KCB'
    );
  }
  return {
    MerchantRequestID: body?.MerchantRequestID,
    CheckoutRequestID: body?.CheckoutRequestID,
    ResponseCode: body?.ResponseCode ?? '0',
    ResponseDescription: body?.ResponseDescription || header?.statusDescription,
    CustomerMessage: body?.CustomerMessage || 'Check your phone for the M-Pesa PIN prompt.'
  };
};

const getAccessToken = async () => {
  logKcbConfig();
  if (!KCB_CONSUMER_KEY || !KCB_CONSUMER_SECRET) {
    throw new Error('KCB Buni API credentials not configured');
  }

  const auth = Buffer.from(`${KCB_CONSUMER_KEY}:${KCB_CONSUMER_SECRET}`).toString('base64');
  const primaryTokenUrl = getTokenUrl();

  const endpointsToTry = [
    { url: primaryTokenUrl, body: 'grant_type=client_credentials' }
  ];

  let lastError = null;

  for (const endpoint of endpointsToTry) {
    console.log('[KCB] Token request attempt:', {
      url: endpoint.url,
      keyPreview: KCB_CONSUMER_KEY.slice(0, 6) + '...',
      mode: useKcbLive() ? 'PRODUCTION' : 'UAT'
    });

    try {
      const response = await axiosKcb.post(
        endpoint.url,
        endpoint.body,
        {
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      const token = response.data?.access_token || response.data?.accessToken;
      if (token) {
        console.log('[KCB] Token obtained successfully from endpoint:', endpoint.url);
        return token;
      }
    } catch (err) {
      lastError = err;
      lastRawKcbError = {
        status: err.response?.status,
        data: err.response?.data || err.message,
        url: endpoint.url
      };
      console.warn('[KCB] Token endpoint attempt failed:', endpoint.url, err.response?.status, err.response?.data || err.message);
    }
  }

  const status = lastError?.response?.status;
  const body = lastError?.response?.data;
  console.error('[KCB] All Token request attempts failed:', {
    status,
    body: JSON.stringify(body || {}),
    code: lastError?.code
  });
  const msg = formatKcbError(lastError);
  throw new Error(msg);
};

/**
 * KCB MpesaExpress payload (per KCB Buni spec):
 * invoiceNumber = "{accountNumber}-{reference}" e.g. 7888067-BK12345678
 * sharedShortCode: true, orgShortCode/orgPassKey: ""
 */
const buildInvoiceNumber = (accountReference) => {
  const ref =
    String(accountReference)
      .replace(/[^a-zA-Z0-9]/g, '')
      .slice(0, 20) || 'BOOKING';
  return `${KCB_ACCOUNT_NUMBER}-${ref}`;
};

const initiateStkPush = async ({
  phoneNumber,
  amount,
  accountReference = 'SpaceBorne',
  transactionDesc = 'Car hire booking payment'
}) => {
  if (!KCB_CALLBACK_URL || KCB_CALLBACK_URL.includes('yourdomain')) {
    throw new Error('KCB_BUNI_CALLBACK_URL is not set to your live site URL');
  }
  if (!KCB_ACCOUNT_NUMBER) {
    throw new Error('KCB_BUNI_ACCOUNT_NUMBER is not configured');
  }

  const formattedPhone = formatPhoneNumber(phoneNumber);
  const accessToken = await getAccessToken();

  const invoiceNumber = buildInvoiceNumber(accountReference);

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

  console.log('[KCB] STK push request:', {
    phone: formattedPhone.slice(0, 6) + '****' + formattedPhone.slice(-2),
    amount: payload.amount,
    invoiceNumber,
    stkUrl: getStkPushUrl()
  });

  try {
    const response = await axiosKcb.post(getStkPushUrl(), payload, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const parsed = parseKcbStkResponse(response.data);
    console.log('[KCB] STK push accepted:', parsed.CheckoutRequestID || 'ok');

    return {
      ...parsed,
      formattedPhone
    };
  } catch (err) {
    // Print the raw STK push rejection payload from KCB!
    console.error('[KCB] Raw STK push error payload:', JSON.stringify(err.response?.data || {}));
    const msg = formatKcbError(err);
    console.error('[KCB] STK push failed:', msg, err.code || '');
    throw new Error(msg);
  }
};

const queryStkStatus = async () => ({
  ResponseCode: '0',
  ResponseDescription: 'Awaiting M-Pesa callback',
  ResultCode: '1032',
  ResultDesc: 'Pending'
});

const isMpesaConfigured = () => {
  const missing = [];
  if (!KCB_CONSUMER_KEY) missing.push('KCB_BUNI_CONSUMER_KEY');
  if (!KCB_CONSUMER_SECRET) missing.push('KCB_BUNI_CONSUMER_SECRET');
  if (!KCB_ACCOUNT_NUMBER) missing.push('KCB_BUNI_ACCOUNT_NUMBER');
  if (!KCB_CALLBACK_URL) missing.push('KCB_BUNI_CALLBACK_URL');
  return {
    configured: missing.length === 0,
    missing
  };
};

const testKcbConnection = async () => {
  const token = await getAccessToken();
  return { ok: true, tokenReceived: Boolean(token) };
};

module.exports = {
  formatPhoneNumber,
  initiateStkPush,
  queryStkStatus,
  isMpesaConfigured,
  logKcbConfig,
  formatKcbError,
  testKcbConnection,
  getKcbDiagnostics,
  getKcbBaseUrl,
  useKcbLive,
  MPESA_CALLBACK_URL: KCB_CALLBACK_URL
};
