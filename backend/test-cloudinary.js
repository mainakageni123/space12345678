/**
 * Cloudinary Connection Test
 * 
 * This script tests your Cloudinary configuration.
 * Run: node backend/test-cloudinary.js
 */

require('dotenv').config();
const cloudinary = require('cloudinary').v2;

// Check if environment variables are set
const requiredVars = [
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET'
];

console.log('🔍 Checking Cloudinary Configuration...\n');

const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing environment variables:');
  missingVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.error('\n💡 Add these to your backend/.env file');
  process.exit(1);
}

console.log('✅ All environment variables found\n');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('📡 Testing Cloudinary connection...\n');

// Test connection
cloudinary.api.ping()
  .then(result => {
    console.log('✅ Cloudinary connection successful!\n');
    console.log('📊 Account Details:');
    console.log(`   Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME}`);
    console.log(`   API Key: ${process.env.CLOUDINARY_API_KEY.substring(0, 8)}...`);
    console.log(`   Status: ${result.status}`);
    console.log('\n🎉 Your Cloudinary setup is working correctly!');
    console.log('\n💡 Next steps:');
    console.log('   1. Try uploading a vehicle image through the admin panel');
    console.log('   2. Check Cloudinary dashboard to see uploaded images');
    console.log('   3. Verify images display correctly on your site');
  })
  .catch(error => {
    console.error('❌ Cloudinary connection failed!\n');
    console.error('Error Details:');
    console.error(`   Message: ${error.message || error.error?.message || JSON.stringify(error)}`);
    
    if (error.http_code === 401) {
      console.error('\n💡 This usually means:');
      console.error('   - Invalid API credentials');
      console.error('   - Check your .env file values');
      console.error('   - Verify credentials in Cloudinary dashboard');
    } else if (error.http_code === 404) {
      console.error('\n💡 This usually means:');
      console.error('   - Invalid cloud name');
      console.error('   - Check CLOUDINARY_CLOUD_NAME in .env');
    } else {
      console.error('\n💡 Troubleshooting:');
      console.error('   1. Check your internet connection');
      console.error('   2. Verify Cloudinary credentials');
      console.error('   3. Check Cloudinary service status');
    }
    
    process.exit(1);
  });

