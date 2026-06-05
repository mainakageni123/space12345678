const Booking = require('../models/Booking');
const AdventureBooking = require('../models/AdventureBooking');
const PsvBooking = require('../models/PsvBooking');

/**
 * Delete bookings older than 7 years (keeping them for tax compliance requirements)
 */
const cleanOldData = async () => {
  try {
    const sevenYearsAgo = new Date();
    sevenYearsAgo.setFullYear(sevenYearsAgo.getFullYear() - 7);

    console.log(`[Data Retention Job] Running cleanup for completed records older than ${sevenYearsAgo.toISOString()}`);

    // 1. Vehicle bookings (delete completed ones)
    const resultBookings = await Booking.deleteMany({
      createdAt: { $lt: sevenYearsAgo },
      paymentStatus: 'paid'
    });
    console.log(`[Data Retention Job] Deleted ${resultBookings.deletedCount} old vehicle bookings`);

    // 2. Adventure bookings (delete approved/completed ones)
    const resultAdventures = await AdventureBooking.deleteMany({
      createdAt: { $lt: sevenYearsAgo },
      status: { $in: ['approved', 'confirmed'] }
    });
    console.log(`[Data Retention Job] Deleted ${resultAdventures.deletedCount} old adventure bookings`);

    // 3. PSV bookings (delete approved/completed ones)
    const resultPsv = await PsvBooking.deleteMany({
      createdAt: { $lt: sevenYearsAgo },
      status: { $in: ['approved', 'confirmed'] }
    });
    console.log(`[Data Retention Job] Deleted ${resultPsv.deletedCount} old PSV bookings`);

  } catch (error) {
    console.error('[Data Retention Job] Cleanup failed with error:', error.message);
  }
};

module.exports = { cleanOldData };
