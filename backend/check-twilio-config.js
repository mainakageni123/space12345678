require('dotenv').config();

console.log('\n=================================');
console.log('TWILIO CONFIGURATION CHECK');
console.log('=================================\n');

const config = {
    'TWILIO_ACCOUNT_SID': process.env.TWILIO_ACCOUNT_SID,
    'TWILIO_AUTH_TOKEN': process.env.TWILIO_AUTH_TOKEN,
    'TWILIO_WHATSAPP_NUMBER': process.env.TWILIO_WHATSAPP_NUMBER,
    'ADMIN_WHATSAPP_NUMBER': process.env.ADMIN_WHATSAPP_NUMBER
};

let allConfigured = true;

for (const [key, value] of Object.entries(config)) {
    if (!value || value === '' || value === 'undefined') {
        console.log(`❌ ${key}: NOT SET or EMPTY`);
        allConfigured = false;
    } else {
        // Show partial value for security (first 6, last 4 chars)
        let displayValue = value;
        if (value.length > 15) {
            displayValue = value.substring(0, 8) + '...' + value.substring(value.length - 4);
        }
        console.log(`✅ ${key}: ${displayValue}`);
    }
}

console.log('\n=================================');
if (allConfigured) {
    console.log('✅ All Twilio credentials are configured!');
    console.log('\nAttempting to send a test message...\n');
    
    // Try to send a test message
    const twilio = require('twilio');
    const client = twilio(config.TWILIO_ACCOUNT_SID, config.TWILIO_AUTH_TOKEN);
    
    client.messages.create({
        body: '🧪 TEST: Twilio WhatsApp is configured correctly!',
        from: config.TWILIO_WHATSAPP_NUMBER,
        to: config.ADMIN_WHATSAPP_NUMBER
    })
    .then(message => {
        console.log('✅ TEST MESSAGE SENT SUCCESSFULLY!');
        console.log('Message SID:', message.sid);
        console.log('Status:', message.status);
        console.log('\n🎉 Your Twilio WhatsApp integration is working!\n');
    })
    .catch(error => {
        console.log('❌ FAILED TO SEND TEST MESSAGE');
        console.log('Error Code:', error.code);
        console.log('Error Message:', error.message);
        console.log('\nPossible issues:');
        console.log('1. Invalid credentials (check SID and Auth Token)');
        console.log('2. Invalid phone number format (should be whatsapp:+1234567890)');
        console.log('3. WhatsApp number not approved/registered with Twilio');
        console.log('4. Recipient number not in WhatsApp Sandbox approved list');
        console.log('\nFull error:', error);
    });
} else {
    console.log('❌ Missing Twilio credentials!');
    console.log('\nPlease set the following environment variables in your .env file:');
    console.log('- TWILIO_ACCOUNT_SID');
    console.log('- TWILIO_AUTH_TOKEN');
    console.log('- TWILIO_WHATSAPP_NUMBER (format: whatsapp:+14155238886)');
    console.log('- ADMIN_WHATSAPP_NUMBER (format: whatsapp:+254724440293)');
    console.log('\nGet these from: https://console.twilio.com/\n');
}
console.log('=================================\n');
