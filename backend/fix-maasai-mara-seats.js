/**
 * FIX SCRIPT: Reset Maasai Mara booked seats
 * This fixes the bug where 30 seats were booked instead of 1
 * 
 * Usage: node fix-maasai-mara-seats.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const Adventure = require('./models/Adventure');
const AdventureBooking = require('./models/AdventureBooking');

async function fixMaasaiMaraSeats() {
    try {
        console.log('\n🔧 Fixing Maasai Mara seat count bug...\n');
        
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Find Maasai Mara adventure
        const maasaiMara = await Adventure.findOne({ 
            title: { $regex: /maasai mara/i } 
        });

        if (!maasaiMara) {
            console.log('❌ Maasai Mara adventure not found!');
            await mongoose.connection.close();
            return;
        }

        console.log('📍 Found: ' + maasaiMara.title);
        console.log('   Current booked seats:', maasaiMara.bookedSeats);
        console.log('   Max capacity:', maasaiMara.maxParticipants);

        // Count actual approved bookings for this adventure
        const approvedBookings = await AdventureBooking.find({
            adventureId: maasaiMara._id,
            status: 'approved'
        });

        console.log('\n📊 Approved bookings:', approvedBookings.length);
        
        let totalSeatsBooked = 0;
        approvedBookings.forEach((booking, index) => {
            const seats = booking.numberOfParticipants || 1;
            totalSeatsBooked += seats;
            console.log(`   Booking ${index + 1}: ${seats} seat(s)`);
        });

        console.log('\n✅ Correct total booked seats:', totalSeatsBooked);

        // Update the adventure with correct value
        maasaiMara.bookedSeats = totalSeatsBooked;
        await maasaiMara.save();

        console.log('\n🎉 Fixed! Updated Maasai Mara:');
        console.log('   Booked seats:', maasaiMara.bookedSeats);
        console.log('   Available seats:', maasaiMara.maxParticipants - maasaiMara.bookedSeats);

        // Also fix Diani just in case
        const diani = await Adventure.findOne({ 
            title: { $regex: /diani/i } 
        });

        if (diani) {
            const dianiBookings = await AdventureBooking.find({
                adventureId: diani._id,
                status: 'approved'
            });

            let dianiSeats = 0;
            dianiBookings.forEach(booking => {
                dianiSeats += booking.numberOfParticipants || 1;
            });

            diani.bookedSeats = dianiSeats;
            await diani.save();

            console.log('\n📍 Also checked: ' + diani.title);
            console.log('   Booked seats:', diani.bookedSeats);
            console.log('   Available seats:', diani.maxParticipants - diani.bookedSeats);
        }

        console.log('\n✅ All adventures fixed!\n');

        // Close connection
        await mongoose.connection.close();
        console.log('Database connection closed\n');

    } catch (error) {
        console.error('\n❌ Fix failed:', error.message);
        console.error(error);
        process.exit(1);
    }
}

// Run the fix
fixMaasaiMaraSeats();
