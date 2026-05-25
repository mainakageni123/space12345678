/**
 * M-Pesa Configuration Diagnostic Tool
 * This checks everything needed for M-Pesa to work
 */

const axios = require('axios');
require('dotenv').config();

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[36m',
    bold: '\x1b[1m'
};

function log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
}

console.clear();
log('\n╔════════════════════════════════════════════════════════════╗', colors.bold + colors.blue);
log('║         M-PESA CONFIGURATION DIAGNOSTIC                    ║', colors.bold + colors.blue);
log('╚════════════════════════════════════════════════════════════╝\n', colors.bold + colors.blue);

// Check 1: Environment Variables
log('📋 STEP 1: Checking Environment Variables', colors.bold);
log('─'.repeat(60));

const config = {
    MPESA_CONSUMER_KEY: process.env.MPESA_CONSUMER_KEY,
    MPESA_CONSUMER_SECRET: process.env.MPESA_CONSUMER_SECRET,
    MPESA_PASSKEY: process.env.MPESA_PASSKEY,
    MPESA_SHORTCODE: process.env.MPESA_SHORTCODE,
    MPESA_CALLBACK_URL: process.env.MPESA_CALLBACK_URL,
    MPESA_ENV: process.env.MPESA_ENV
};

let allConfigured = true;

Object.keys(config).forEach(key => {
    if (config[key]) {
        log(`✓ ${key}: Configured`, colors.green);
        // Show partial values for verification
        if (key === 'MPESA_CONSUMER_KEY') {
            log(`  → ${config[key].substring(0, 20)}...`, colors.yellow);
        } else if (key === 'MPESA_CONSUMER_SECRET') {
            log(`  → ${config[key].substring(0, 20)}...`, colors.yellow);
        } else if (key === 'MPESA_PASSKEY') {
            log(`  → ${config[key].substring(0, 20)}...`, colors.yellow);
        } else {
            log(`  → ${config[key]}`, colors.yellow);
        }
    } else {
        log(`✗ ${key}: MISSING!`, colors.red);
        allConfigured = false;
    }
});

if (!allConfigured) {
    log('\n❌ ERROR: Some environment variables are missing!', colors.red);
    log('Please check your .env file in the backend folder\n', colors.yellow);
    process.exit(1);
}

// Check 2: Test Credentials
log('\n🔑 STEP 2: Testing API Credentials', colors.bold);
log('─'.repeat(60));

const BASE_URL = config.MPESA_ENV === 'production' 
    ? 'https://api.safaricom.co.ke'
    : 'https://sandbox.safaricom.co.ke';

log(`Environment: ${config.MPESA_ENV}`, colors.yellow);
log(`API URL: ${BASE_URL}`, colors.yellow);
log('Testing credentials...\n');

async function testCredentials() {
    try {
        const auth = Buffer.from(`${config.MPESA_CONSUMER_KEY}:${config.MPESA_CONSUMER_SECRET}`).toString('base64');
        
        const response = await axios.get(
            `${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
            {
                headers: {
                    Authorization: `Basic ${auth}`
                }
            }
        );

        log('✓ Consumer Key & Secret: VALID!', colors.green);
        log(`  → Access token received (expires in ${response.data.expires_in}s)`, colors.yellow);
        return true;
    } catch (error) {
        log('✗ Consumer Key & Secret: INVALID!', colors.red);
        
        if (error.response) {
            log(`  → Status: ${error.response.status}`, colors.red);
            log(`  → Error: ${error.response.data?.errorMessage || error.response.data?.error_description || 'Unknown error'}`, colors.red);
        }
        
        log('\n❌ YOUR CREDENTIALS ARE WRONG OR EXPIRED!', colors.red + colors.bold);
        return false;
    }
}

// Check 3: Validate Configuration
async function validateConfiguration() {
    log('\n⚙️  STEP 3: Validating Configuration', colors.bold);
    log('─'.repeat(60));
    
    let issues = [];
    
    // Check shortcode
    if (config.MPESA_ENV === 'sandbox' && config.MPESA_SHORTCODE !== '174379') {
        log('⚠ Shortcode: Should be 174379 for sandbox', colors.yellow);
        issues.push('Shortcode should be 174379 for sandbox testing');
    } else {
        log('✓ Shortcode: Correct', colors.green);
    }
    
    // Check passkey
    if (config.MPESA_PASSKEY.length < 50) {
        log('⚠ Passkey: Seems too short', colors.yellow);
        issues.push('Passkey might be incorrect');
    } else {
        log('✓ Passkey: Format looks good', colors.green);
    }
    
    // Check callback URL
    if (config.MPESA_CALLBACK_URL.includes('localhost')) {
        log('⚠ Callback URL: Using localhost (won\'t work for real callbacks)', colors.yellow);
        issues.push('For production or testing callbacks, use ngrok or a public URL');
    } else {
        log('✓ Callback URL: Using public URL', colors.green);
    }
    
    return issues;
}

// Main diagnostic
async function runDiagnostic() {
    const credentialsValid = await testCredentials();
    const issues = await validateConfiguration();
    
    // Summary
    log('\n' + '═'.repeat(60), colors.bold);
    log('📊 DIAGNOSTIC SUMMARY', colors.bold + colors.blue);
    log('═'.repeat(60), colors.bold);
    
    if (credentialsValid && issues.length === 0) {
        log('\n✅ ALL CHECKS PASSED!', colors.green + colors.bold);
        log('Your M-Pesa API is properly configured and ready to use!\n', colors.green);
        
        log('Next Steps:', colors.bold);
        log('1. Restart your backend server if it\'s running');
        log('2. Try the payment again in your app');
        log('3. Use a valid Safaricom number for testing\n');
        
    } else if (credentialsValid && issues.length > 0) {
        log('\n⚠️  CONFIGURATION VALID BUT WITH WARNINGS', colors.yellow + colors.bold);
        log('\nIssues found:', colors.yellow);
        issues.forEach((issue, i) => {
            log(`${i + 1}. ${issue}`, colors.yellow);
        });
        log('\nYour API will work but consider fixing these issues.\n', colors.yellow);
        
    } else {
        log('\n❌ CONFIGURATION FAILED!', colors.red + colors.bold);
        log('\n🔧 WHAT YOU NEED TO FIX:\n', colors.bold);
        
        log('1. GET VALID CREDENTIALS', colors.bold);
        log('   → Go to: https://developer.safaricom.co.ke/');
        log('   → Login to your Daraja account');
        log('   → Go to "My Apps"');
        log('   → Click on your app or create a new one');
        log('   → Copy the Consumer Key and Consumer Secret');
        log('   → Make sure you select "Lipa Na M-Pesa Sandbox"');
        
        log('\n2. GET THE CORRECT PASSKEY', colors.bold);
        log('   → Go to: https://developer.safaricom.co.ke/test_credentials');
        log('   → Find "Lipa Na M-Pesa Online"');
        log('   → Copy the "Passkey" from the Test Credentials section');
        log('   → The sandbox passkey is usually: bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919');
        
        log('\n3. UPDATE YOUR .ENV FILE', colors.bold);
        log('   → Open: backend/.env');
        log('   → Update these values:');
        log('     MPESA_CONSUMER_KEY=your_key_from_daraja');
        log('     MPESA_CONSUMER_SECRET=your_secret_from_daraja');
        log('     MPESA_PASSKEY=your_passkey_from_daraja');
        
        log('\n4. RESTART YOUR SERVER', colors.bold);
        log('   → Stop the backend server (Ctrl+C)');
        log('   → Start it again: npm start');
        log('   → Run this diagnostic again: npm run diagnose\n');
        
        if (issues.length > 0) {
            log('Also fix these issues:', colors.yellow);
            issues.forEach((issue, i) => {
                log(`${i + 1}. ${issue}`, colors.yellow);
            });
        }
        log('');
    }
}

runDiagnostic().catch(error => {
    log(`\n❌ Diagnostic failed: ${error.message}`, colors.red);
    process.exit(1);
});
