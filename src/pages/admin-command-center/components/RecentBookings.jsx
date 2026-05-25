import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const RecentBookings = () => {
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    dateRange: ''
  });
  const [bookings, setBookings] = useState([
    {
      id: "SB-2024-001",
      customer: "Sarah Johnson",
      vehicle: "Range Rover Sport",
      type: "Individual Rental",
      startDate: "2024-09-12",
      endDate: "2024-09-15",
      status: "pending-approval",
      amount: "KSH 48,000",
      phone: "+254724440293",
      email: "sarah.johnson@email.com"
    },
    {
      id: "SB-2024-002",
      customer: "Michael Kamau",
      vehicle: "BMW X7",
      type: "Road Trip Adventure",
      startDate: "2024-09-14",
      endDate: "2024-09-18",
      status: "pending-approval",
      amount: "KSH 125,000",
      phone: "+254712345678",
      email: "m.kamau@email.com"
    },
    {
      id: "SB-2024-003",
      customer: "Corporate Events Ltd",
      vehicle: "Mercedes Sprinter",
      type: "PSV Service",
      startDate: "2024-09-13",
      endDate: "2024-09-13",
      status: "pending-approval",
      amount: "$850.00",
      phone: "+1 (555) 456-7890",
      email: "bookings@corporateevents.com"
    },
    {
      id: "SB-2024-004",
      customer: "David Rodriguez",
      vehicle: "Audi Q8",
      type: "Individual Rental",
      startDate: "2024-09-16",
      endDate: "2024-09-20",
      status: "in-progress",
      amount: "$720.00",
      phone: "+1 (555) 234-5678",
      email: "david.r@email.com"
    },
    {
      id: "SB-2024-005",
      customer: "Emma Wilson",
      vehicle: "Range Rover Sport",
      type: "Road Trip Adventure",
      startDate: "2024-09-11",
      endDate: "2024-09-14",
      status: "completed",
      amount: "$980.00",
      phone: "+1 (555) 345-6789",
      email: "emma.wilson@email.com"
    }
  ]);

  const handleApproveBooking = async (bookingId) => {
    try {
      // Here you would implement your booking approval logic
      // This could be an API call to your backend service
      const response = await fetch(`/api/admin/approve-booking/${bookingId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        alert('Booking approved successfully!');
        // Update the booking status in the UI
        // This is a placeholder - you would typically fetch updated data from the server
        const updatedBookings = bookings.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: 'confirmed' }
            : booking
        );
        setBookings(updatedBookings);
      } else {
        throw new Error('Failed to approve booking');
      }
    } catch (error) {
      console.error('Error approving booking:', error);
      alert('Failed to approve booking. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending-approval': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Individual Rental': return 'Car';
      case 'Road Trip Adventure': return 'MapPin';
      case 'PSV Service': return 'Users';
      default: return 'Calendar';
    }
  };

  const getFilteredBookings = () => {
    return bookings.filter(booking => {
      const matchesStatus = !filters.status || booking.status === filters.status;
      const matchesType = !filters.type || booking.type === filters.type;
      
      if (!filters.dateRange) return matchesStatus && matchesType;
      
      const today = new Date();
      const startDate = new Date(booking.startDate);
      
      switch (filters.dateRange) {
        case 'today':
          return matchesStatus && matchesType && startDate.toDateString() === today.toDateString();
        case 'week':
          const weekAgo = new Date(today.setDate(today.getDate() - 7));
          return matchesStatus && matchesType && startDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(today.setMonth(today.getMonth() - 1));
          return matchesStatus && matchesType && startDate >= monthAgo;
        default:
          return matchesStatus && matchesType;
      }
    });
  };

  const filterOptions = {
    status: [
      { value: '', label: 'All Statuses' },
      { value: 'pending-approval', label: 'Pending Approval' },
      { value: 'confirmed', label: 'Confirmed' },
      { value: 'in-progress', label: 'In Progress' },
      { value: 'completed', label: 'Completed' },
      { value: 'cancelled', label: 'Cancelled' }
    ],
    type: [
      { value: '', label: 'All Types' },
      { value: 'Individual Rental', label: 'Individual Rental' },
      { value: 'Road Trip Adventure', label: 'Road Trip Adventure' },
      { value: 'PSV Service', label: 'PSV Service' }
    ],
    dateRange: [
      { value: '', label: 'All Time' },
      { value: 'today', label: 'Today' },
      { value: 'week', label: 'This Week' },
      { value: 'month', label: 'This Month' }
    ]
  };

  return (
    <div className="bg-white rounded-lg premium-shadow border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-text-charcoal">Recent Bookings</h2>
          <div className="flex gap-4">
            <Select
              value={filters.status}
              onChange={(value) => setFilters({ ...filters, status: value })}
              options={filterOptions.status}
              className="w-40"
            />
            <Select
              value={filters.type}
              onChange={(value) => setFilters({ ...filters, type: value })}
              options={filterOptions.type}
              className="w-48"
            />
            <Select
              value={filters.dateRange}
              onChange={(value) => setFilters({ ...filters, dateRange: value })}
              options={filterOptions.dateRange}
              className="w-40"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getFilteredBookings().map((booking) => (
                <tr key={booking?.id} className="hover:bg-gray-50 brand-transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-cosmic-depth">{booking?.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-cosmic-silver rounded-full flex items-center justify-center mr-3">
                        <Icon name="User" size={16} className="text-cosmic-depth" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{booking?.customer}</div>
                        <div className="text-sm text-gray-500">{booking?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Icon name={getTypeIcon(booking?.type)} size={16} className="text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{booking?.vehicle}</div>
                        <div className="text-sm text-gray-500">{booking?.type}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{booking?.startDate}</div>
                    <div className="text-sm text-gray-500">to {booking?.endDate}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking?.status)}`}>
                      {booking?.status?.charAt(0)?.toUpperCase() + booking?.status?.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{booking?.amount}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        iconName="Eye"
                        onClick={() => setSelectedBooking(booking)}
                      />
                      <Button variant="ghost" size="sm" iconName="Edit" />
                      <Button variant="ghost" size="sm" iconName="MessageCircle" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {getFilteredBookings().length} of {bookings.length} bookings
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" iconName="ChevronLeft">
                Previous
              </Button>
              <Button variant="outline" size="sm" iconName="ChevronRight">
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Booking Details</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  iconName="X"
                  onClick={() => setSelectedBooking(null)}
                />
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Customer Information</h4>
                  <div className="space-y-2">
                    <p><span className="text-gray-500">Name:</span> {selectedBooking?.customer}</p>
                    <p><span className="text-gray-500">Email:</span> {selectedBooking?.email}</p>
                    <p><span className="text-gray-500">Phone:</span> {selectedBooking?.phone}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Booking Information</h4>
                  <div className="space-y-2">
                    <p><span className="text-gray-500">ID:</span> {selectedBooking?.id}</p>
                    <p><span className="text-gray-500">Vehicle:</span> {selectedBooking?.vehicle}</p>
                    <p><span className="text-gray-500">Service:</span> {selectedBooking?.type}</p>
                    <p><span className="text-gray-500">Amount:</span> {selectedBooking?.amount}</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex items-center space-x-3">
                <Button variant="default" iconName="MessageCircle">
                  Contact Customer
                </Button>
                <Button variant="outline" iconName="Edit">
                  Modify Booking
                </Button>
                <Button variant="outline" iconName="Download">
                  Download Invoice
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentBookings;