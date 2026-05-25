/**
 * Quick M-Pesa Credentials Test
 * This tests ONLY if your Consumer Key and Secret can get an access token
 */

const axios = require('axios');
require('dotenv').config();

const MPESA_CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY;
const MPESA_CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET;
const MPESA_ENV = process.env.MPESA_ENV || 'sandbox';

const BASE_URL = MPESA_ENV === 'production' 
  ? 'https://api.safaricom.co.ke'
  : 'https://sandbox.safaricom.co.ke';

console.log('\n========================================');
console.log('M-PESA CREDENTIALS TEST');
console.log('========================================\n');

console.log('Environment:', MPESA_ENV);
console.log('API URL:', BASE_URL);
console.log('Consumer Key:', MPESA_CONSUMER_KEY ? '✓ Set' : '✗ Missing');
console.log('Consumer Secret:', MPESA_CONSUMER_SECRET ? '✓ Set' : '✗ Missing');
console.log('\nTesting credentials...\n');

async function testCredentials() {
  if (!MPESA_CONSUMER_KEY || !MPESA_CONSUMER_SECRET) {
    console.error('❌ ERROR: Consumer Key or Secret is missing!');
    console.log('\nPlease update your .env file with valid credentials.');
    return;
  }

  try {
    const auth = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString('base64');
    
    const response = await axios.get(
      `${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
      {
        headers: {
          Authorization: `Basic ${auth}`
        }
      }
    );

    console.log('✅ SUCCESS! Your credentials are VALID!\n');
    console.log('Access Token:', response.data.access_token.substring(0, 20) + '...');
    console.log('Expires In:', response.data.expires_in, 'seconds');
    console.log('\n========================================');
    console.log('✓ Your M-Pesa API is ready to use!');
    console.log('========================================\n');

  } catch (error) {
    console.error('❌ FAILED! Your credentials are INVALID!\n');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }

    console.log('\n========================================');
    console.log('HOW TO FIX:');
    console.log('========================================');
    console.log('1. Go to: https://developer.safaricom.co.ke/');
    console.log('2. Login and go to "My Apps"');
    console.log('3. Create a new app or select existing one');
    console.log('4. Copy the Consumer Key and Consumer Secret');
    console.log('5. Update your .env file');
    console.log('6. Restart your backend server');
    console.log('7. Run this test again\n');
  }
}

testCredentials();
