require('dotenv').config();
const twilio = require('twilio');

async function sendTestMessage() {
    console.log('\n🧪 Sending Test WhatsApp Message...\n');
    
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;
    const toNumber = process.env.ADMIN_WHATSAPP_NUMBER;

    // Verify credentials
    if (!accountSid || !authToken || !fromNumber || !toNumber) {
        console.error('❌ Missing Twilio credentials!');
        console.log('Please check your .env file for:');
        console.log('- TWILIO_ACCOUNT_SID');
        console.log('- TWILIO_AUTH_TOKEN');
        console.log('- TWILIO_WHATSAPP_NUMBER');
        console.log('- ADMIN_WHATSAPP_NUMBER');
        process.exit(1);
    }

    console.log('📋 Configuration:');
    console.log(`   From: ${fromNumber}`);
    console.log(`   To: ${toNumber}`);
    console.log(`   Account: ${accountSid.substring(0, 10)}...`);
    console.log('');

    try {
        const client = twilio(accountSid, authToken);
        
        const message = await client.messages.create({
            body: `🧪 Test Message from SpaceBorne Car Hire
            
This is a test WhatsApp notification sent at ${new Date().toLocaleString('en-KE')}.

If you received this, your Twilio integration is working perfectly! ✅`,
            from: fromNumber,
            to: toNumber
        });

        console.log('✅ SUCCESS! Message sent successfully!');
        console.log('');
        console.log('📨 Message Details:');
        console.log(`   SID: ${message.sid}`);
        console.log(`   Status: ${message.status}`);
        console.log(`   Direction: ${message.direction}`);
        console.log(`   Date: ${message.dateCreated}`);
        console.log('');
        console.log('🎉 Your Twilio WhatsApp integration is working!');
        console.log('');
        
    } catch (error) {
        console.error('❌ FAILED to send message!');
        console.error('');
        console.error('Error Details:');
        console.error(`   Code: ${error.code || 'N/A'}`);
        console.error(`   Message: ${error.message}`);
        console.error('');
        
        if (error.code === 21211) {
            console.error('💡 This error means the "To" phone number is not valid.');
            console.error('   Check that ADMIN_WHATSAPP_NUMBER is in format: whatsapp:+[country][number]');
        } else if (error.code === 21608) {
            console.error('💡 This error means the recipient is not in your WhatsApp Sandbox approved list.');
            console.error('   To fix: Send a WhatsApp message to your Twilio Sandbox number with the join code.');
            console.error('   Visit: https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn');
        } else if (error.code === 20003) {
            console.error('💡 Authentication error - check your Account SID and Auth Token.');
        } else if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
            console.error('💡 Network connection error. Please check your internet connection and try again.');
        }
        
        console.error('');
        console.error('Full error:', error);
        process.exit(1);
    }
}

sendTestMessage();
