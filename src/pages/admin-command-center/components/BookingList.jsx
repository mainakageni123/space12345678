import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../../config/api';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const BookingList = () => {
  const [bookings, setBookings] = useState([]);
  const [adventureBookings, setAdventureBookings] = useState([]);
  const [psvBookings, setPsvBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, bookingId: null, bookingType: 'vehicle' });
  const [feedback, setFeedback] = useState({ show: false, type: '', message: '' });
  const [bookingType, setBookingType] = useState('vehicle'); // 'vehicle' | 'adventure' | 'psv'
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'history'
  const [rejectDialog, setRejectDialog] = useState({ open: false, bookingId: null, reason: '', bookingType: 'vehicle' });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchAllBookings();
  }, []);

  const fetchAllBookings = async () => {
    setLoading(true);
    await Promise.all([fetchBookings(), fetchAdventureBookings(), fetchPsvBookings()]);
    setLoading(false);
  };

  const getApiEndpoint = (type) => {
    if (type === 'adventure') return 'adventure-bookings';
    if (type === 'psv') return 'psv-bookings';
    return 'bookings';
  };

  const getTypeLabel = (type) => {
    if (type === 'adventure') return 'Adventure';
    if (type === 'psv') return 'PSV';
    return 'Vehicle';
  };

  const fetchBookings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings`);
      if (!response.ok) {
        throw new Error('Failed to fetch vehicle bookings');
      }
      const data = await response.json();
      setBookings(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchAdventureBookings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/adventure-bookings`);
      if (!response.ok) {
        throw new Error('Failed to fetch adventure bookings');
      }
      const data = await response.json();
      setAdventureBookings(data);
    } catch (err) {
      console.error('Error fetching adventure bookings:', err);
    }
  };

  const fetchPsvBookings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/psv-bookings`);
      if (!response.ok) {
        throw new Error('Failed to fetch PSV bookings');
      }
      const data = await response.json();
      setPsvBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching PSV bookings:', err);
    }
  };

  const currentBookingsList =
    bookingType === 'vehicle' ? bookings
    : bookingType === 'adventure' ? adventureBookings
    : psvBookings;

  // Filter bookings based on active tab
  const filteredBookings = currentBookingsList.filter(booking => {
    if (activeTab === 'pending') {
      return booking.status === 'pending' || booking.status === 'new';
    } else {
      return booking.status === 'approved';
    }
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Handle booking approval
  const handleApprove = async (bookingId, type = 'vehicle') => {
    setIsProcessing(true);
    try {
      const endpoint = getApiEndpoint(type);
      console.log('Approving booking:', bookingId);
      console.log('API URL:', `${API_BASE_URL}/${endpoint}/${bookingId}/approve`);
      
      const adminName = sessionStorage.getItem('admin_username') || sessionStorage.getItem('admin_email') || 'Admin';
      const response = await fetch(`${API_BASE_URL}/${endpoint}/${bookingId}/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ approvedBy: adminName })
      });

      console.log('Response status:', response.status);
      
      let result;
      try {
        result = await response.json();
        console.log('Response data:', result);
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        throw new Error('Invalid response from server');
      }
      
      if (!response.ok) {
        console.error('Approval failed:', result);
        throw new Error(result.error || result.message || 'Failed to approve booking');
      }

      showFeedback('success', `${getTypeLabel(type)} booking approved successfully`);
      await fetchAllBookings();
    } catch (err) {
      console.error('Error approving booking:', err);
      showFeedback('error', `Failed to approve booking: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle booking rejection
  const handleReject = async () => {
    if (!rejectDialog.reason.trim()) {
      showFeedback('error', 'Please provide a reason for rejection');
      return;
    }

    setIsProcessing(true);
    try {
      const endpoint = getApiEndpoint(rejectDialog.bookingType);
      const adminName = sessionStorage.getItem('admin_username') || sessionStorage.getItem('admin_email') || 'Admin';
      const response = await fetch(`${API_BASE_URL}/${endpoint}/${rejectDialog.bookingId}/reject`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          rejectedBy: adminName,
          rejectionReason: rejectDialog.reason 
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to reject booking');
      }

      showFeedback('success', `${getTypeLabel(rejectDialog.bookingType)} booking rejected successfully`);
      setRejectDialog({ open: false, bookingId: null, reason: '', bookingType: 'vehicle' });
      await fetchAllBookings();
    } catch (err) {
      showFeedback('error', `Failed to reject booking: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Function to show feedback message
  const showFeedback = (type, message) => {
    setFeedback({ show: true, type, message });
    setTimeout(() => setFeedback({ show: false, type: '', message: '' }), 3000);
  };

  // Function to open delete confirmation dialog
  const confirmDelete = (bookingId, type = 'vehicle') => {
    setDeleteDialog({ open: true, bookingId, bookingType: type });
  };

  const [isDeleting, setIsDeleting] = useState(false);

  // Function to handle actual deletion
  const handleDelete = async () => {
    setIsDeleting(true);
    const bookingId = deleteDialog.bookingId;
    const deleteType = deleteDialog.bookingType;
    console.log('Attempting to delete booking:', bookingId, 'Type:', deleteType);

    try {
      if (!bookingId) {
        throw new Error('No booking ID provided');
      }

      const endpoint = getApiEndpoint(deleteType);
      const apiUrl = `${API_BASE_URL}/${endpoint}/${bookingId}`;
      console.log('Delete request to:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      console.log('Delete response status:', response.status);
      
      let result;
      try {
        const text = await response.text();
        console.log('Raw response:', text);
        result = JSON.parse(text);
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        throw new Error('Invalid response from server');
      }

      if (!response.ok) {
        throw new Error(
          result.error ||
          result.message ||
          `Server error: ${response.status} ${response.statusText}`
        );
      }

      if (result.success) {
        console.log('Delete successful:', result);
        showFeedback('success', result.message || `${getTypeLabel(deleteType)} booking deleted successfully`);
        await fetchAllBookings();
      } else {
        throw new Error(result.error || 'Operation failed');
      }
    } catch (err) {
      console.error('Delete operation failed:', err);
      showFeedback('error', `Failed to delete booking: ${err.message}`);
    } finally {
      setIsDeleting(false);
      setDeleteDialog({ open: false, bookingId: null, bookingType: 'vehicle' });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-600 mb-4">
          <Icon name="AlertCircle" className="w-12 h-12 mx-auto mb-2" />
          Error loading bookings
        </div>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={fetchBookings} variant="secondary">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto relative">
      {/* Feedback Alert */}
      {feedback.show && (
        <div className={`fixed top-4 right-4 z-50 rounded-lg px-4 py-3 shadow-lg transition-all ${feedback.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          <div className="flex items-center gap-2">
            <Icon name={feedback.type === 'success' ? 'CheckCircle' : 'AlertCircle'} className="w-5 h-5" />
            <p>{feedback.message}</p>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.open}
        onClose={() => !isDeleting && setDeleteDialog({ open: false, bookingId: null, bookingType: 'vehicle' })}
        onConfirm={handleDelete}
        title="Delete Booking"
        message="Are you sure you want to delete this booking? This action cannot be undone."
        isLoading={isDeleting}
      />
      {/* Booking Type Tabs */}
      <div className="flex border-b border-gray-300 mb-2 px-6 bg-gray-50">
        <button
          onClick={() => setBookingType('vehicle')}
          className={`px-6 py-4 font-semibold text-base border-b-4 transition-colors ${
            bookingType === 'vehicle'
              ? 'border-blue-600 text-blue-600 bg-white'
              : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-100'
          }`}
        >
          <Icon name="Car" className="w-5 h-5 inline mr-2" />
          Vehicle Bookings ({bookings.length})
        </button>
        <button
          onClick={() => setBookingType('adventure')}
          className={`px-6 py-4 font-semibold text-base border-b-4 transition-colors ${
            bookingType === 'adventure'
              ? 'border-purple-600 text-purple-600 bg-white'
              : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-100'
          }`}
        >
          <Icon name="MapPin" className="w-5 h-5 inline mr-2" />
          Adventure Bookings ({adventureBookings.length})
        </button>
        <button
          onClick={() => setBookingType('psv')}
          className={`px-6 py-4 font-semibold text-base border-b-4 transition-colors ${
            bookingType === 'psv'
              ? 'border-amber-600 text-amber-700 bg-white'
              : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-100'
          }`}
        >
          <Icon name="Briefcase" className="w-5 h-5 inline mr-2" />
          PSV Bookings ({psvBookings.length})
        </button>
      </div>

      {/* Status Tabs (Pending/History) */}
      <div className="flex border-b border-gray-200 mb-6 px-6">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'pending'
              ? 'border-yellow-600 text-yellow-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Icon name="Clock" className="w-4 h-4 inline mr-2" />
          Pending Approval ({currentBookingsList.filter(b => b.status === 'pending' || b.status === 'new').length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'history'
              ? 'border-green-600 text-green-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Icon name="CheckCircle" className="w-4 h-4 inline mr-2" />
          Booking History ({currentBookingsList.filter(b => b.status === 'approved').length})
        </button>
      </div>

      <div className="flex justify-between items-center mb-6 px-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {activeTab === 'pending' ? 'Pending Bookings' : 'Approved Bookings'}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {filteredBookings.length} {filteredBookings.length === 1 ? 'booking' : 'bookings'} found
          </p>
        </div>
        <div className="flex gap-3">
          {activeTab === 'history' && filteredBookings.length > 0 && (
            <Button
              variant="outline"
              onClick={() => {
                const doc = new jsPDF();
                
                // Add header
                doc.setFontSize(20);
                doc.setTextColor(40, 40, 40);
                doc.text('Confirmed Bookings Report', 14, 22);
                
                doc.setFontSize(10);
                doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
                doc.text(`Type: ${bookingType === 'vehicle' ? 'Vehicle Bookings' : bookingType === 'adventure' ? 'Adventure Bookings' : 'PSV Bookings'}`, 14, 35);

                // Prepare table data
                const tableColumn = ["Date", "Customer", "Item", "Amount (KES)", "Status"];
                const tableRows = filteredBookings.map(booking => [
                  new Date(booking.createdAt).toLocaleDateString(),
                  bookingType === 'psv'
                    ? `${booking.fullName}\n${booking.phoneNumber}`
                    : `${booking.firstName} ${booking.lastName}\n${booking.phoneNumber}`,
                  bookingType === 'vehicle'
                    ? `${booking.vehicleMake} ${booking.vehicleModel}`
                    : bookingType === 'adventure'
                    ? booking.adventureTitle
                    : booking.serviceLabel || booking.serviceType,
                  bookingType === 'vehicle'
                    ? (booking.vehiclePrice?.toLocaleString() || '0')
                    : bookingType === 'adventure'
                    ? (booking.adventurePrice?.toLocaleString() || '0')
                    : 'Quote',
                  booking.status.toUpperCase()
                ]);

                // Generate table
                autoTable(doc, {
                  head: [tableColumn],
                  body: tableRows,
                  startY: 40,
                  theme: 'grid',
                  headStyles: { fillColor: [22, 163, 74] }, // Green header
                  styles: { fontSize: 8 },
                  columnStyles: {
                    0: { cellWidth: 25 },
                    1: { cellWidth: 40 },
                    2: { cellWidth: 60 },
                    3: { cellWidth: 30 },
                    4: { cellWidth: 25 }
                  }
                });

                // Save PDF
                doc.save(`confirmed-bookings-${new Date().toISOString().split('T')[0]}.pdf`);
              }}
              className="flex items-center gap-2 bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
            >
              <Icon name="Download" className="w-4 h-4" />
              Download PDF
            </Button>
          )}
          <Button
            variant="outline"
            onClick={fetchAllBookings}
            className="flex items-center gap-2"
          >
            <Icon name="RefreshCcw" className="w-4 h-4" />
            Refresh List
          </Button>
        </div>
      </div>

      {/* Reject Dialog */}
      {rejectDialog.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Reject Booking</h3>
            <p className="text-sm text-gray-600 mb-4">Please provide a reason for rejecting this booking:</p>
            <textarea
              value={rejectDialog.reason}
              onChange={(e) => setRejectDialog({ ...rejectDialog, reason: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-3 mb-4 min-h-[100px]"
              placeholder="Enter rejection reason..."
            />
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setRejectDialog({ open: false, bookingId: null, reason: '', bookingType: 'vehicle' })}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={isProcessing}
                className="bg-red-600 hover:bg-red-700"
              >
                {isProcessing ? 'Rejecting...' : 'Reject Booking'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 p-6">
        {filteredBookings.map((booking) => (
          <div key={booking._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="grid md:grid-cols-4 gap-6">
              {/* Customer Information */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase mb-3">
                  <Icon name="User" className="w-4 h-4 inline mr-2" />
                  Customer Details
                </h3>
                <div className="space-y-2">
                  <div className="text-lg font-semibold text-gray-900">
                    {bookingType === 'psv' ? booking.fullName : `${booking.firstName} ${booking.lastName}`}
                  </div>
                  {bookingType === 'psv' && booking.secondContact && (
                    <div className="text-sm text-gray-600">Backup: {booking.secondContact}</div>
                  )}
                  <a 
                    href={`mailto:${booking.email}`} 
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-2"
                  >
                    <Icon name="Mail" className="w-4 h-4" />
                    {booking.email}
                  </a>
                  <a 
                    href={`tel:${booking.phoneNumber}`} 
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-2"
                  >
                    <Icon name="Phone" className="w-4 h-4" />
                    {booking.phoneNumber}
                  </a>
                </div>
              </div>

              {/* Vehicle/Adventure Information */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase mb-3">
                  <Icon name={bookingType === 'vehicle' ? "Car" : bookingType === 'psv' ? "Briefcase" : "MapPin"} className="w-4 h-4 inline mr-2" />
                  {bookingType === 'vehicle' ? 'Vehicle Details' : bookingType === 'psv' ? 'PSV Service Details' : 'Adventure Details'}
                </h3>
                <div className="space-y-2">
                  {bookingType === 'psv' ? (
                    <>
                      <div className="text-lg font-semibold text-gray-900">
                        {booking.serviceLabel || (booking.serviceType === 'group' ? 'Group Transport' : 'Corporate & Personal')}
                      </div>
                      {booking.serviceType === 'group' ? (
                        <>
                          <div className="text-sm text-gray-600">
                            {booking.pickupLocation} → {booking.dropoffLocation}
                          </div>
                          <div className="text-sm text-gray-600">Date: {booking.travelDate}</div>
                          <div className="text-sm text-gray-600">Group: {booking.groupSize} · {booking.tripDirection}</div>
                        </>
                      ) : (
                        <>
                          <div className="text-sm text-gray-600">
                            {booking.dailyPickup} → {booking.dailyDropoff}
                          </div>
                          <div className="text-sm text-gray-600">From {booking.startDate} · {booking.scheduleDuration}</div>
                          <div className="text-sm text-gray-600">{booking.preferredDays} · {booking.departureTime}</div>
                          {booking.companyName && (
                            <div className="text-sm text-gray-600">Company: {booking.companyName}</div>
                          )}
                        </>
                      )}
                    </>
                  ) : bookingType === 'vehicle' ? (
                    <>
                      <div className="text-lg font-semibold text-gray-900">
                        {booking.vehicleMake || 'Make'} {booking.vehicleModel || 'Model'}
                      </div>
                      <div className="text-sm text-gray-600">
                        Type: {booking.vehicleName || 'Vehicle'}
                      </div>
                      {booking.duration && (
                        <div className="text-sm font-bold text-blue-600">
                          Duration: {booking.duration}
                        </div>
                      )}
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        <Icon name="Hash" className="w-4 h-4" />
                        ID: {booking.vehicleId}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-lg font-semibold text-gray-900">
                        {booking.adventureTitle || 'Adventure'}
                      </div>
                      <div className="text-sm text-gray-600 flex items-center gap-2">
                        <Icon name="MapPin" className="w-4 h-4" />
                        {booking.adventureLocation || 'Location'}
                      </div>
                      {booking.numberOfParticipants && (
                        <div className="text-sm text-gray-600">
                          Participants: {booking.numberOfParticipants}
                        </div>
                      )}
                      {booking.preferredDate && (
                        <div className="text-sm text-gray-600">
                          Date: {booking.preferredDate}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Additional Information */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase mb-3">
                  <Icon name="Info" className="w-4 h-4 inline mr-2" />
                  Additional Info
                </h3>
                <div className="space-y-2">
                  {bookingType !== 'psv' && (
                    <div className="text-lg font-bold text-green-600">
                      KES {(bookingType === 'vehicle' ? booking.vehiclePrice : booking.adventurePrice)?.toLocaleString() || '0'}
                      <span className="text-sm font-normal text-gray-600">
                        {bookingType === 'vehicle' ? ' per day' : ''}
                      </span>
                    </div>
                  )}
                  {booking.additionalNotes && (
                    <div className="text-sm text-gray-600 italic">{booking.additionalNotes}</div>
                  )}
                  <div className="text-sm text-gray-600 flex items-center gap-2">
                    <Icon name="Calendar" className="w-4 h-4" />
                    {new Date(booking.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase mb-3">
                  <Icon name="Settings" className="w-4 h-4 inline mr-2" />
                  {activeTab === 'pending' ? 'Quick Actions' : 'Booking Info'}
                </h3>
                <div className="space-y-3">
                  <div className="flex flex-col items-start gap-2">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium gap-2
                      ${booking.status === 'pending' || booking.status === 'new' ? 'bg-yellow-100 text-yellow-800' :
                        booking.status === 'approved' ? 'bg-green-100 text-green-800' :
                        booking.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'}`}>
                      <Icon name={
                        booking.status === 'pending' || booking.status === 'new' ? 'Clock' :
                        booking.status === 'approved' ? 'CheckCircle' :
                        booking.status === 'rejected' ? 'XCircle' :
                        'Bell'
                      } className="w-4 h-4" />
                      {booking.status?.toUpperCase() || 'PENDING'}
                    </div>

                    {booking.paymentStatus && (
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold gap-1.5
                        ${booking.paymentStatus === 'paid' ? 'bg-green-100 text-green-800 border border-green-200' :
                          booking.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200 animate-pulse' :
                          booking.paymentStatus === 'failed' ? 'bg-red-100 text-red-800 border border-red-200' :
                          'bg-gray-100 text-gray-800 border border-gray-200'}`}>
                        <Icon name={
                          booking.paymentStatus === 'paid' ? 'Check' :
                          booking.paymentStatus === 'pending' ? 'Clock' :
                          booking.paymentStatus === 'failed' ? 'X' :
                          'CreditCard'
                        } size={12} />
                        Payment: {booking.paymentStatus.toUpperCase()}
                      </div>
                    )}
                  </div>

                  {booking.paymentStatus === 'paid' && (
                    <div className="p-2.5 bg-green-50 border border-green-200 text-green-900 rounded-lg text-xs space-y-1 w-full max-w-[240px]">
                      <div className="font-bold flex items-center gap-1">
                        <Icon name="CheckCircle" size={12} className="text-green-600" />
                        <span>M-Pesa Paid</span>
                      </div>
                      {booking.mpesaReceiptNumber && (
                        <div><strong>Receipt:</strong> {booking.mpesaReceiptNumber}</div>
                      )}
                      {booking.amountPaid && (
                        <div><strong>Amount:</strong> KES {booking.amountPaid.toLocaleString()}</div>
                      )}
                      {booking.paidAt && (
                        <div className="text-[10px] text-green-700">
                          {new Date(booking.paidAt).toLocaleString()}
                        </div>
                      )}
                    </div>
                  )}

                  {booking.paymentStatus === 'pending' && (
                    <div className="p-2.5 bg-yellow-50 border border-yellow-200 text-yellow-900 rounded-lg text-xs space-y-1 w-full max-w-[240px] animate-pulse">
                      <div className="font-bold flex items-center gap-1">
                        <Icon name="Clock" size={12} className="text-yellow-600" />
                        <span>Awaiting PIN...</span>
                      </div>
                    </div>
                  )}

                  {booking.paymentStatus === 'failed' && (
                    <div className="p-2.5 bg-red-50 border border-red-200 text-red-900 rounded-lg text-xs space-y-1 w-full max-w-[240px]">
                      <div className="font-bold flex items-center gap-1">
                        <Icon name="XCircle" size={12} className="text-red-600" />
                        <span>Payment Failed</span>
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'pending' ? (
                    /* Pending Actions */
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="default"
                        onClick={() => handleApprove(booking._id, bookingType)}
                        disabled={isProcessing}
                        className="w-full justify-center bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Icon name="CheckCircle" className="w-4 h-4 mr-2" />
                        {isProcessing ? 'Approving...' : 'Approve Booking'}
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => setRejectDialog({ open: true, bookingId: booking._id, reason: '', bookingType })}
                        disabled={isProcessing}
                        className="w-full justify-center bg-orange-600 hover:bg-orange-700 text-white"
                      >
                        <Icon name="XCircle" className="w-4 h-4 mr-2" />
                        Reject Booking
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => confirmDelete(booking._id, bookingType)}
                        className="w-full justify-center bg-red-600 hover:bg-red-700 text-white"
                      >
                        <Icon name="Trash2" className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  ) : (
                    /* History Info */
                    <div className="space-y-2 text-sm">
                      {booking.approvedBy && (
                        <div className="text-gray-600">
                          <strong>Approved by:</strong> {booking.approvedBy}
                        </div>
                      )}
                      {booking.approvedAt && (
                        <div className="text-gray-600">
                          <strong>Approved on:</strong><br />
                          {new Date(booking.approvedAt).toLocaleString()}
                        </div>
                      )}
                      <div className="flex flex-col gap-2 mt-4">
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant="outline"
                            onClick={() => window.location.href = `tel:${booking.phoneNumber}`}
                            disabled={!booking.phoneNumber}
                            className="justify-center border-green-600 text-green-600 hover:bg-green-50"
                          >
                            <Icon name="Phone" className="w-4 h-4 mr-2" />
                            Call
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              const customerName = bookingType === 'psv' ? booking.fullName : booking.firstName;
                              const serviceName = bookingType === 'psv'
                                ? (booking.serviceLabel || 'PSV transport')
                                : (booking.vehicleName || booking.adventureTitle || 'Service');
                              const message = `Hi ${customerName}, your booking for ${serviceName} has been confirmed! Ref: ${booking._id}`;
                              const digits = String(booking.phoneNumber || '').replace(/\D/g, '');
                              const waPhone = digits.startsWith('254') ? digits : digits.startsWith('0') ? `254${digits.slice(1)}` : `254${digits}`;
                              window.open(`https://wa.me/${waPhone}?text=${encodeURIComponent(message)}`, '_blank');
                            }}
                            disabled={!booking.phoneNumber}
                            className="justify-center border-green-600 text-green-600 hover:bg-green-50"
                          >
                            <Icon name="MessageSquare" className="w-4 h-4 mr-2" />
                            Text us on WhatsApp
                          </Button>
                        </div>
                        <Button
                          variant="destructive"
                          onClick={() => confirmDelete(booking._id, bookingType)}
                          className="w-full justify-center bg-red-600 hover:bg-red-700 text-white"
                        >
                          <Icon name="Trash2" className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

        {filteredBookings.length === 0 && (
          <div className="text-center py-12">
            <Icon name="Calendar" className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {activeTab === 'pending' ? 'No Pending Bookings' : 'No Approved Bookings Yet'}
            </h3>
            <p className="text-gray-600">
              {activeTab === 'pending' 
                ? 'All bookings have been processed.' 
                : 'No bookings have been approved yet. Check the Pending tab to approve bookings.'}
            </p>
          </div>
        )}
    </div>
  );
};

export default BookingList;