/**
 * EMERGENCY FIX: Delete bad bookings and reset seats
 * This will clean up all the incorrectly created bookings
 * 
 * Usage: node delete-bad-bookings.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const Adventure = require('./models/Adventure');
const AdventureBooking = require('./models/AdventureBooking');

async function cleanupBadBookings() {
    try {
        console.log('\n🚨 EMERGENCY CLEANUP - Removing bad bookings...\n');
        
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Find Maasai Mara
        const maasaiMara = await Adventure.findOne({ 
            title: { $regex: /maasai mara/i } 
        });

        if (!maasaiMara) {
            console.log('❌ Maasai Mara not found!');
            await mongoose.connection.close();
            return;
        }

        console.log('📍 Found: ' + maasaiMara.title);

        // Get all bookings for Maasai Mara
        const badBookings = await AdventureBooking.find({
            adventureId: maasaiMara._id,
            numberOfParticipants: { $gt: 1 } // Find bookings with more than 1 participant
        });

        console.log(`\n🗑️  Found ${badBookings.length} bad bookings to delete\n`);

        if (badBookings.length > 0) {
            // Show what we're deleting
            badBookings.forEach((booking, index) => {
                console.log(`   ${index + 1}. ${booking.firstName} ${booking.lastName}`);
                console.log(`      Participants: ${booking.numberOfParticipants}`);
                console.log(`      Status: ${booking.status}`);
                console.log(`      Created: ${booking.createdAt}`);
                console.log('');
            });

            // Delete them
            const deleteResult = await AdventureBooking.deleteMany({
                adventureId: maasaiMara._id,
                numberOfParticipants: { $gt: 1 }
            });

            console.log(`✅ Deleted ${deleteResult.deletedCount} bad bookings\n`);
        }

        // Reset Maasai Mara seats to 0
        maasaiMara.bookedSeats = 0;
        await maasaiMara.save();

        console.log('🎉 Maasai Mara reset:');
        console.log('   Booked seats: 0');
        console.log('   Available seats: 30');
        console.log('   Status: 🟢 AVAILABLE\n');

        // Also check and clean Diani
        const diani = await Adventure.findOne({ 
            title: { $regex: /diani/i } 
        });

        if (diani) {
            const dianiBadBookings = await AdventureBooking.deleteMany({
                adventureId: diani._id,
                numberOfParticipants: { $gt: 1 }
            });

            if (dianiBadBookings.deletedCount > 0) {
                console.log(`✅ Also cleaned ${dianiBadBookings.deletedCount} bad Diani bookings`);
            }

            diani.bookedSeats = 0;
            await diani.save();

            console.log('📍 Diani also reset:');
            console.log('   Booked seats: 0');
            console.log('   Available seats: 34\n');
        }

        console.log('✅ CLEANUP COMPLETE! Database is now clean.\n');
        console.log('🎯 Next steps:');
        console.log('   1. Refresh your browser');
        console.log('   2. Both adventures should show as available');
        console.log('   3. New bookings will only book 1 seat\n');

        // Close connection
        await mongoose.connection.close();
        console.log('Database connection closed\n');

    } catch (error) {
        console.error('\n❌ Cleanup failed:', error.message);
        console.error(error);
        process.exit(1);
    }
}

// Run the cleanup
cleanupBadBookings();
