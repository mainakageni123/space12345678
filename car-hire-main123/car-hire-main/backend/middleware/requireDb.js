const mongoose = require('mongoose');

const isDbConnected = () => mongoose.connection.readyState === 1;

const requireDb = (req, res, next) => {
  if (!isDbConnected()) {
    return res.status(503).json({
      success: false,
      error: 'Database unavailable',
      code: 'DB_DISCONNECTED'
    });
  }
  next();
};

module.exports = { requireDb, isDbConnected };
