require('dotenv').config();
const mongoose = require('mongoose');
const Vehicle = require('../models/Vehicle');

// Local MongoDB connection string
const LOCAL_MONGODB_URI = 'mongodb://localhost:27017/car-hire';

// Atlas connection string (from your current config)
const mongoURI = process.env.MONGODB_URI;

// Default values for required fields
const DEFAULT_VALUES = {
    category: 'Sedan', // Must be one of: 'Sedan', 'SUV', 'Van', 'Luxury', 'Sports', 'Electric', 'Hybrid'
    year: new Date().getFullYear(),
    make: 'Unknown Make',
    model: 'Unknown Model',
    price: 0,
    status: 'available',
    name: 'Unnamed Vehicle'
};

async function migrateData() {
    let localConnection;
    let atlasConnection;

    try {
        // Connect to local MongoDB
        console.log('Connecting to local database...');
        localConnection = await mongoose.createConnection(LOCAL_MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        // Create models for local connection
        const LocalVehicle = localConnection.model('Vehicle', Vehicle.schema);

        // Connect to Atlas
        console.log('Connecting to Atlas...');
        atlasConnection = await mongoose.createConnection(ATLAS_MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        // Create models for Atlas connection
        const AtlasVehicle = atlasConnection.model('Vehicle', Vehicle.schema);

        // Fetch all vehicles from local
        console.log('Fetching vehicles from local database...');
        const vehicles = await LocalVehicle.find({});
        console.log(`Found ${vehicles.length} vehicles in local database`);

        if (vehicles.length === 0) {
            console.log('No vehicles found in local database to migrate');
            process.exit(0);
        }

        // Insert vehicles into Atlas
        console.log('Migrating vehicles to Atlas...');
        for (const vehicle of vehicles) {
            const vehicleData = vehicle.toObject();
            delete vehicleData._id; // Remove _id to let Atlas create new ones
            
            // Fill in any missing required fields with defaults
            for (const [key, value] of Object.entries(DEFAULT_VALUES)) {
                if (!vehicleData[key]) {
                    vehicleData[key] = value;
                    console.log(`Added default ${key}: ${value} for vehicle ${vehicleData.name || 'Unknown'}`);
                }
            }
            
            // Check if vehicle already exists in Atlas (using some unique field like VIN or registration)
            const exists = await AtlasVehicle.findOne({
                $or: [
                    { name: vehicleData.name },
                    { model: vehicleData.model, make: vehicleData.make }
                ]
            });

            if (!exists) {
                const newVehicle = await AtlasVehicle.create(vehicleData);
                console.log(`Migrated vehicle: ${vehicleData.name || vehicleData.model} (ID: ${newVehicle._id})`);
            } else {
                console.log(`Skipped duplicate vehicle: ${vehicleData.name || vehicleData.model}`);
            }
        }

        // Verify migration
        const atlasVehicles = await AtlasVehicle.find({});
        console.log('\nMigration Summary:');
        console.log('------------------');
        console.log(`Local vehicles: ${vehicles.length}`);
        console.log(`Atlas vehicles: ${atlasVehicles.length}`);
        console.log('\nMigration completed successfully!');

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        // Close connections
        if (localConnection) await localConnection.close();
        if (atlasConnection) await atlasConnection.close();
        process.exit(0);
    }
}

migrateData();