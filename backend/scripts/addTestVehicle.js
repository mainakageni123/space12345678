require('dotenv').config();
const mongoose = require('mongoose');
const Vehicle = require('../models/Vehicle');

const MONGODB_URI = process.env.MONGODB_URI;

async function addTestVehicle() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const testVehicle = new Vehicle({
            name: "Test Mercedes Benz",
            make: "Mercedes",
            model: "C200",
            type: "Luxury Sedan",
            price: 5000,
            location: "Nairobi",
            description: "Luxury Mercedes Benz for executive transport",
            features: ["Air Conditioning", "Leather Seats", "GPS Navigation"],
            specifications: {
                seats: 5,
                transmission: "Automatic",
                fuelType: "Petrol"
            },
            availability: true,
            rating: 4.5
        });

        await testVehicle.save();
        console.log('Test vehicle added successfully');

        const count = await Vehicle.countDocuments();
        console.log(`Total vehicles in database: ${count}`);

        await mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
    }
}

addTestVehicle();
