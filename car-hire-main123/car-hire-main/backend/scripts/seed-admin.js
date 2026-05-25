require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB...");
    
    // Check if admin exists
    let adminUser = await Admin.findOne({ username: 'admin' });
    if (adminUser) {
        adminUser.password = 'admin123';
        await adminUser.save();
        console.log('Updated existing admin user password to admin123.');
    } else {
        adminUser = new Admin({ 
            username: 'admin', 
            password: 'admin123', 
            role: 'superadmin' 
        });
        await adminUser.save();
        console.log('Created new admin user with username: admin and password: admin123.');
    }
    
    console.log("Done!");
    process.exit(0);
  } catch (err) {
    console.error("Error creating admin:", err);
    process.exit(1);
  }
}
createAdmin();
