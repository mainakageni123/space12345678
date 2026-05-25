const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Store successful IPs in a JSON file
const IP_WHITELIST_FILE = path.join(__dirname, 'whitelist.json');

// Function to get the client's IP address
const getClientIP = () => {
  const os = require('os');
  const interfaces = os.networkInterfaces();
  let clientIP = '';

  // Get the first non-internal IPv4 address
  Object.keys(interfaces).forEach((interfaceName) => {
    interfaces[interfaceName].forEach((interface) => {
      if (interface.family === 'IPv4' && !interface.internal) {
        clientIP = interface.address;
      }
    });
  });

  return clientIP;
};

// Function to load whitelisted IPs
const loadWhitelistedIPs = () => {
  try {
    if (fs.existsSync(IP_WHITELIST_FILE)) {
      const data = fs.readFileSync(IP_WHITELIST_FILE, 'utf8');
      return JSON.parse(data).ips || [];
    }
  } catch (error) {
    console.warn('Error loading whitelist:', error.message);
  }
  return [];
};

// Function to save whitelisted IPs
const saveWhitelistedIP = (ip) => {
  try {
    const whitelistedIPs = loadWhitelistedIPs();
    if (!whitelistedIPs.includes(ip)) {
      whitelistedIPs.push(ip);
      fs.writeFileSync(IP_WHITELIST_FILE, JSON.stringify({ ips: whitelistedIPs }, null, 2));
    }
  } catch (error) {
    console.warn('Error saving to whitelist:', error.message);
  }
};

const connectToDatabase = async () => {
  try {
    // Get current IP
    const clientIP = getClientIP();
    console.log('Current IP:', clientIP);

    // Load whitelisted IPs
    const whitelistedIPs = loadWhitelistedIPs();
    
    if (!whitelistedIPs.includes(clientIP)) {
      console.warn('\n⚠️ Your IP is not in the local whitelist!');
      console.log('\nAction Required:');
      console.log('1. Go to MongoDB Atlas (https://cloud.mongodb.com)');
      console.log('2. Navigate to Network Access');
      console.log('3. Add your IP:', clientIP);
      console.log('\nAfter adding to MongoDB Atlas, the IP will be saved locally.\n');
    }

    // MongoDB connection options
    const options = {
      serverSelectionTimeoutMS: 10000,
      serverApi: {
        version: '1',
        strict: true,
        deprecationErrors: true,
      },
      autoIndex: true,
      retryWrites: true,
    };

    // Attempt connection
    await mongoose.connect(process.env.MONGODB_URI, options);
    
    // If connection successful, save IP to whitelist
    saveWhitelistedIP(clientIP);
    
    console.log('✅ Connected to MongoDB Atlas successfully');
    console.log('Database:', process.env.MONGODB_DB_NAME || 'car-hire');
    
    // Add connection error handler
    mongoose.connection.on('error', (error) => {
      console.error('❌ MongoDB connection error:', error);
      handleConnectionError(error);
    });

    // Add disconnection handler
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected. Attempting to reconnect...');
    });

    return true;
  } catch (error) {
    handleConnectionError(error);
    return false;
  }
};

const handleConnectionError = (error) => {
  console.error('\n❌ MongoDB Connection Error:', error.message);
  console.log('\nTroubleshooting Steps:');
  console.log('1. Check your internet connection');
  console.log('2. Verify MongoDB Atlas is operational: https://status.mongodb.com');
  console.log('3. Confirm your IP is whitelisted in MongoDB Atlas');
  console.log('4. Verify your database credentials');
  console.log('\nYour IP:', getClientIP());
  
  // Exit if this is a critical error
  if (error.name === 'MongooseServerSelectionError') {
    console.log('\n❌ Critical connection error. Please fix the issues above and restart the server.\n');
  }
};

module.exports = {
  connectToDatabase,
  getClientIP,
  loadWhitelistedIPs
};