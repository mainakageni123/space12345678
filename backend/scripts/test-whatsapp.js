require('dotenv').config();
const { sendWhatsApp } = require('../services/whatsapp');

const test = async () => {
    console.log('Testing WhatsApp notification...');
    console.log('Environment check:');
    console.log('- SID:', process.env.TWILIO_ACCOUNT_SID ? '✅ SET' : '❌ MISSING');
    console.log('- TOKEN:', process.env.TWILIO_AUTH_TOKEN ? '✅ SET' : '❌ MISSING');
    console.log('- FROM:', process.env.TWILIO_WHATSAPP_NUMBER || '❌ MISSING');
    console.log('- TO:', process.env.ADMIN_WHATSAPP_NUMBER || '❌ MISSING');

    const result = await sendWhatsApp('🚀 Hello! This is a test notification from SpaceBorne Car Hire backend.');
    
    if (result) {
        console.log('Test successful! Message SID:', result.sid);
    } else {
        console.log('Test failed. Check logs above.');
    }
};

test();
