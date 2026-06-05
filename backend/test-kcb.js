require('dotenv').config();
const { initiateStkPush } = require('./services/mpesa');

async function testPayment() {
  console.log('Initiating KCB Buni Production STK Push test...');
  console.log(`Using Account Number: ${process.env.KCB_BUNI_ACCOUNT_NUMBER}`);
  
  try {
    const result = await initiateStkPush({
      phoneNumber: '0759477359',
      amount: 1,
      accountReference: 'TEST1234',
      transactionDesc: 'Live integration test'
    });
    
    console.log('\n✅ SUCCESS! STK Push initiated.');
    console.log(JSON.stringify(result, null, 2));
    console.log('\nPlease check your phone for the M-Pesa prompt.');
  } catch (error) {
    console.error('\n❌ ERROR: Failed to initiate STK Push');
    if (error.response && error.response.data) {
      console.error(JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
  }
}

testPayment();
