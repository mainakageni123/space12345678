const express = require('express');
const router = express.Router();
const axios = require('axios');

// M-Pesa configuration - Add these to your .env file
const MPESA_CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY || '';
const MPESA_CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET || '';
const MPESA_PASSKEY = process.env.MPESA_PASSKEY || '';
const MPESA_SHORTCODE = process.env.MPESA_SHORTCODE || '174379'; // Sandbox shortcode
const MPESA_CALLBACK_URL = process.env.MPESA_CALLBACK_URL || 'https://yourdomain.com/api/mpesa/callback';
const MPESA_ENV = process.env.MPESA_ENV || 'sandbox'; // 'sandbox' or 'production'

// Base URLs
const SANDBOX_URL = 'https://sandbox.safaricom.co.ke';
const PRODUCTION_URL = 'https://api.safaricom.co.ke';
const BASE_URL = MPESA_ENV === 'production' ? PRODUCTION_URL : SANDBOX_URL;

// Generate OAuth token
const getAccessToken = async () => {
    try {
        // Validate credentials
        if (!MPESA_CONSUMER_KEY || !MPESA_CONSUMER_SECRET) {
            console.error('M-Pesa credentials missing!');
            console.error('CONSUMER_KEY exists:', !!MPESA_CONSUMER_KEY);
            console.error('CONSUMER_SECRET exists:', !!MPESA_CONSUMER_SECRET);
            throw new Error('M-Pesa API credentials not configured');
        }

        console.log('Getting M-Pesa access token...');
        console.log('Using environment:', MPESA_ENV);
        console.log('API URL:', `${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`);
        
        const auth = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString('base64');
        
        const response = await axios.get(
            `${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
            {
                headers: {
                    Authorization: `Basic ${auth}`
                }
            }
        );
        
        console.log('Access token obtained successfully');
        return response.data.access_token;
    } catch (error) {
        console.error('=== M-Pesa Access Token Error ===');
        console.error('Status:', error.response?.status);
        console.error('Data:', error.response?.data);
        console.error('Message:', error.message);
        console.error('================================');
        
        const errorMsg = error.response?.data?.errorMessage || error.response?.data?.error_description || 'Invalid M-Pesa credentials';
        throw new Error(errorMsg);
    }
};

// Generate timestamp
const getTimestamp = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
};

// Generate password
const generatePassword = (timestamp) => {
    const data = `${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`;
    return Buffer.from(data).toString('base64');
};

// STK Push - Initiate payment
router.post('/stkpush', async (req, res) => {
    try {
        const { phoneNumber, amount, accountReference, transactionDesc } = req.body;

        // Validate inputs
        if (!phoneNumber || !amount) {
            return res.status(400).json({
                success: false,
                error: 'Phone number and amount are required'
            });
        }

        // Format phone number (ensure it starts with 254)
        let formattedPhone = phoneNumber.toString().trim();
        if (formattedPhone.startsWith('0')) {
            formattedPhone = '254' + formattedPhone.substring(1);
        } else if (formattedPhone.startsWith('+254')) {
            formattedPhone = formattedPhone.substring(1);
        } else if (!formattedPhone.startsWith('254')) {
            formattedPhone = '254' + formattedPhone;
        }

        // Validate phone number format
        if (!/^254[17]\d{8}$/.test(formattedPhone)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid phone number format. Use format: 0712345678 or 254712345678'
            });
        }

        // Get access token
        const accessToken = await getAccessToken();
        
        // Generate timestamp and password
        const timestamp = getTimestamp();
        const password = generatePassword(timestamp);

        // Prepare STK push payload
        const stkPushPayload = {
            BusinessShortCode: MPESA_SHORTCODE,
            Password: password,
            Timestamp: timestamp,
            TransactionType: 'CustomerPayBillOnline',
            Amount: Math.ceil(amount), // Round up to nearest integer
            PartyA: formattedPhone,
            PartyB: MPESA_SHORTCODE,
            PhoneNumber: formattedPhone,
            CallBackURL: MPESA_CALLBACK_URL,
            AccountReference: accountReference || 'SpaceBorne',
            TransactionDesc: transactionDesc || 'Payment for booking'
        };

        console.log('Initiating STK Push:', {
            phone: formattedPhone,
            amount: stkPushPayload.Amount,
            reference: stkPushPayload.AccountReference
        });

        // Make STK push request
        const response = await axios.post(
            `${BASE_URL}/mpesa/stkpush/v1/processrequest`,
            stkPushPayload,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('STK Push Response:', response.data);

        // Return success response
        res.status(200).json({
            success: true,
            message: 'STK push sent successfully',
            data: {
                MerchantRequestID: response.data.MerchantRequestID,
                CheckoutRequestID: response.data.CheckoutRequestID,
                ResponseCode: response.data.ResponseCode,
                ResponseDescription: response.data.ResponseDescription,
                CustomerMessage: response.data.CustomerMessage
            }
        });

    } catch (error) {
        console.error('STK Push Error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to initiate payment',
            message: error.response?.data?.errorMessage || error.message
        });
    }
});

// M-Pesa callback endpoint
router.post('/callback', async (req, res) => {
    try {
        console.log('M-Pesa Callback Received:', JSON.stringify(req.body, null, 2));

        const { Body } = req.body;
        
        if (!Body || !Body.stkCallback) {
            return res.status(400).json({
                success: false,
                error: 'Invalid callback data'
            });
        }

        const { stkCallback } = Body;
        const { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = stkCallback;

        // ResultCode 0 means success
        if (ResultCode === 0) {
            // Payment successful
            const metadata = {};
            
            if (CallbackMetadata && CallbackMetadata.Item) {
                CallbackMetadata.Item.forEach(item => {
                    metadata[item.Name] = item.Value;
                });
            }

            console.log('Payment Successful:', {
                MerchantRequestID,
                CheckoutRequestID,
                Amount: metadata.Amount,
                MpesaReceiptNumber: metadata.MpesaReceiptNumber,
                PhoneNumber: metadata.PhoneNumber
            });

            // TODO: Update your booking status in database here
            // Example: Update booking with payment details
            
        } else {
            // Payment failed
            console.log('Payment Failed:', {
                MerchantRequestID,
                CheckoutRequestID,
                ResultCode,
                ResultDesc
            });
        }

        // Always acknowledge receipt
        res.status(200).json({
            success: true,
            message: 'Callback received'
        });

    } catch (error) {
        console.error('Callback Error:', error);
        res.status(200).json({
            success: true,
            message: 'Callback received'
        });
    }
});

// Query STK Push status
router.post('/query', async (req, res) => {
    try {
        const { checkoutRequestId } = req.body;

        if (!checkoutRequestId) {
            return res.status(400).json({
                success: false,
                error: 'CheckoutRequestID is required'
            });
        }

        const accessToken = await getAccessToken();
        const timestamp = getTimestamp();
        const password = generatePassword(timestamp);

        const queryPayload = {
            BusinessShortCode: MPESA_SHORTCODE,
            Password: password,
            Timestamp: timestamp,
            CheckoutRequestID: checkoutRequestId
        };

        const response = await axios.post(
            `${BASE_URL}/mpesa/stkpushquery/v1/query`,
            queryPayload,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        res.status(200).json({
            success: true,
            data: response.data
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

module.exports = router;
