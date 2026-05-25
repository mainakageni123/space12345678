/**
 * Test Script for Adventure Seat Management
 * Run this to test the seat tracking functionality
 * 
 * Usage: node test-seat-management.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const Adventure = require('./models/Adventure');
const AdventureBooking = require('./models/AdventureBooking');

async function testSeatManagement() {
    try {
        // Connect to MongoDB
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Get all adventures
        const adventures = await Adventure.find();
        console.log(`Found ${adventures.length} adventures\n`);

        // Display current seat status
        console.log('=== Current Seat Status ===');
        for (const adventure of adventures) {
            console.log(`\n📍 ${adventure.title}`);
            console.log(`   Max Capacity: ${adventure.maxParticipants}`);
            console.log(`   Booked Seats: ${adventure.bookedSeats}`);
            console.log(`   Available Seats: ${adventure.availableSeats}`);
            console.log(`   Status: ${adventure.availableSeats === 0 ? '🔴 FULLY BOOKED' : adventure.availableSeats <= 3 ? '🟡 ALMOST FULL' : '🟢 AVAILABLE'}`);
        }

        // Get booking statistics
        console.log('\n\n=== Booking Statistics ===');
        const totalBookings = await AdventureBooking.countDocuments();
        const approvedBookings = await AdventureBooking.countDocuments({ status: 'approved' });
        const pendingBookings = await AdventureBooking.countDocuments({ status: 'pending' });
        const rejectedBookings = await AdventureBooking.countDocuments({ status: 'rejected' });

        console.log(`Total Bookings: ${totalBookings}`);
        console.log(`✅ Approved: ${approvedBookings}`);
        console.log(`⏳ Pending: ${pendingBookings}`);
        console.log(`❌ Rejected: ${rejectedBookings}`);

        // Show recent bookings
        console.log('\n\n=== Recent Bookings (Last 5) ===');
        const recentBookings = await AdventureBooking
            .find()
            .sort({ createdAt: -1 })
            .limit(5);

        for (const booking of recentBookings) {
            console.log(`\n${booking.firstName} ${booking.lastName}`);
            console.log(`   Adventure: ${booking.adventureTitle}`);
            console.log(`   Participants: ${booking.numberOfParticipants || 1}`);
            console.log(`   Status: ${booking.status}`);
            console.log(`   Created: ${booking.createdAt.toLocaleString()}`);
        }

        console.log('\n\n=== Test Complete ===\n');

        // Close connection
        await mongoose.connection.close();
        console.log('✅ Database connection closed');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

// Run the test
testSeatManagement();
