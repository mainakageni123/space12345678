// Script to create initial admin user
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const dotenv = require('dotenv');

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/car-hire', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const createAdminUser = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/car-hire', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB successfully');

        // Check if admin already exists
        console.log('Checking if admin user exists...');
        const existingAdmin = await Admin.findOne({ username: 'admin' });
        
        if (existingAdmin) {
            console.log('Admin user already exists. Skipping creation.');
            return;
        }

        console.log('Creating new admin user...');
        
        // Delete any existing admin users first to ensure clean state
        await Admin.deleteMany({ username: 'admin' });
        console.log('Cleared any existing admin users');

        // Create new admin user with default credentials
        const admin = new Admin({
            username: 'admin',
            password: 'admin123' // Will be hashed by the model's pre-save hook
        });

        await admin.save();
        
        // Verify the admin was created with correct password
        const verifyAdmin = await Admin.findOne({ username: 'admin' });
        const passwordCheck = await verifyAdmin.comparePassword('admin123');
        console.log('Password verification after save:', passwordCheck ? 'Success' : 'Failed');
        console.log('✅ Admin user created successfully with:');
        console.log('Username: admin');
        console.log('Password: admin123');
        console.log('\nYou can now log in with these credentials.');
    } catch (error) {
        console.error('❌ Error creating admin user:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
    }
};

createAdminUser();