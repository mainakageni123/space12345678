const mongoose = require('mongoose');
require('dotenv').config();

// Local MongoDB connection string
const LOCAL_MONGODB_URI = 'mongodb://localhost:27017/car-hire';

// Atlas MongoDB connection string (from environment variable)
const ATLAS_MONGODB_URI = process.env.MONGODB_URI;

if (!ATLAS_MONGODB_URI) {
    console.error('ERROR: MONGODB_URI environment variable is not set');
    process.exit(1);
}

// Create connections to both databases
const localMongoose = mongoose.createConnection(LOCAL_MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const atlasMongoose = mongoose.createConnection(ATLAS_MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: {
        version: '1',
        strict: true,
        deprecationErrors: true,
    }
});

// Define Admin schema for both connections
const adminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters']
    },
    lastLogin: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Create models for both connections
const LocalAdmin = localMongoose.model('Admin', adminSchema);
const AtlasAdmin = atlasMongoose.model('Admin', adminSchema);

async function migrateAdminUsers() {
    try {
        console.log('Starting admin users migration...');

        // Get all admin users from local database
        const localAdmins = await LocalAdmin.find({});
        console.log(`Found ${localAdmins.length} admin users in local database`);

        if (localAdmins.length === 0) {
            console.log('No admin users to migrate');
            process.exit(0);
        }

        // Migrate each admin user
        for (const localAdmin of localAdmins) {
            console.log(`Migrating admin user: ${localAdmin.username}`);

            // Check if admin already exists in Atlas
            const existingAtlasAdmin = await AtlasAdmin.findOne({ username: localAdmin.username });
            
            if (existingAtlasAdmin) {
                console.log(`Admin user ${localAdmin.username} already exists in Atlas, skipping...`);
                continue;
            }

            // Create new admin in Atlas
            const atlasAdmin = new AtlasAdmin({
                username: localAdmin.username,
                password: localAdmin.password, // Password is already hashed
                lastLogin: localAdmin.lastLogin,
                createdAt: localAdmin.createdAt,
                updatedAt: localAdmin.updatedAt
            });

            await atlasAdmin.save();
            console.log(`Successfully migrated admin user: ${localAdmin.username}`);
        }

        console.log('Admin users migration completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error during migration:', error);
        process.exit(1);
    }
}

// Run the migration
migrateAdminUsers();