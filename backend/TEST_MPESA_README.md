# M-Pesa API Testing Guide

## Quick Start - Test Your M-Pesa Integration

Follow these steps to test if your M-Pesa API is working:

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Start Backend Server (in one terminal)
```bash
cd backend
npm start
```
**Keep this terminal running!**

### Step 3: Run M-Pesa Test (in another terminal)
```bash
cd backend
npm run test:mpesa
```

## What the Test Does

The test script will automatically:
1. ✅ Check if all M-Pesa environment variables are configured
2. ✅ Verify backend server is running
3. ✅ Send a real STK push to your phone (KES 1)
4. ✅ Query the payment status
5. ✅ Display results with color-coded output

## Expected Output

### ✅ Success (Everything Working):
```
╔════════════════════════════════════════════════════════════╗
║          M-PESA API INTEGRATION TEST SUITE                 ║
╚════════════════════════════════════════════════════════════╝

==============================================================
TEST 1: Environment Configuration
==============================================================
✓ MPESA_CONSUMER_KEY: Configured
✓ MPESA_CONSUMER_SECRET: Configured
✓ MPESA_PASSKEY: Configured
✓ MPESA_SHORTCODE: Configured
✓ MPESA_CALLBACK_URL: Configured
✓ MPESA_ENV: Configured

==============================================================
TEST 2: Backend Server Connection
==============================================================
✓ Backend server is running and accessible

==============================================================
TEST 3: STK Push Request
==============================================================
✓ STK Push sent successfully!

📱 CHECK YOUR PHONE NOW!
You should receive an M-Pesa payment prompt
Enter your M-Pesa PIN to complete the test payment

==============================================================
TEST SUMMARY
==============================================================
🎉 All tests passed! Your M-Pesa API is working correctly!
```

### ❌ Common Errors:

#### Error: "Backend server is not running!"
**Solution:** Start the backend server in another terminal:
```bash
cd backend
npm start
```

#### Error: "Invalid credentials" or "401 Unauthorized"
**Solution:** Your M-Pesa API credentials are incorrect
- Check your `.env` file
- Verify credentials at: https://developer.safaricom.co.ke/
- Make sure Consumer Key and Secret match your app

#### Error: "Invalid phone number format"
**Solution:** Edit `test-mpesa.js` and update the phone number:
```javascript
const TEST_PHONE = '0712345678'; // Change to your actual number
```

## Manual Testing (Alternative)

If you prefer to test manually using Postman or curl:

### Test STK Push:
```bash
curl -X POST http://localhost:3001/api/mpesa/stkpush \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "0712345678",
    "amount": 1,
    "accountReference": "TEST123",
    "transactionDesc": "Test Payment"
  }'
```

## Before Running the Test

1. **Update the test phone number** in `test-mpesa.js`:
   ```javascript
   const TEST_PHONE = '0712345678'; // Your actual Safaricom number
   ```

2. **Make sure your phone has M-Pesa**:
   - Must be a Safaricom number
   - M-Pesa PIN should be set up

3. **Check your environment variables** in `.env`:
   - MPESA_CONSUMER_KEY
   - MPESA_CONSUMER_SECRET
   - MPESA_PASSKEY
   - MPESA_SHORTCODE (174379 for sandbox)
   - MPESA_ENV (sandbox for testing)

## Troubleshooting

### "Module not found: axios"
Run: `npm install` in the backend folder

### "Cannot find module './routes/mpesa'"
Make sure the M-Pesa route is registered in `server.js`

### "Callback not received"
For local testing, you need ngrok:
1. Install: `npm install -g ngrok`
2. Run: `ngrok http 3001`
3. Update MPESA_CALLBACK_URL in .env with the ngrok URL

## Next Steps After Successful Test

1. ✅ Your M-Pesa API is working!
2. 📱 Test with different amounts
3. 🔗 Integrate into your booking flow
4. 🚀 Ready for production (after getting production credentials)

## Need Help?

- **M-Pesa Daraja Portal**: https://developer.safaricom.co.ke/
- **Documentation**: Check `MPESA_SETUP_GUIDE.md`
- **API Support**: apisupport@safaricom.co.ke
