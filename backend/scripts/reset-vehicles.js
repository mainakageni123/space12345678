const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const resetVehicles = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            console.error('❌ MONGODB_URI not found in .env');
            process.exit(1);
        }

        console.log('Connecting to MongoDB...');
        await mongoose.connect(mongoUri);
        console.log('✅ Connected.');

        // Get the Vehicle model - or access collection directly
        // We can just drop the collection or delete many
        const collections = await mongoose.connection.db.listCollections({ name: 'vehicles' }).toArray();
        if (collections.length > 0) {
            console.log('Deleting all vehicles...');
            await mongoose.connection.db.collection('vehicles').deleteMany({});
            console.log('✅ All vehicles deleted.');
        } else {
            console.log('ℹ️ Vehicles collection does not exist.');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

resetVehicles();
