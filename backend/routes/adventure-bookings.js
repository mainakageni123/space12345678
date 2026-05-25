const express = require('express');
const router = express.Router();
const AdventureBooking = require('../models/AdventureBooking');
const Adventure = require('../models/Adventure');
const Message = require('../models/Message');
const { notifyNewAdventureBooking } = require('../services/whatsapp');

router.use((req, res, next) => {
    console.log(`Adventure Bookings Route: ${req.method} ${req.originalUrl}`);
    next();
});

// Create new adventure booking
router.post('/', async (req, res) => {
    try {
        console.log('Received adventure booking request:', JSON.stringify(req.body, null, 2));
        
        const { firstName, lastName, phoneNumber, email, adventureId, numberOfParticipants } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !phoneNumber || !email) {
            return res.status(400).json({
                success: false,
                error: 'Please fill in all required fields (name, phone, email)'
            });
        }

        // Check seat availability if adventureId is provided
        if (adventureId) {
            const adventure = await Adventure.findById(adventureId);
            if (adventure) {
                const requestedSeats = numberOfParticipants || 1;
                const availableSeats = adventure.maxParticipants - adventure.bookedSeats;
                
                if (requestedSeats > availableSeats) {
                    return res.status(400).json({
                        success: false,
                        error: `Only ${availableSeats} seat(s) available. You requested ${requestedSeats} seat(s).`,
                        availableSeats
                    });
                }
            }
        }

        // Create booking
        const booking = new AdventureBooking({
            firstName,
            lastName,
            phoneNumber,
            email,
            status: 'pending',
            ...(req.body.adventureId && { adventureId: req.body.adventureId }),
            ...(req.body.adventureTitle && { adventureTitle: req.body.adventureTitle }),
            ...(req.body.adventureLocation && { adventureLocation: req.body.adventureLocation }),
            ...(req.body.adventurePrice && { adventurePrice: req.body.adventurePrice }),
            ...(req.body.numberOfParticipants && { numberOfParticipants: req.body.numberOfParticipants }),
            ...(req.body.preferredDate && { preferredDate: req.body.preferredDate }),
            birthDate: req.body.birthDate,
            idNumber: req.body.idNumber,
            specialRequests: req.body.specialRequests
        });

        await booking.save();
        console.log('Adventure booking saved successfully:', booking._id);

        // Persist a dashboard message for admin (matching car bookings)
        try {
            const msg = new Message({
                firstName,
                lastName,
                phoneNumber,
                email,
                idNumber: req.body.idNumber,
                status: 'new',
                content: `New adventure booking: ${req.body.adventureTitle || 'Unknown Adventure'}`
            });
            await msg.save();
            console.log('Dashboard message created for adventure booking');
        } catch (e) {
            console.warn('Failed to create dashboard message for adventure booking:', e.message);
        }

        // Send WhatsApp notification
        try {
            console.log('Attempting to send WhatsApp notification for adventure booking...');
            await notifyNewAdventureBooking(booking);
        } catch (waErr) {
            console.error('WhatsApp notification failed:', waErr);
        }

        res.status(201).json({
            success: true,
            message: 'Adventure booking created successfully!',
            booking
        });
    } catch (err) {
        console.error('Adventure booking creation error:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to create adventure booking'
        });
    }
});

// Get all adventure bookings
router.get('/', async (req, res) => {
    try {
        const bookings = await AdventureBooking.find().sort({ createdAt: -1 });
        res.json(bookings);
    } catch (err) {
        console.error('Error fetching adventure bookings:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch adventure bookings'
        });
    }
});

// Approve an adventure booking
router.patch('/:id/approve', async (req, res) => {
    try {
        console.log('Approve adventure booking request received:', req.params.id);
        
        const { id } = req.params;
        const { approvedBy } = req.body;
        
        if (!id?.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid booking ID format'
            });
        }

        const booking = await AdventureBooking.findById(id);
        
        if (!booking) {
            return res.status(404).json({
                success: false,
                error: 'Adventure booking not found'
            });
        }

        // Check if already approved to avoid double-counting
        if (booking.status === 'approved') {
            return res.status(400).json({
                success: false,
                error: 'Booking is already approved'
            });
        }

        // Update adventure seats if adventureId exists
        if (booking.adventureId) {
            const adventure = await Adventure.findById(booking.adventureId);
            if (adventure) {
                const requestedSeats = booking.numberOfParticipants || 1;
                const availableSeats = adventure.maxParticipants - adventure.bookedSeats;
                
                // Check if seats are still available
                if (requestedSeats > availableSeats) {
                    return res.status(400).json({
                        success: false,
                        error: `Cannot approve: Only ${availableSeats} seat(s) available. Booking requires ${requestedSeats} seat(s).`
                    });
                }
                
                // Decrease available seats
                adventure.bookedSeats += requestedSeats;
                await adventure.save();
                
                console.log(`Updated adventure ${adventure.title}: booked ${adventure.bookedSeats}/${adventure.maxParticipants} seats`);
            }
        }
        
        booking.status = 'approved';
        booking.approvedBy = approvedBy || 'Admin';
        booking.approvedAt = new Date();
        
        await booking.save();
        
        console.log('Adventure booking approved successfully:', id);
        
        res.status(200).json({
            success: true,
            message: 'Adventure booking approved successfully. Seats have been reserved.',
            booking
        });
    } catch (err) {
        console.error('Error approving adventure booking:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to approve adventure booking',
            message: err.message
        });
    }
});

// Reject an adventure booking
router.patch('/:id/reject', async (req, res) => {
    try {
        const { id } = req.params;
        const { rejectedBy, rejectionReason } = req.body;
        
        if (!id?.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid booking ID format'
            });
        }

        const booking = await AdventureBooking.findById(id);
        
        if (!booking) {
            return res.status(404).json({
                success: false,
                error: 'Adventure booking not found'
            });
        }

        // If booking was previously approved, restore the seats
        if (booking.status === 'approved' && booking.adventureId) {
            const adventure = await Adventure.findById(booking.adventureId);
            if (adventure) {
                const requestedSeats = booking.numberOfParticipants || 1;
                adventure.bookedSeats = Math.max(0, adventure.bookedSeats - requestedSeats);
                await adventure.save();
                console.log(`Restored ${requestedSeats} seat(s) to adventure ${adventure.title}`);
            }
        }

        booking.status = 'rejected';
        booking.rejectedBy = rejectedBy || 'Admin';
        booking.rejectedAt = new Date();
        booking.rejectionReason = rejectionReason || 'No reason provided';
        
        await booking.save();
        
        console.log('Adventure booking rejected successfully:', id);
        res.status(200).json({
            success: true,
            message: 'Adventure booking rejected successfully. Seats have been restored.',
            booking
        });
    } catch (err) {
        console.error('Error rejecting adventure booking:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to reject adventure booking',
            message: err.message
        });
    }
});

// Delete an adventure booking
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id?.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid booking ID format'
            });
        }

        const booking = await AdventureBooking.findById(id);
        
        if (!booking) {
            return res.status(404).json({
                success: false,
                error: 'Adventure booking not found'
            });
        }

        // If booking was approved, restore the seats
        if (booking.status === 'approved' && booking.adventureId) {
            const adventure = await Adventure.findById(booking.adventureId);
            if (adventure) {
                const requestedSeats = booking.numberOfParticipants || 1;
                adventure.bookedSeats = Math.max(0, adventure.bookedSeats - requestedSeats);
                await adventure.save();
                console.log(`Restored ${requestedSeats} seat(s) to adventure ${adventure.title} (booking deleted)`);
            }
        }

        await AdventureBooking.findByIdAndDelete(id);
        
        console.log('Adventure booking deleted successfully:', id);
        res.status(200).json({
            success: true,
            message: 'Adventure booking deleted successfully. Seats have been restored if applicable.',
            booking: {
                id: booking._id,
                customerName: `${booking.firstName} ${booking.lastName}`,
                deletedAt: new Date()
            }
        });
    } catch (err) {
        console.error('Error deleting adventure booking:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to delete adventure booking',
            message: err.message
        });
    }
});

module.exports = router;
