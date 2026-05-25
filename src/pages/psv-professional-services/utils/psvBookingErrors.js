export const getPsvBookingErrorMessage = (res, data) => {
  if (res.status === 404) {
    return 'Booking API not found. Restart the backend (npm run dev:backend) and try again.';
  }
  if (res.status === 503 || data?.code === 'DB_DISCONNECTED') {
    return 'Server cannot reach the database. Check backend logs and MongoDB Atlas IP whitelist.';
  }
  return data?.error || data?.message || 'Failed to submit booking';
};
