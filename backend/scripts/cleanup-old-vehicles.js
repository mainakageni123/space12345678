/**
 * Cleanup Script for Old Vehicle Images
 * 
 * This script identifies and optionally removes vehicles that have images stored
 * in the old Buffer format (MongoDB) instead of the new Cloudinary URL format.
 * 
 * Usage:
 *   node backend/scripts/cleanup-old-vehicles.js --dry-run  (just show what would be deleted)
 *   node backend/scripts/cleanup-old-vehicles.js --delete   (actually delete old vehicles)
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Vehicle = require('../models/Vehicle');

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || '';
const DB_NAME = process.env.DB_NAME || 'car-hire';

async function findOldVehicles() {
    try {
        await mongoose.connect(MONGODB_URI, { dbName: DB_NAME });
        console.log('✅ Connected to MongoDB');

        // Find vehicles with old Buffer format images
        const allVehicles = await Vehicle.find({});
        console.log(`\n📊 Total vehicles in database: ${allVehicles.length}`);

        const oldVehicles = [];
        const newVehicles = [];

        for (const vehicle of allVehicles) {
            const vehicleObj = vehicle.toObject();
            
            // Check if image is in old Buffer format
            const hasOldImageFormat = vehicleObj.image && 
                typeof vehicleObj.image === 'object' && 
                vehicleObj.image.data instanceof Buffer;

            if (hasOldImageFormat) {
                oldVehicles.push({
                    _id: vehicleObj._id,
                    name: vehicleObj.name || `${vehicleObj.make} ${vehicleObj.model}`,
                    make: vehicleObj.make,
                    model: vehicleObj.model
                });
            } else {
                newVehicles.push({
                    _id: vehicleObj._id,
                    name: vehicleObj.name || `${vehicleObj.make} ${vehicleObj.model}`,
                    image: vehicleObj.image // Should be a URL string
                });
            }
        }

        console.log(`\n🔴 Old format vehicles (Buffer images): ${oldVehicles.length}`);
        console.log(`🟢 New format vehicles (Cloudinary URLs): ${newVehicles.length}`);

        if (oldVehicles.length > 0) {
            console.log('\n📋 Old vehicles (won\'t display images):');
            oldVehicles.forEach(v => {
                console.log(`  - ${v.name} (${v.make} ${v.model}) - ID: ${v._id}`);
            });
        }

        if (newVehicles.length > 0) {
            console.log('\n✅ New vehicles (with Cloudinary URLs):');
            newVehicles.forEach(v => {
                const imagePreview = v.image ? (v.image.substring(0, 50) + '...') : 'No image';
                console.log(`  - ${v.name} - Image: ${imagePreview}`);
            });
        }

        return { oldVehicles, newVehicles };
    } catch (error) {
        console.error('❌ Error:', error);
        throw error;
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
    }
}

async function deleteOldVehicles() {
    try {
        await mongoose.connect(MONGODB_URI, { dbName: DB_NAME });
        console.log('✅ Connected to MongoDB');

        const allVehicles = await Vehicle.find({});
        let deletedCount = 0;

        for (const vehicle of allVehicles) {
            const vehicleObj = vehicle.toObject();
            
            const hasOldImageFormat = vehicleObj.image && 
                typeof vehicleObj.image === 'object' && 
                vehicleObj.image.data instanceof Buffer;

            if (hasOldImageFormat) {
                await Vehicle.findByIdAndDelete(vehicleObj._id);
                console.log(`🗑️  Deleted: ${vehicleObj.name || `${vehicleObj.make} ${vehicleObj.model}`}`);
                deletedCount++;
            }
        }

        console.log(`\n✅ Deleted ${deletedCount} old vehicles`);
    } catch (error) {
        console.error('❌ Error:', error);
        throw error;
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
    }
}

// Main execution
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const shouldDelete = args.includes('--delete');

if (isDryRun) {
    console.log('🔍 DRY RUN MODE - No changes will be made\n');
    findOldVehicles()
        .then(() => {
            console.log('\n💡 To actually delete old vehicles, run:');
            console.log('   node backend/scripts/cleanup-old-vehicles.js --delete');
        })
        .catch(err => {
            console.error('Script failed:', err);
            process.exit(1);
        });
} else if (shouldDelete) {
    console.log('⚠️  DELETE MODE - Old vehicles will be permanently deleted\n');
    console.log('Press Ctrl+C within 5 seconds to cancel...\n');
    
    setTimeout(() => {
        deleteOldVehicles()
            .then(() => {
                console.log('\n✅ Cleanup complete!');
            })
            .catch(err => {
                console.error('Script failed:', err);
                process.exit(1);
            });
    }, 5000);
} else {
    console.log('Usage:');
    console.log('  --dry-run    Show old vehicles without deleting');
    console.log('  --delete     Actually delete old vehicles');
    console.log('\nExample:');
    console.log('  node backend/scripts/cleanup-old-vehicles.js --dry-run');
}





