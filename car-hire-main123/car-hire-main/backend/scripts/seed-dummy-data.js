require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Vehicle = require('../models/Vehicle');
const Adventure = require('../models/Adventure');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Missing MONGODB_URI in .env");
  process.exit(1);
}

// High quality unsplash car images
const carImages = [
  "https://images.unsplash.com/photo-1503376712353-c25eb4232c7f?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1502877338535-493e5c01d5ce?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&auto=format&fit=crop"
];

// High quality unsplash safari/trip images
const tripImages = [
  "https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1539667468225-eebb663053e6?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=800&auto=format&fit=crop"
];

function getRandomImages(sourceArray, count) {
    const shuffled = [...sourceArray].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

const seedCars = [
  {
    name: "Toyota Land Cruiser V8",
    make: "Toyota",
    model: "Land Cruiser",
    type: "SUV",
    seats: 7,
    price: 15000,
    description: "Perfect for off-road and luxury travel.",
    features: ["4WD", "Leather Seats", "Sunroof", "Bluetooth"],
    pricing: { hourly1: 2000, hourly3: 5500, hourly6: 10000, hourly12: 18000, daily: 30000, daily2: 58000, daily3: 85000 },
    availability: true
  },
  {
    name: "Mercedes Benz E-Class",
    make: "Mercedes Benz",
    model: "E-Class",
    type: "Luxury",
    seats: 4,
    price: 12000,
    description: "Executive travel at its best.",
    features: ["AC", "Leather Seats", "Premium Audio"],
    pricing: { hourly1: 1500, hourly3: 4000, hourly6: 7500, hourly12: 14000, daily: 25000, daily2: 48000, daily3: 70000 },
    availability: true
  },
  {
    name: "Range Rover Sport",
    make: "Land Rover",
    model: "Range Rover Sport",
    type: "SUV",
    seats: 5,
    price: 20000,
    description: "Ultimate luxury and power combined.",
    features: ["4WD", "Panoramic Roof", "Heated Seats"],
    pricing: { hourly1: 2500, hourly3: 7000, hourly6: 13000, hourly12: 25000, daily: 45000, daily2: 85000, daily3: 120000 },
    availability: true
  },
  {
    name: "Toyota Alphard",
    make: "Toyota",
    model: "Alphard",
    type: "Van",
    seats: 7,
    price: 10000,
    description: "Comfortable and spacious van for group VIP travel.",
    features: ["Reclining Seats", "Dual AC", "Power Doors"],
    pricing: { hourly1: 1200, hourly3: 3500, hourly6: 6500, hourly12: 12000, daily: 20000, daily2: 38000, daily3: 55000 },
    availability: true
  },
  {
    name: "Mazda CX-5",
    make: "Mazda",
    model: "CX-5",
    type: "SUV",
    seats: 5,
    price: 6000,
    description: "Sleek, efficient, and comfortable for city and highway.",
    features: ["Bluetooth", "Backup Camera", "Keyless Entry"],
    pricing: { hourly1: 800, hourly3: 2000, hourly6: 3800, hourly12: 7000, daily: 12000, daily2: 22000, daily3: 30000 },
    availability: true
  }
];

const seedTrips = [
  {
    title: "Maasai Mara Safari",
    location: "Maasai Mara",
    duration: "3 Days",
    tripType: "Family",
    price: 45000,
    maxParticipants: 10,
    highlights: ["Big 5", "Wildebeest Migration", "Luxury Camping"],
    availability: true
  },
  {
    title: "Amboseli Elephant Trail",
    location: "Amboseli National Park",
    duration: "2 Days",
    tripType: "Regular",
    price: 25000,
    maxParticipants: 8,
    highlights: ["Mt. Kilimanjaro View", "Elephant Herds", "Nature Walks"],
    availability: true
  },
  {
    title: "Mt. Kenya Hiking Expedition",
    location: "Mt. Kenya",
    duration: "4 Days",
    tripType: "Adventure",
    price: 35000,
    maxParticipants: 6,
    highlights: ["Lenana Peak", "Alpine Scenery", "Camping"],
    availability: true
  },
  {
    title: "Diani Beach Retreat",
    location: "Diani Beach, Mombasa",
    duration: "5 Days",
    tripType: "Family",
    price: 55000,
    maxParticipants: 12,
    highlights: ["White Sand Beaches", "Snorkeling", "Luxury Resort"],
    availability: true
  },
  {
    title: "Hell's Gate Day Trip",
    location: "Naivasha",
    duration: "1 Day",
    tripType: "Corporate",
    price: 5000,
    maxParticipants: 15,
    highlights: ["Cycling", "Gorge Hiking", "Hot Springs"],
    availability: true
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB for seeding...");

    // Seed Cars
    for (const carData of seedCars) {
      const imgs = getRandomImages(carImages, 4); // 4 images per car to test carousel
      carData.image = imgs[0];
      carData.images = imgs;
      
      const newCar = new Vehicle(carData);
      await newCar.save();
    }
    console.log(`Seeded ${seedCars.length} cars with images!`);

    // Seed Trips
    for (const tripData of seedTrips) {
      const imgs = getRandomImages(tripImages, 4); // 4 images per trip
      tripData.image = imgs[0];
      tripData.images = imgs; // Since we updated the schema, this works!

      const newTrip = new Adventure(tripData);
      await newTrip.save();
    }
    console.log(`Seeded ${seedTrips.length} trips with images!`);

    console.log("Seeding complete!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

seed();
