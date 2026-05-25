require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;
const DEFAULT_ADMIN = {
    username: 'admin',
    password: 'admin123'
};

async function resetAdmin() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Remove existing admin
        await Admin.deleteMany({ username: DEFAULT_ADMIN.username });
        console.log('Removed existing admin users');

        // Create new admin
        const admin = new Admin(DEFAULT_ADMIN);
        await admin.save();
        console.log('Created new admin user with default credentials:');
        console.log('Username:', DEFAULT_ADMIN.username);
        console.log('Password:', DEFAULT_ADMIN.password);

        await mongoose.connection.close();
        console.log('Done');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

resetAdmin();