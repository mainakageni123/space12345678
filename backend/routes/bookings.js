const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Message = require('../models/Message');
const authMiddleware = require('../middleware/auth');
const { notifyNewCarBooking } = require('../services/whatsapp');

router.use((req, res, next) => {
    console.log(`Bookings Route: ${req.method} ${req.originalUrl}`);
    next();
});

router.post('/', async (req, res) => {
    try {
        console.log('Received booking request:', JSON.stringify(req.body, null, 2));
        
        const { firstName, lastName, phoneNumber, email } = req.body;

        // Debug log for required fields
        console.log('Required fields check:', {
            firstName: !!firstName,
            lastName: !!lastName,
            phoneNumber: !!phoneNumber,
            email: !!email
        });

        // Validate required personal information
        if (!firstName || !lastName || !phoneNumber || !email) {
            console.log('Missing required fields:', {
                firstName: !firstName,
                lastName: !lastName,
                phoneNumber: !phoneNumber,
                email: !email
            });
            return res.status(400).json({
                success: false,
                error: 'Please fill in all required fields (name, phone, email)'
            });
        }

        // Create booking with only required fields
        const booking = new Booking({
            firstName,
            lastName,
            phoneNumber,
            email,
            status: 'pending', // Changed from 'new' to 'pending' for approval workflow
            // Add vehicle info if provided
            ...(req.body.vehicleId && { vehicleId: req.body.vehicleId }),
            ...(req.body.vehicleName && { vehicleName: req.body.vehicleName }),
            ...(req.body.vehiclePrice && { vehiclePrice: req.body.vehiclePrice }),
            ...(req.body.vehicleMake && { vehicleMake: req.body.vehicleMake }),
            ...(req.body.vehicleModel && { vehicleModel: req.body.vehicleModel }),
            birthDate: req.body.birthDate,
            licenseNumber: req.body.licenseNumber,
            idNumber: req.body.idNumber
        });

        await booking.save();

        // Persist a customer message for admin dashboard
        try {
            const msg = new Message({
                firstName,
                lastName,
                phoneNumber,
                email,
                licenseNumber: req.body.licenseNumber,
                idNumber: req.body.idNumber,
                status: 'new'
            });
            await msg.save();
        } catch (e) {
            console.warn('Failed to create dashboard message for booking:', e.message);
        }

        // Send WhatsApp notification
        try {
            await notifyNewCarBooking(booking);
        } catch (waErr) {
            console.error('WhatsApp notification failed:', waErr);
        }

        res.status(201).json({
            success: true,
            message: 'Booking created successfully!',
            booking
        });
    } catch (err) {
        console.error('Booking creation error:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to create booking'
        });
    }
});

router.get('/', async (req, res) => {
    try {
        const bookings = await Booking.find().sort({ createdAt: -1 });
        res.json(bookings);
    } catch (err) {
        console.error('Error fetching bookings:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch bookings'
        });
    }
});

// Analytics endpoint - MUST be before /:id routes
router.get('/analytics', async (req, res) => {
    try {
        const { range = '7days' } = req.query;
        
        console.log('Analytics request received for range:', range);
        
        // Calculate date ranges
        const now = new Date();
        let startDate, previousStartDate, previousEndDate;
        
        switch (range) {
            case '7days':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                previousStartDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
                previousEndDate = startDate;
                break;
            case '30days':
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                previousStartDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
                previousEndDate = startDate;
                break;
            case '90days':
                startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                previousStartDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
                previousEndDate = startDate;
                break;
            case 'all':
                startDate = new Date(0); // Beginning of time
                previousStartDate = null;
                previousEndDate = null;
                break;
            default:
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        }

        // Fetch current period bookings
        const currentBookings = await Booking.find({
            createdAt: { $gte: startDate }
        });

        console.log(`Found ${currentBookings.length} bookings in current period`);

        // Fetch previous period bookings for comparison
        let previousBookings = [];
        if (previousStartDate && previousEndDate) {
            previousBookings = await Booking.find({
                createdAt: { $gte: previousStartDate, $lt: previousEndDate }
            });
        }

        // Calculate total bookings
        const totalBookings = currentBookings.length;
        const previousTotalBookings = previousBookings.length;
        const bookingGrowth = previousTotalBookings > 0 
            ? ((totalBookings - previousTotalBookings) / previousTotalBookings) * 100 
            : totalBookings > 0 ? 100 : 0;

        // Calculate total revenue
        const totalRevenue = currentBookings.reduce((sum, booking) => {
            return sum + (booking.vehiclePrice || 0);
        }, 0);
        const previousRevenue = previousBookings.reduce((sum, booking) => {
            return sum + (booking.vehiclePrice || 0);
        }, 0);
        const revenueGrowth = previousRevenue > 0 
            ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 
            : totalRevenue > 0 ? 100 : 0;

        // Calculate unique customers (new vs returning)
        const customerEmails = currentBookings.map(b => b.email);
        const uniqueCustomers = [...new Set(customerEmails)];
        
        // Get all bookings before current period to determine returning customers
        const allPreviousBookings = await Booking.find({
            createdAt: { $lt: startDate }
        });
        const historicalCustomerEmails = new Set(allPreviousBookings.map(b => b.email));
        
        const newCustomers = uniqueCustomers.filter(email => !historicalCustomerEmails.has(email)).length;
        const returningCustomers = uniqueCustomers.length - newCustomers;
        const retentionRate = uniqueCustomers.length > 0 
            ? (returningCustomers / uniqueCustomers.length) * 100 
            : 0;

        // Previous period customer metrics
        const previousPeriodCustomerEmails = previousBookings.map(b => b.email);
        const previousUniqueCustomers = [...new Set(previousPeriodCustomerEmails)];
        const customerGrowth = previousUniqueCustomers.length > 0
            ? ((uniqueCustomers.length - previousUniqueCustomers.length) / previousUniqueCustomers.length) * 100
            : uniqueCustomers.length > 0 ? 100 : 0;

        // Calculate average booking value
        const averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;
        const previousAvgValue = previousTotalBookings > 0 
            ? previousRevenue / previousTotalBookings 
            : 0;
        const avgValueChange = previousAvgValue > 0 
            ? ((averageBookingValue - previousAvgValue) / previousAvgValue) * 100 
            : averageBookingValue > 0 ? 100 : 0;

        // Status breakdown
        const statusCounts = {};
        currentBookings.forEach(booking => {
            const status = booking.status || 'pending';
            statusCounts[status] = (statusCounts[status] || 0) + 1;
        });
        
        const statusBreakdown = Object.keys(statusCounts).map(status => ({
            status,
            count: statusCounts[status],
            percentage: totalBookings > 0 ? (statusCounts[status] / totalBookings) * 100 : 0
        }));

        // Popular vehicles
        const vehicleStats = {};
        currentBookings.forEach(booking => {
            if (booking.vehicleId || booking.vehicleName) {
                const key = booking.vehicleId || booking.vehicleName;
                if (!vehicleStats[key]) {
                    vehicleStats[key] = {
                        vehicleId: booking.vehicleId,
                        vehicleName: booking.vehicleName,
                        vehicleMake: booking.vehicleMake,
                        vehicleModel: booking.vehicleModel,
                        bookings: 0,
                        revenue: 0
                    };
                }
                vehicleStats[key].bookings += 1;
                vehicleStats[key].revenue += booking.vehiclePrice || 0;
            }
        });
        
        const popularVehicles = Object.values(vehicleStats)
            .sort((a, b) => b.bookings - a.bookings);

        // Peak booking days
        const dayCounts = {};
        currentBookings.forEach(booking => {
            const date = new Date(booking.createdAt);
            const dayKey = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            dayCounts[dayKey] = (dayCounts[dayKey] || 0) + 1;
        });
        
        const peakDays = Object.keys(dayCounts)
            .map(day => ({ day, count: dayCounts[day] }))
            .sort((a, b) => b.count - a.count);

        // Calculate rates
        const approvedBookings = currentBookings.filter(b => 
            b.status === 'approved' || b.status === 'confirmed'
        ).length;
        const cancelledBookings = currentBookings.filter(b => 
            b.status === 'cancelled' || b.status === 'rejected'
        ).length;
        
        const approvalRate = totalBookings > 0 
            ? (approvedBookings / totalBookings) * 100 
            : 0;
        const cancellationRate = totalBookings > 0 
            ? (cancelledBookings / totalBookings) * 100 
            : 0;

        // Recent bookings (last 10)
        const recentBookings = currentBookings
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 10);

        // Response object
        const analytics = {
            timeRange: range,
            totalBookings,
            bookingGrowth,
            totalRevenue,
            revenueGrowth,
            newCustomers,
            returningCustomers,
            customerGrowth,
            retentionRate,
            averageBookingValue,
            avgValueChange,
            statusBreakdown,
            popularVehicles,
            peakDays,
            approvalRate,
            cancellationRate,
            avgResponseTime: '< 1h',
            recentBookings
        };

        console.log('Analytics calculated successfully');
        res.json(analytics);
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch analytics',
            message: error.message
        });
    }
});

// Update booking (for payment status, etc.)
router.patch('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        console.log('Updating booking:', id);
        console.log('Update data:', updateData);
        
        if (!id?.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid booking ID format'
            });
        }

        const booking = await Booking.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );
        
        if (!booking) {
            return res.status(404).json({
                success: false,
                error: 'Booking not found'
            });
        }
        
        console.log('Booking updated successfully');
        res.status(200).json({
            success: true,
            message: 'Booking updated successfully',
            booking
        });
    } catch (err) {
        console.error('Error updating booking:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to update booking',
            message: err.message
        });
    }
});

// Approve a booking
router.patch('/:id/approve', async (req, res) => {
    try {
        console.log('Approve booking request received:', req.params.id);
        console.log('Request body:', req.body);
        
        const { id } = req.params;
        const { approvedBy } = req.body; // Admin email or name
        
        if (!id?.match(/^[0-9a-fA-F]{24}$/)) {
            console.log('Invalid booking ID format:', id);
            return res.status(400).json({
                success: false,
                error: 'Invalid booking ID format',
                receivedId: id
            });
        }

        const booking = await Booking.findById(id);
        
        if (!booking) {
            console.log('Booking not found:', id);
            return res.status(404).json({
                success: false,
                error: 'Booking not found',
                bookingId: id
            });
        }

        console.log('Current booking status:', booking.status);
        
        booking.status = 'approved';
        booking.approvedBy = approvedBy || 'Admin';
        booking.approvedAt = new Date();
        
        await booking.save();

        // Automatically mark vehicle as unavailable if vehicleId is present
        if (booking.vehicleId) {
            try {
                const Vehicle = require('../models/Vehicle');
                const vehicle = await Vehicle.findById(booking.vehicleId);
                if (vehicle) {
                    vehicle.availability = false;
                    await vehicle.save();
                    console.log(`Vehicle ${booking.vehicleId} marked as unavailable upon booking approval`);
                }
            } catch (vErr) {
                console.error('Failed to update vehicle availability:', vErr);
                // We don't fail the whole request if vehicle update fails, but we log it
            }
        }
        
        console.log('Booking approved successfully:', id);
        console.log('New booking status:', booking.status);
        
        res.status(200).json({
            success: true,
            message: 'Booking approved successfully',
            booking: {
                id: booking._id,
                status: booking.status,
                approvedBy: booking.approvedBy,
                approvedAt: booking.approvedAt
            }
        });
    } catch (err) {
        console.error('Error approving booking:', err);
        console.error('Error stack:', err.stack);
        res.status(500).json({
            success: false,
            error: 'Failed to approve booking',
            message: err.message,
            details: err.toString()
        });
    }
});

// Reject a booking
router.patch('/:id/reject', async (req, res) => {
    try {
        const { id } = req.params;
        const { rejectedBy, rejectionReason } = req.body; // Admin email/name and reason
        
        if (!id?.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid booking ID format'
            });
        }

        const booking = await Booking.findById(id);
        
        if (!booking) {
            return res.status(404).json({
                success: false,
                error: 'Booking not found'
            });
        }

        booking.status = 'rejected';
        booking.rejectedBy = rejectedBy || 'Admin';
        booking.rejectedAt = new Date();
        booking.rejectionReason = rejectionReason || 'No reason provided';
        
        await booking.save();
        
        console.log('Booking rejected successfully:', id);
        res.status(200).json({
            success: false,
            message: 'Booking rejected successfully',
            booking
        });
    } catch (err) {
        console.error('Error rejecting booking:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to reject booking',
            message: err.message
        });
    }
});

router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id?.match(/^[0-9a-fA-F]{24}$/)) {
            console.log('Invalid booking ID format:', id);
            return res.status(400).json({
                success: false,
                error: 'Invalid booking ID format'
            });
        }

        const booking = await Booking.findById(id);
        
        if (!booking) {
            console.log('Booking not found:', id);
            return res.status(404).json({
                success: false,
                error: 'Booking not found'
            });
        }

        // Check if booking is approved/confirmed (historical)
        const historicalStatuses = ['approved', 'confirmed'];
        const isHistoricalBooking = historicalStatuses.includes(booking.status);

        // If it's a historical booking, only superadmin can delete
        if (isHistoricalBooking) {
            if (req.admin.role !== 'superadmin') {
                console.log(`Admin ${req.admin.username} (${req.admin.role}) attempted to delete approved booking ${id}`);
                return res.status(403).json({
                    success: false,
                    error: 'Access denied. Only superadmin can delete approved or confirmed bookings.',
                    requiresSuperadmin: true,
                    bookingStatus: booking.status
                });
            }
            console.log(`Superadmin ${req.admin.username} deleting approved booking ${id}`);
        } else {
            console.log(`Admin ${req.admin.username} deleting ${booking.status} booking ${id}`);
        }

        await Booking.findByIdAndDelete(id);
        
        console.log('Booking deleted successfully:', id);
        res.status(200).json({
            success: true,
            message: 'Booking deleted successfully',
            booking: {
                id: booking._id,
                customerName: `${booking.firstName} ${booking.lastName}`,
                status: booking.status,
                deletedBy: req.admin.username,
                deletedAt: new Date()
            }
        });
    } catch (err) {
        console.error('Error deleting booking:', err);
        console.error('Error details:', JSON.stringify(err, null, 2));
        res.status(500).json({
            success: false,
            error: 'Failed to delete booking',
            message: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
});

module.exports = router;
