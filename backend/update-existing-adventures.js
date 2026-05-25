/**
 * Quick Update Script: Initialize bookedSeats for ALL existing adventures
 * Run this ONCE to update your database
 * 
 * Usage: node update-existing-adventures.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const Adventure = require('./models/Adventure');

async function updateExistingAdventures() {
    try {
        console.log('\n🚀 Starting database update...\n');
        
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Update ALL adventures that don't have bookedSeats
        const result = await Adventure.updateMany(
            { bookedSeats: { $exists: false } },
            { $set: { bookedSeats: 0 } }
        );

        console.log('📊 Update Results:');
        console.log(`   Modified: ${result.modifiedCount} adventures`);
        console.log(`   Matched: ${result.matchedCount} adventures\n`);

        // Show all adventures with their seat status
        const adventures = await Adventure.find();
        console.log('📋 Final Status:');
        console.log('='.repeat(70));
        
        for (const adv of adventures) {
            const available = adv.maxParticipants - (adv.bookedSeats || 0);
            console.log(`\n${adv.title}`);
            console.log(`   Location: ${adv.location}`);
            console.log(`   Max Capacity: ${adv.maxParticipants}`);
            console.log(`   Booked Seats: ${adv.bookedSeats}`);
            console.log(`   Available: ${available}`);
            console.log(`   Status: ${available === 0 ? '🔴 FULLY BOOKED' : available <= 3 ? '🟡 ALMOST FULL' : '🟢 AVAILABLE'}`);
        }
        
        console.log('\n' + '='.repeat(70));
        console.log('\n✅ Database update completed successfully!');
        console.log('🎉 All adventures are now ready for seat tracking!\n');

        // Close connection
        await mongoose.connection.close();
        console.log('Database connection closed\n');

    } catch (error) {
        console.error('\n❌ Update failed:', error.message);
        console.error(error);
        process.exit(1);
    }
}

// Run the update
updateExistingAdventures();
