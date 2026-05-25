/**
 * Direct M-Pesa API Test
 * This tests your credentials DIRECTLY with Safaricom's API
 * Bypassing all our backend code to isolate the issue
 */

const axios = require('axios');
require('dotenv').config();

const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET;
const PASSKEY = process.env.MPESA_PASSKEY;
const SHORTCODE = process.env.MPESA_SHORTCODE;
const PHONE = '0759477359';

console.log('\n🔍 DIRECT M-PESA API TEST\n');
console.log('Testing credentials directly with Safaricom...\n');

async function testDirectAPI() {
    try {
        // Step 1: Get Access Token
        console.log('Step 1: Getting access token...');
        const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
        
        const tokenResponse = await axios.get(
            'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
            {
                headers: {
                    Authorization: `Basic ${auth}`
                }
            }
        );
        
        const accessToken = tokenResponse.data.access_token;
        console.log('✅ Access token received:', accessToken.substring(0, 20) + '...');
        console.log('   Expires in:', tokenResponse.data.expires_in, 'seconds\n');
        
        // Step 2: Generate timestamp and password
        console.log('Step 2: Preparing STK Push...');
        const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
        const password = Buffer.from(`${SHORTCODE}${PASSKEY}${timestamp}`).toString('base64');
        
        console.log('   Timestamp:', timestamp);
        console.log('   Phone:', PHONE);
        console.log('   Amount: KES 1\n');
        
        // Step 3: Send STK Push
        console.log('Step 3: Sending STK Push...');
        const stkResponse = await axios.post(
            'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
            {
                BusinessShortCode: SHORTCODE,
                Password: password,
                Timestamp: timestamp,
                TransactionType: 'CustomerPayBillOnline',
                Amount: 1,
                PartyA: PHONE.startsWith('0') ? '254' + PHONE.substring(1) : PHONE,
                PartyB: SHORTCODE,
                PhoneNumber: PHONE.startsWith('0') ? '254' + PHONE.substring(1) : PHONE,
                CallBackURL: 'https://example.com/callback',
                AccountReference: 'DirectTest',
                TransactionDesc: 'Test Payment'
            },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ STK Push SUCCESSFUL!\n');
        console.log('Response:', JSON.stringify(stkResponse.data, null, 2));
        console.log('\n📱 CHECK YOUR PHONE NOW! (0759477359)');
        console.log('You should receive an M-Pesa payment prompt for KES 1\n');
        
    } catch (error) {
        console.error('\n❌ ERROR!\n');
        
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Error Data:', JSON.stringify(error.response.data, null, 2));
            
            if (error.response.data.errorCode === '404.001.03') {
                console.error('\n💡 This error means:');
                console.error('   - Your app may not have STK Push permissions');
                console.error('   - Or the credentials are for a different API\n');
                console.error('ACTION NEEDED:');
                console.error('1. Go to: https://developer.safaricom.co.ke/');
                console.error('2. Click on your "Spaceborne" app');
                console.error('3. Click "Add API Products"');
                console.error('4. Make sure "M-PESA EXPRESS Sandbox" is checked');
                console.error('5. Save and try again\n');
            }
        } else {
            console.error('Error:', error.message);
        }
    }
}

testDirectAPI();
