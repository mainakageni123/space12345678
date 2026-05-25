const isDbConnectionError = (err) => {
  if (!err) return false;
  const name = err.name || '';
  const message = err.message || '';
  return (
    name === 'MongooseServerSelectionError' ||
    name === 'MongoServerSelectionError' ||
    name === 'MongoNetworkError' ||
    message.includes('buffering timed out') ||
    message.includes('before initial connection') ||
    message.includes('Client must be connected')
  );
};

const dbErrorResponse = (res, err, fallbackMessage) => {
  if (isDbConnectionError(err)) {
    return res.status(503).json({
      success: false,
      error: 'Database unavailable. Check MongoDB Atlas IP whitelist and backend logs.',
      code: 'DB_DISCONNECTED'
    });
  }
  return res.status(500).json({
    success: false,
    error: fallbackMessage,
    message: err?.message
  });
};

module.exports = { isDbConnectionError, dbErrorResponse };
