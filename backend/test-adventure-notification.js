const { notifyNewAdventureBooking } = require('./services/whatsapp');
require('dotenv').config();

async function testNotification() {
    const mockBooking = {
        firstName: 'Test',
        lastName: 'User',
        phoneNumber: '+254700000000',
        email: 'test@example.com',
        adventureTitle: 'Test Safari Adventure',
        numberOfParticipants: 2,
        adventurePrice: 5000,
        status: 'pending'
    };

    console.log('Sending test adventure notification...');
    try {
        const result = await notifyNewAdventureBooking(mockBooking);
        if (result) {
            console.log('✅ Success! Message SID:', result.sid);
        } else {
            console.log('❌ Failed. Check your environment variables.');
        }
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

testNotification();
