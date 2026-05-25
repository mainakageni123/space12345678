require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Database Connection
connectDB();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'public/uploads');
    // Ensure the uploads directory exists
    if (!fs.existsSync(uploadDir)){
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Create a unique filename with original name
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

const upload = multer({ storage: storage });

// Serve static files from public directory
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Import Vehicle model
const Vehicle = require('./models/Vehicle');

// Routes
// Get all vehicles with filters
app.get('/api/vehicles', async (req, res) => {
  try {
    const { category, status, minPrice, maxPrice } = req.query;
    
    // Build filter object
    const filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const vehicles = await Vehicle.find(filter).sort({ createdAt: -1 });
    res.json(vehicles);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({ message: 'Error fetching vehicles', error: error.message });
  }
});

// Get single vehicle by ID
app.get('/api/vehicles/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    res.json(vehicle);
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    res.status(500).json({ message: 'Error fetching vehicle', error: error.message });
  }
});

// Create new vehicle
app.post('/api/vehicles', upload.single('image'), async (req, res) => {
  try {
    const vehicleData = req.body;
    
    // Add image path if an image was uploaded (match schema field name imageUrl)
    if (req.file) {
      vehicleData.imageUrl = `/uploads/${req.file.filename}`;
    }

    // Parse arrays and objects from form data
    ['features', 'specialFeatures'].forEach(field => {
      if (typeof vehicleData[field] === 'string') {
        try {
          vehicleData[field] = JSON.parse(vehicleData[field]);
        } catch (e) {
          vehicleData[field] = vehicleData[field].split(',').map(item => item.trim());
        }
      }
    });

    // Create and save the vehicle
    const vehicle = new Vehicle(vehicleData);
    const savedVehicle = await vehicle.save();
    
    console.log('Vehicle saved successfully:', savedVehicle);
    res.status(201).json(savedVehicle);
  } catch (error) {
    console.error('Error creating vehicle:', error);
    res.status(400).json({
      message: 'Failed to create vehicle',
      error: error.message,
      details: error.errors
    });
  }
});

// Update vehicle
app.put('/api/vehicles/:id', upload.single('image'), async (req, res) => {
  try {
    const vehicleData = req.body;
    
    if (req.file) {
      vehicleData.imageUrl = `/uploads/${req.file.filename}`;
    }

    ['features', 'specialFeatures'].forEach(field => {
      if (typeof vehicleData[field] === 'string') {
        try {
          vehicleData[field] = JSON.parse(vehicleData[field]);
        } catch (e) {
          vehicleData[field] = vehicleData[field].split(',').map(item => item.trim());
        }
      }
    });

    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      vehicleData,
      { new: true, runValidators: true }
    );

    if (!updatedVehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    res.json(updatedVehicle);
  } catch (error) {
    console.error('Error updating vehicle:', error);
    res.status(400).json({
      message: 'Failed to update vehicle',
      error: error.message,
      details: error.errors
    });
  }
});

app.delete('/api/vehicles/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    await vehicle.remove();
    res.json({ message: 'Vehicle deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Vehicles route
app.get('/vehicles', async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    res.status(200).json(vehicles);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({ message: 'Failed to fetch vehicles' });
  }
});

// Serve uploaded files
app.use('/uploads', express.static('public/uploads'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});