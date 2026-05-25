const express = require('express');
const router = express.Router();
const PsvBooking = require('../models/PsvBooking');
const Message = require('../models/Message');
const { notifyNewPsvBooking } = require('../services/whatsapp');
const { dbErrorResponse } = require('../utils/dbErrors');

router.use((req, res, next) => {
  console.log(`PSV Bookings Route: ${req.method} ${req.originalUrl}`);
  next();
});

const splitName = (fullName) => {
  const parts = (fullName || '').trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || 'PSV',
    lastName: parts.slice(1).join(' ') || 'Customer'
  };
};

const validateGroupBooking = (body) => {
  const required = ['fullName', 'secondContact', 'phoneNumber', 'email', 'pickupLocation', 'dropoffLocation', 'travelDate', 'groupSize', 'tripDirection'];
  const missing = required.filter((f) => !body[f]?.toString().trim());
  if (missing.length) {
    return `Missing required fields: ${missing.join(', ')}`;
  }
  return null;
};

const validateCorporateBooking = (body) => {
  const required = ['fullName', 'secondContact', 'phoneNumber', 'email', 'dailyPickup', 'dailyDropoff', 'startDate', 'scheduleDuration', 'preferredDays', 'departureTime'];
  const missing = required.filter((f) => !body[f]?.toString().trim());
  if (missing.length) {
    return `Missing required fields: ${missing.join(', ')}`;
  }
  return null;
};

router.post('/', async (req, res) => {
  try {
    const { serviceType } = req.body;
    if (!['group', 'corporate'].includes(serviceType)) {
      return res.status(400).json({ success: false, error: 'Invalid service type' });
    }

    const validationError = serviceType === 'group'
      ? validateGroupBooking(req.body)
      : validateCorporateBooking(req.body);

    if (validationError) {
      return res.status(400).json({ success: false, error: validationError });
    }

    const serviceLabel = serviceType === 'group' ? 'Group Transport' : 'Corporate & Personal';

    const booking = new PsvBooking({
      serviceType,
      serviceLabel,
      fullName: req.body.fullName.trim(),
      secondContact: req.body.secondContact.trim(),
      phoneNumber: req.body.phoneNumber.trim(),
      email: req.body.email.trim(),
      pickupLocation: req.body.pickupLocation?.trim() || '',
      dropoffLocation: req.body.dropoffLocation?.trim() || '',
      travelDate: req.body.travelDate?.trim() || '',
      groupSize: req.body.groupSize?.trim() || '',
      tripDirection: req.body.tripDirection || '',
      dailyPickup: req.body.dailyPickup?.trim() || '',
      dailyDropoff: req.body.dailyDropoff?.trim() || '',
      startDate: req.body.startDate?.trim() || '',
      scheduleDuration: req.body.scheduleDuration?.trim() || '',
      preferredDays: req.body.preferredDays || '',
      departureTime: req.body.departureTime || '',
      companyName: req.body.companyName?.trim() || '',
      additionalNotes: req.body.additionalNotes?.trim() || '',
      status: 'pending'
    });

    await booking.save();

    const { firstName, lastName } = splitName(booking.fullName);
    try {
      const msg = new Message({
        firstName,
        lastName,
        phoneNumber: booking.phoneNumber,
        email: booking.email,
        status: 'new'
      });
      await msg.save();
    } catch (e) {
      console.warn('Failed to create dashboard message for PSV booking:', e.message);
    }

    try {
      await notifyNewPsvBooking(booking);
    } catch (waErr) {
      console.error('WhatsApp notification failed:', waErr);
    }

    res.status(201).json({
      success: true,
      message: 'PSV booking request submitted successfully!',
      booking
    });
  } catch (err) {
    console.error('PSV booking creation error:', err);
    return dbErrorResponse(res, err, 'Failed to create PSV booking');
  }
});

router.get('/', async (req, res) => {
  try {
    const bookings = await PsvBooking.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    console.error('Error fetching PSV bookings:', err);
    return dbErrorResponse(res, err, 'Failed to fetch PSV bookings');
  }
});

router.patch('/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id?.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, error: 'Invalid booking ID format' });
    }

    const booking = await PsvBooking.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'PSV booking not found' });
    }

    if (booking.status === 'approved') {
      return res.status(400).json({ success: false, error: 'Booking is already approved' });
    }

    booking.status = 'approved';
    booking.approvedBy = req.body.approvedBy || 'Admin';
    booking.approvedAt = new Date();
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'PSV booking approved successfully',
      booking
    });
  } catch (err) {
    console.error('Error approving PSV booking:', err);
    return dbErrorResponse(res, err, 'Failed to approve PSV booking');
  }
});

router.patch('/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id?.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, error: 'Invalid booking ID format' });
    }

    const booking = await PsvBooking.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'PSV booking not found' });
    }

    booking.status = 'rejected';
    booking.rejectedBy = req.body.rejectedBy || 'Admin';
    booking.rejectedAt = new Date();
    booking.rejectionReason = req.body.rejectionReason || 'No reason provided';
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'PSV booking rejected successfully',
      booking
    });
  } catch (err) {
    console.error('Error rejecting PSV booking:', err);
    return dbErrorResponse(res, err, 'Failed to reject PSV booking');
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id?.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, error: 'Invalid booking ID format' });
    }

    const booking = await PsvBooking.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'PSV booking not found' });
    }

    await PsvBooking.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'PSV booking deleted successfully',
      booking: { id: booking._id, customerName: booking.fullName }
    });
  } catch (err) {
    console.error('Error deleting PSV booking:', err);
    return dbErrorResponse(res, err, 'Failed to delete PSV booking');
  }
});

module.exports = router;
