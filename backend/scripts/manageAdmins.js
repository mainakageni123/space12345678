const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const Admin = require('../models/Admin');

// Load environment variables from .env file in backend directory
dotenv.config();

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'car-hire';

async function connectDB() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI, {
            dbName: DB_NAME,
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ MongoDB Connected Successfully');
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error);
        process.exit(1);
    }
}

// Create a new admin user
async function createAdmin(username, password) {
    try {
        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ username });
        if (existingAdmin) {
            console.error('❌ Admin user already exists');
            return false;
        }

        // Create new admin
        const admin = new Admin({
            username,
            password // Will be hashed by the pre-save middleware
        });

        await admin.save();
        console.log('✅ Admin user created successfully');
        return true;
    } catch (error) {
        console.error('❌ Error creating admin:', error);
        return false;
    }
}

// List all admin users
async function listAdmins() {
    try {
        const admins = await Admin.find({}, '-password');
        console.log('\nCurrent Admin Users:');
        console.log('-------------------');
        admins.forEach(admin => {
            console.log(`Username: ${admin.username}`);
            console.log(`Created: ${admin.createdAt}`);
            console.log(`Last Login: ${admin.lastLogin || 'Never'}`);
            console.log('-------------------');
        });
        return admins;
    } catch (error) {
        console.error('❌ Error listing admins:', error);
        return [];
    }
}

// Update admin password
async function updateAdminPassword(username, newPassword) {
    try {
        const admin = await Admin.findOne({ username });
        if (!admin) {
            console.error('❌ Admin user not found');
            return false;
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        
        admin.password = hashedPassword;
        await admin.save();
        
        console.log('✅ Password updated successfully');
        return true;
    } catch (error) {
        console.error('❌ Error updating password:', error);
        return false;
    }
}

// Delete admin user
async function deleteAdmin(username) {
    try {
        // Prevent deleting the last admin
        const adminCount = await Admin.countDocuments();
        if (adminCount <= 1) {
            console.error('❌ Cannot delete the last admin user');
            return false;
        }

        const result = await Admin.deleteOne({ username });
        if (result.deletedCount === 0) {
            console.error('❌ Admin user not found');
            return false;
        }

        console.log('✅ Admin user deleted successfully');
        return true;
    } catch (error) {
        console.error('❌ Error deleting admin:', error);
        return false;
    }
}

// Verify admin credentials
async function verifyAdmin(username, password) {
    try {
        const admin = await Admin.findOne({ username });
        if (!admin) {
            console.error('❌ Admin user not found');
            return false;
        }

        const isMatch = await admin.comparePassword(password);
        if (isMatch) {
            console.log('✅ Admin credentials verified successfully');
            // Update last login time
            admin.lastLogin = new Date();
            await admin.save();
            return true;
        } else {
            console.error('❌ Invalid password');
            return false;
        }
    } catch (error) {
        console.error('❌ Error verifying admin:', error);
        return false;
    }
}

// Main function to handle CLI arguments
async function main() {
    await connectDB();

    const args = process.argv.slice(2);
    const command = args[0];

    switch (command) {
        case 'create':
            if (args.length !== 3) {
                console.log('Usage: node manageAdmins.js create <username> <password>');
                break;
            }
            await createAdmin(args[1], args[2]);
            break;

        case 'list':
            await listAdmins();
            break;

        case 'update-password':
            if (args.length !== 3) {
                console.log('Usage: node manageAdmins.js update-password <username> <newPassword>');
                break;
            }
            await updateAdminPassword(args[1], args[2]);
            break;

        case 'delete':
            if (args.length !== 2) {
                console.log('Usage: node manageAdmins.js delete <username>');
                break;
            }
            await deleteAdmin(args[1]);
            break;

        case 'verify':
            if (args.length !== 3) {
                console.log('Usage: node manageAdmins.js verify <username> <password>');
                break;
            }
            await verifyAdmin(args[1], args[2]);
            break;

        default:
            console.log(`
Admin Management Script
Usage:
  node manageAdmins.js create <username> <password>
  node manageAdmins.js list
  node manageAdmins.js update-password <username> <newPassword>
  node manageAdmins.js delete <username>
  node manageAdmins.js verify <username> <password>
`);
    }

    await mongoose.connection.close();
}

// Run the script
main().catch(console.error);
