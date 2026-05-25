const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Adventure = require('../models/Adventure');

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected Successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Sample adventures to migrate (replace with your actual adventure data)
const sampleAdventures = [
  {
    title: "Safari Adventure",
    description: "Experience the wild beauty of Kenya's national parks",
    location: "Maasai Mara, Kenya",
    duration: "3 days",
    tripType: "Regular",
    price: 15000,
    maxParticipants: 8,
    image: "/images/safari.jpg",
    highlights: ["Game drives", "Cultural visits", "Photography"],
    bestTime: "June - October",
    included: "Transport, accommodation, meals, park fees",
    availability: true
  },
  {
    title: "Mountain Hiking",
    description: "Conquer the peaks of Mount Kenya",
    location: "Mount Kenya, Kenya",
    duration: "5 days",
    tripType: "Adventure",
    price: 25000,
    maxParticipants: 6,
    image: "/images/mountain.jpg",
    highlights: ["Summit attempt", "Camping", "Scenic views"],
    bestTime: "December - March",
    included: "Guide, equipment, meals, camping gear",
    availability: true
  },
  {
    title: "Beach Retreat",
    description: "Relax on the pristine beaches of the Kenyan coast",
    location: "Diani Beach, Kenya",
    duration: "4 days",
    tripType: "Family",
    price: 12000,
    maxParticipants: 12,
    image: "/images/beach.jpg",
    highlights: ["Swimming", "Snorkeling", "Beach activities"],
    bestTime: "Year round",
    included: "Accommodation, meals, water sports",
    availability: true
  }
];

const migrateAdventures = async () => {
  try {
    await connectDB();
    
    // Clear existing adventures
    await Adventure.deleteMany({});
    console.log('Cleared existing adventures');
    
    // Insert new adventures
    const adventures = await Adventure.insertMany(sampleAdventures);
    console.log(`Successfully migrated ${adventures.length} adventures`);
    
    // List the migrated adventures
    adventures.forEach(adv => {
      console.log(`- ${adv.title} (${adv.location})`);
    });
    
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run migration
migrateAdventures();

