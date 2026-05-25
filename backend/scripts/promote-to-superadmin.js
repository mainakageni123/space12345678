// Script to promote an admin user to superadmin role
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
require('dotenv').config();

const promoteToSuperAdmin = async () => {
    try {
        // Connect to MongoDB
        const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Get username from command line args
        const username = process.argv[2];
        
        if (!username) {
            console.log('\n❌ Usage: node promote-to-superadmin.js <username>');
            console.log('Example: node promote-to-superadmin.js admin\n');
            process.exit(1);
        }

        // Find the admin user
        const admin = await Admin.findOne({ username });
        
        if (!admin) {
            console.log(`\n❌ Admin user '${username}' not found\n`);
            process.exit(1);
        }

        // Check current role
        console.log(`\nCurrent role: ${admin.role || 'admin'}`);

        // Update to superadmin
        admin.role = 'superadmin';
        await admin.save();

        console.log(`✅ Successfully promoted '${username}' to superadmin!\n`);
        console.log('New role:', admin.role);
        console.log('\n⚠️  Note: User needs to login again for new permissions to take effect.\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

// Also provide a function to list all admins and their roles
const listAdmins = async () => {
    try {
        const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;
        await mongoose.connect(MONGODB_URI);
        
        const admins = await Admin.find().select('username role createdAt lastLogin');
        
        console.log('\n📋 Admin Users:\n');
        console.log('Username'.padEnd(20), 'Role'.padEnd(15), 'Created'.padEnd(25), 'Last Login');
        console.log('-'.repeat(80));
        
        admins.forEach(admin => {
            const created = admin.createdAt ? new Date(admin.createdAt).toLocaleString() : 'N/A';
            const lastLogin = admin.lastLogin ? new Date(admin.lastLogin).toLocaleString() : 'Never';
            console.log(
                admin.username.padEnd(20),
                (admin.role || 'admin').padEnd(15),
                created.padEnd(25),
                lastLogin
            );
        });
        console.log('\n');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

// Check if --list flag is provided
if (process.argv[2] === '--list' || process.argv[2] === '-l') {
    listAdmins();
} else {
    promoteToSuperAdmin();
}
