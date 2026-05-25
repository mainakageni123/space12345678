# 🔑 Step-by-Step Guide: Get M-Pesa Credentials from Daraja Portal

Follow these exact steps to get working M-Pesa API credentials.

---

## ✅ STEP 1: Go to Daraja Portal

1. Open your browser
2. Go to: **https://developer.safaricom.co.ke/**
3. You'll see the Safaricom Daraja homepage

---

## ✅ STEP 2: Create Account or Login

### If you DON'T have an account:
1. Click **"Sign Up"** or **"Get Started"**
2. Fill in:
   - Email address
   - Password
   - Phone number (Safaricom number preferred)
3. Agree to terms
4. Click **"Create Account"**
5. Check your email for verification link
6. Click the verification link
7. Your account is now active!

### If you HAVE an account:
1. Click **"Login"**
2. Enter your email and password
3. Click **"Sign In"**

---

## ✅ STEP 3: Create a New App

Once logged in:

1. Click **"My Apps"** in the top navigation menu
2. Click the **"Add a New App"** button
3. You'll see a form with these fields:

### Fill in the form:
- **App Name**: `SpaceBorne Car Hire Test` (or any name you want)
- **Description**: `Car rental payment integration for testing`

### Select APIs:
- Find and check: **"Lipa Na M-Pesa Sandbox"**
  - This is the STK Push API for testing
  - Make sure it's checked ✓

4. Click **"Create App"** button at the bottom

---

## ✅ STEP 4: Get Your Consumer Key and Secret

After creating the app:

1. You'll be redirected to your app's page
2. Or click **"My Apps"** → Click on your app name

### You'll see:

**Consumer Key:**
```
Something like: hR8WKuAEl9IQWzT3KVGDWOKTkFjhEcRl0tdULQ3tRJ3SwU4r
```
- Click the **"Copy"** button or select all and copy

**Consumer Secret:**
- Click **"Show"** button next to "Consumer Secret"
- It will reveal something like: `aUzNJOCIm0d7e5GXB4uq3cvkX5irwwGQDVyEDJnGr9A7F4WmrPUoYBaL70GWv5P7`
- Click the **"Copy"** button or select all and copy

---

## ✅ STEP 5: Get the Passkey

1. Click **"APIs"** in the top menu
2. Click on **"Lipa Na M-Pesa Sandbox"**
3. Scroll down to find **"Test Credentials"** section

OR

1. Go directly to: **https://developer.safaricom.co.ke/test_credentials**
2. Find the section: **"Lipa Na M-Pesa Online"**

### You'll see:

**Business Short Code:** `174379`

**Passkey (Test Credentials):**
```
bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
```
- Copy this passkey

---

## ✅ STEP 6: Update Your .env File

1. Open the file: `backend\.env`
2. Replace with your NEW credentials:

```env
PORT=3001
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/...

# M-Pesa API Configuration
MPESA_CONSUMER_KEY=PASTE_YOUR_CONSUMER_KEY_HERE
MPESA_CONSUMER_SECRET=PASTE_YOUR_CONSUMER_SECRET_HERE
MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
MPESA_SHORTCODE=174379
MPESA_CALLBACK_URL=http://localhost:3001/api/mpesa/callback
MPESA_ENV=sandbox
```

3. **Save the file**

---

## ✅ STEP 7: Restart Your Backend Server

1. Stop your backend server (press `Ctrl+C` in the terminal)
2. Start it again:
```bash
cd backend
npm start
```

---

## ✅ STEP 8: Test Your Credentials

Run the diagnostic tool:
```bash
cd backend
npm run diagnose
```

### You should see:
```
✅ ALL CHECKS PASSED!
Your M-Pesa API is properly configured and ready to use!
```

---

## ✅ STEP 9: Test the Full Payment Flow

```bash
cd backend
npm run test:mpesa
```

Make sure to:
1. Update the phone number in `test-mpesa.js` to YOUR number
2. Check your phone for the STK push prompt
3. Enter your M-Pesa PIN

---

## 🚨 TROUBLESHOOTING

### Problem: "Invalid credentials" error when creating app
**Solution:** Make sure you've verified your email address

### Problem: Can't see "Lipa Na M-Pesa Sandbox" option
**Solution:** Refresh the page or try creating the app again

### Problem: Consumer Secret won't show
**Solution:** Click the "Show" button next to it

### Problem: Still getting "Invalid Access Token"
**Solution:** 
1. Make sure you copied the ENTIRE key and secret (no spaces)
2. Check you're using credentials from YOUR app (not someone else's)
3. Make sure the app is active on Daraja Portal

---

## 📝 SUMMARY - What You Need:

From YOUR Daraja app page:
1. ✅ Consumer Key (50+ characters)
2. ✅ Consumer Secret (50+ characters)

From Test Credentials page:
3. ✅ Passkey: `bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919`
4. ✅ Shortcode: `174379`

---

## 🎯 NEXT STEPS

After you get the credentials:
1. Send me the Consumer Key and Consumer Secret
2. I'll update your .env file
3. We'll test it together
4. Your M-Pesa integration will work! 🎉

---

Need help with any specific step? Let me know!
