/**
 * Migration Script: Initialize bookedSeats for all existing adventures
 * Run this ONCE to prepare existing adventures for seat tracking
 * 
 * Usage: node migrate-adventures.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const Adventure = require('./models/Adventure');

async function migrateAdventures() {
    try {
        console.log('🚀 Starting adventure migration...\n');
        
        // Connect to MongoDB
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Find all adventures that don't have bookedSeats field
        const adventures = await Adventure.find();
        console.log(`Found ${adventures.length} adventures\n`);

        let updated = 0;
        let skipped = 0;

        for (const adventure of adventures) {
            if (adventure.bookedSeats === undefined || adventure.bookedSeats === null) {
                adventure.bookedSeats = 0;
                await adventure.save();
                console.log(`✅ Updated: ${adventure.title} → bookedSeats: 0`);
                updated++;
            } else {
                console.log(`⏭️  Skipped: ${adventure.title} → bookedSeats: ${adventure.bookedSeats} (already set)`);
                skipped++;
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('📊 Migration Summary:');
        console.log('='.repeat(60));
        console.log(`Total Adventures: ${adventures.length}`);
        console.log(`✅ Updated: ${updated}`);
        console.log(`⏭️  Skipped: ${skipped}`);
        console.log('='.repeat(60));

        // Show final status
        console.log('\n📋 Final Adventure Status:');
        console.log('='.repeat(60));
        const updatedAdventures = await Adventure.find();
        for (const adventure of updatedAdventures) {
            const availableSeats = adventure.maxParticipants - adventure.bookedSeats;
            console.log(`\n${adventure.title}`);
            console.log(`  Max Capacity: ${adventure.maxParticipants}`);
            console.log(`  Booked Seats: ${adventure.bookedSeats}`);
            console.log(`  Available: ${availableSeats}`);
        }

        console.log('\n\n✅ Migration completed successfully!');
        console.log('🎉 Your adventures are now ready for seat tracking!\n');

        // Close connection
        await mongoose.connection.close();
        console.log('Database connection closed');

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error(error);
        process.exit(1);
    }
}

// Run migration
migrateAdventures();
