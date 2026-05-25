/**
 * M-Pesa API Test Script
 * Run this script to test if your M-Pesa API integration is working
 * Usage: node test-mpesa.js
 */

const axios = require('axios');
require('dotenv').config();

const API_BASE_URL = `http://localhost:${process.env.PORT || 3001}/api/mpesa`;

// ANSI color codes for better console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[36m'
};

// Test phone number (use your actual Safaricom number for sandbox testing)
const TEST_PHONE = '0759477359'; // Your actual phone number
const TEST_AMOUNT = 1; // KES 1 for testing

function log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
}

function logSection(title) {
    console.log('\n' + '='.repeat(60));
    log(title, colors.bright + colors.blue);
    console.log('='.repeat(60));
}

function logSuccess(message) {
    log(`✓ ${message}`, colors.green);
}

function logError(message) {
    log(`✗ ${message}`, colors.red);
}

function logWarning(message) {
    log(`⚠ ${message}`, colors.yellow);
}

// Test 1: Check environment configuration
async function testConfiguration() {
    logSection('TEST 1: Environment Configuration');
    
    const requiredVars = [
        'MPESA_CONSUMER_KEY',
        'MPESA_CONSUMER_SECRET',
        'MPESA_PASSKEY',
        'MPESA_SHORTCODE',
        'MPESA_CALLBACK_URL',
        'MPESA_ENV'
    ];

    let allConfigured = true;

    requiredVars.forEach(varName => {
        if (process.env[varName]) {
            logSuccess(`${varName}: Configured`);
        } else {
            logError(`${varName}: Missing!`);
            allConfigured = false;
        }
    });

    console.log('\nConfiguration Details:');
    log(`Environment: ${process.env.MPESA_ENV || 'Not set'}`, colors.yellow);
    log(`Shortcode: ${process.env.MPESA_SHORTCODE || 'Not set'}`, colors.yellow);
    log(`Callback URL: ${process.env.MPESA_CALLBACK_URL || 'Not set'}`, colors.yellow);

    if (allConfigured) {
        logSuccess('\nAll required environment variables are configured ✓');
        return true;
    } else {
        logError('\nSome environment variables are missing! Please check your .env file');
        return false;
    }
}

// Test 2: Check if backend server is running
async function testServerConnection() {
    logSection('TEST 2: Backend Server Connection');
    
    try {
        // Try to connect to the backend
        const response = await axios.get(`http://localhost:${process.env.PORT || 3001}/api/test`, {
            validateStatus: () => true // Accept any status
        });
        
        logSuccess('Backend server is running and accessible');
        log(`Server URL: http://localhost:${process.env.PORT || 3001}`, colors.yellow);
        return true;
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            logError('Backend server is not running!');
            logWarning('Please start the server with: cd backend && npm start');
        } else {
            logError(`Connection error: ${error.message}`);
        }
        return false;
    }
}

// Test 3: Test STK Push
async function testSTKPush() {
    logSection('TEST 3: STK Push Request');
    
    console.log('\nTest Parameters:');
    log(`Phone Number: ${TEST_PHONE}`, colors.yellow);
    log(`Amount: KES ${TEST_AMOUNT}`, colors.yellow);
    log(`Account Reference: TEST_${Date.now()}`, colors.yellow);

    try {
        logWarning('\n⏳ Sending STK push request...');
        
        const response = await axios.post(`${API_BASE_URL}/stkpush`, {
            phoneNumber: TEST_PHONE,
            amount: TEST_AMOUNT,
            accountReference: `TEST_${Date.now()}`,
            transactionDesc: 'M-Pesa API Test Payment'
        });

        if (response.data.success) {
            logSuccess('\n✓ STK Push sent successfully!');
            console.log('\nResponse Details:');
            console.log(JSON.stringify(response.data, null, 2));
            
            logWarning('\n📱 CHECK YOUR PHONE NOW!');
            logWarning('You should receive an M-Pesa payment prompt');
            logWarning('Enter your M-Pesa PIN to complete the test payment');
            
            // Return checkout request ID for query test
            return {
                success: true,
                checkoutRequestId: response.data.data.CheckoutRequestID
            };
        } else {
            logError('STK Push failed');
            console.log(response.data);
            return { success: false };
        }
    } catch (error) {
        logError('\nSTK Push Request Failed!');
        
        if (error.response) {
            console.log('\nError Response:');
            console.log(JSON.stringify(error.response.data, null, 2));
            
            // Provide specific guidance based on error
            const errorMsg = error.response.data.message || error.response.data.error || '';
            
            if (errorMsg.includes('credentials')) {
                logWarning('\n💡 Tip: Your M-Pesa credentials might be incorrect');
                logWarning('   - Verify your Consumer Key and Secret from Daraja Portal');
                logWarning('   - Make sure you\'re using the correct environment (sandbox/production)');
            } else if (errorMsg.includes('phone') || errorMsg.includes('number')) {
                logWarning('\n💡 Tip: Check your phone number format');
                logWarning('   - Use format: 0712345678 or 254712345678');
                logWarning('   - Must be a valid Safaricom number');
            }
        } else {
            console.log('\nError:', error.message);
        }
        
        return { success: false };
    }
}

// Test 4: Test Query Status (optional, only if STK push succeeded)
async function testQueryStatus(checkoutRequestId) {
    if (!checkoutRequestId) {
        logWarning('Skipping query test (no checkout request ID available)');
        return;
    }

    logSection('TEST 4: Query Payment Status');
    
    logWarning('⏳ Waiting 5 seconds before querying status...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    try {
        const response = await axios.post(`${API_BASE_URL}/query`, {
            checkoutRequestId
        });

        console.log('\nQuery Response:');
        console.log(JSON.stringify(response.data, null, 2));
        
        logSuccess('Query request successful');
    } catch (error) {
        logError('Query request failed');
        if (error.response) {
            console.log(JSON.stringify(error.response.data, null, 2));
        }
    }
}

// Main test runner
async function runTests() {
    console.clear();
    log('\n╔════════════════════════════════════════════════════════════╗', colors.bright + colors.blue);
    log('║          M-PESA API INTEGRATION TEST SUITE                 ║', colors.bright + colors.blue);
    log('╚════════════════════════════════════════════════════════════╝\n', colors.bright + colors.blue);

    // Test 1: Configuration
    const configOk = await testConfiguration();
    if (!configOk) {
        logError('\n⚠ Cannot proceed with tests. Please fix configuration first.');
        return;
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test 2: Server Connection
    const serverOk = await testServerConnection();
    if (!serverOk) {
        logError('\n⚠ Cannot proceed with API tests. Please start the backend server first.');
        logWarning('\nTo start the server:');
        console.log('  cd backend');
        console.log('  npm start');
        return;
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test 3: STK Push
    const stkResult = await testSTKPush();
    
    if (stkResult.success) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Test 4: Query Status
        await testQueryStatus(stkResult.checkoutRequestId);
    }

    // Summary
    logSection('TEST SUMMARY');
    
    if (configOk && serverOk && stkResult.success) {
        logSuccess('\n🎉 All tests passed! Your M-Pesa API is working correctly!');
        logWarning('\n📝 Next Steps:');
        console.log('   1. Complete the test payment on your phone');
        console.log('   2. Check server logs for callback data');
        console.log('   3. Integrate M-Pesa payment into your booking flow');
        console.log('   4. Test with different amounts and phone numbers');
    } else if (configOk && serverOk) {
        logWarning('\n⚠ Tests partially passed. Please check the errors above.');
        logWarning('\n💡 Common Issues:');
        console.log('   - Invalid M-Pesa credentials');
        console.log('   - Wrong phone number format');
        console.log('   - Network connectivity issues');
        console.log('   - M-Pesa service temporarily unavailable');
    } else {
        logError('\n❌ Tests failed. Please fix the issues above and try again.');
    }

    console.log('\n' + '='.repeat(60) + '\n');
}

// Handle errors
process.on('unhandledRejection', (error) => {
    logError(`\nUnhandled error: ${error.message}`);
    process.exit(1);
});

// Run the tests
runTests().catch(error => {
    logError(`\nTest execution failed: ${error.message}`);
    process.exit(1);
});
