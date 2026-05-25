import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../../config/api';
import Icon from '../../../components/AppIcon';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const CustomerAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7days'); // 7days, 30days, 90days, all
  const [error, setError] = useState(null);

  const getAdminToken = () => 
    sessionStorage.getItem('admin_token') || 
    localStorage.getItem('adminToken') || 
    localStorage.getItem('admin_token');

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const token = getAdminToken();
      const res = await fetch(`${API_BASE_URL}/bookings/analytics?range=${timeRange}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
        setError(null);
      } else {
        throw new Error('Failed to load analytics');
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
    // Refresh analytics every 30 seconds
    const interval = setInterval(loadAnalytics, 30000);
    return () => clearInterval(interval);
  }, [timeRange]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case '7days': return 'Last 7 Days';
      case '30days': return 'Last 30 Days';
      case '90days': return 'Last 90 Days';
      case 'all': return 'All Time';
      default: return '';
    }
  };

  if (loading && !analytics) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-600">Loading analytics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-12">
          <Icon name="AlertCircle" size={48} className="mx-auto text-red-500 mb-4" />
          <p className="text-gray-600">{error}</p>
          <button
            onClick={loadAnalytics}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const generatePDF = () => {
    const doc = new jsPDF();
    const dateStr = new Date().toLocaleString();

    // Header
    doc.setFontSize(22);
    doc.setTextColor(40, 40, 40);
    doc.text('SpaceBorne Analytics Report', 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${dateStr}`, 14, 28);
    doc.text(`Time Range: ${getTimeRangeLabel()}`, 14, 33);

    let yPos = 45;

    // Key Metrics Summary
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Key Performance Metrics', 14, yPos);
    yPos += 10;

    const metrics = [
      ['Total Bookings', analytics?.totalBookings || '0'],
      ['Total Revenue', formatCurrency(analytics?.totalRevenue || 0)],
      ['New Customers', analytics?.newCustomers || '0'],
      ['Avg Booking Value', formatCurrency(analytics?.averageBookingValue || 0)],
      ['Approval Rate', `${analytics?.approvalRate?.toFixed(1) || 0}%`],
      ['Retention Rate', `${analytics?.retentionRate?.toFixed(1) || 0}%`]
    ];

    autoTable(doc, {
      startY: yPos,
      head: [['Metric', 'Value']],
      body: metrics,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 80 },
        1: { cellWidth: 60 }
      }
    });

    yPos = doc.lastAutoTable.finalY + 15;

    // Booking Status Breakdown
    doc.text('Booking Status Breakdown', 14, yPos);
    yPos += 5;
    
    const statusData = analytics?.statusBreakdown?.map(s => [
      s.status.toUpperCase(),
      s.count,
      `${s.percentage.toFixed(1)}%`
    ]) || [];

    autoTable(doc, {
      startY: yPos,
      head: [['Status', 'Count', 'Percentage']],
      body: statusData,
      theme: 'striped',
      headStyles: { fillColor: [52, 73, 94] }
    });

    yPos = doc.lastAutoTable.finalY + 15;

    // Popular Vehicles
    doc.text('Top Performing Vehicles', 14, yPos);
    yPos += 5;

    const vehicleData = analytics?.popularVehicles?.slice(0, 5).map(v => [
      v.vehicleName || `${v.vehicleMake} ${v.vehicleModel}`,
      v.bookings,
      formatCurrency(v.revenue)
    ]) || [];

    autoTable(doc, {
      startY: yPos,
      head: [['Vehicle', 'Bookings', 'Revenue']],
      body: vehicleData,
      theme: 'striped',
      headStyles: { fillColor: [211, 84, 0] }
    });

    // Start new page for Recent Bookings if needed
    doc.addPage();
    yPos = 20;

    doc.setFontSize(14);
    doc.text('Recent Bookings Log', 14, yPos);
    yPos += 5;

    const bookingData = analytics?.recentBookings?.map(b => [
      new Date(b.createdAt).toLocaleDateString(),
      `${b.firstName} ${b.lastName}`,
      b.vehicleName || 'Multiple/Adventure',
      formatCurrency(b.vehiclePrice || 0),
      b.status.toUpperCase()
    ]) || [];

    autoTable(doc, {
      startY: yPos,
      head: [['Date', 'Customer', 'Item', 'Amount', 'Status']],
      body: bookingData,
      theme: 'grid',
      headStyles: { fillColor: [39, 174, 96] },
      styles: { fontSize: 8 }
    });

    doc.save(`analytics-report-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Header with Time Range Selector */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Customer & Booking Analytics</h2>
            <p className="text-gray-600 mt-1">Real-time insights into your business performance</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={generatePDF}
              className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 flex items-center gap-2"
            >
              <Icon name="Download" size={16} />
              Export PDF
            </button>
            <div className="h-6 w-px bg-gray-300 mx-2 hidden sm:block"></div>
            {['7days', '30days', '90days', 'all'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {range === '7days' ? '7D' : range === '30days' ? '30D' : range === '90days' ? '90D' : 'All'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Bookings */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Bookings</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {analytics?.totalBookings || 0}
              </p>
              {analytics?.bookingGrowth !== undefined && (
                <p className={`text-sm mt-2 flex items-center ${
                  analytics.bookingGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  <Icon 
                    name={analytics.bookingGrowth >= 0 ? 'TrendingUp' : 'TrendingDown'} 
                    size={16} 
                    className="mr-1"
                  />
                  {formatPercentage(analytics.bookingGrowth)} vs previous period
                </p>
              )}
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Icon name="Calendar" size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {formatCurrency(analytics?.totalRevenue || 0)}
              </p>
              {analytics?.revenueGrowth !== undefined && (
                <p className={`text-sm mt-2 flex items-center ${
                  analytics.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  <Icon 
                    name={analytics.revenueGrowth >= 0 ? 'TrendingUp' : 'TrendingDown'} 
                    size={16} 
                    className="mr-1"
                  />
                  {formatPercentage(analytics.revenueGrowth)} vs previous period
                </p>
              )}
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Icon name="DollarSign" size={24} className="text-green-600" />
            </div>
          </div>
        </div>

        {/* New Customers */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">New Customers</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {analytics?.newCustomers || 0}
              </p>
              {analytics?.customerGrowth !== undefined && (
                <p className={`text-sm mt-2 flex items-center ${
                  analytics.customerGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  <Icon 
                    name={analytics.customerGrowth >= 0 ? 'TrendingUp' : 'TrendingDown'} 
                    size={16} 
                    className="mr-1"
                  />
                  {formatPercentage(analytics.customerGrowth)} vs previous period
                </p>
              )}
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Icon name="Users" size={24} className="text-purple-600" />
            </div>
          </div>
        </div>

        {/* Average Booking Value */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Booking Value</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {formatCurrency(analytics?.averageBookingValue || 0)}
              </p>
              {analytics?.avgValueChange !== undefined && (
                <p className={`text-sm mt-2 flex items-center ${
                  analytics.avgValueChange >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  <Icon 
                    name={analytics.avgValueChange >= 0 ? 'TrendingUp' : 'TrendingDown'} 
                    size={16} 
                    className="mr-1"
                  />
                  {formatPercentage(analytics.avgValueChange)} vs previous period
                </p>
              )}
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Icon name="TrendingUp" size={24} className="text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Booking Status Breakdown */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Status</h3>
          <div className="space-y-4">
            {analytics?.statusBreakdown?.map((status) => (
              <div key={status.status}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {status.status}
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {status.count} ({status.percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      status.status === 'confirmed' ? 'bg-green-500' :
                      status.status === 'pending' ? 'bg-yellow-500' :
                      status.status === 'cancelled' ? 'bg-red-500' :
                      status.status === 'approved' ? 'bg-blue-500' :
                      'bg-gray-500'
                    }`}
                    style={{ width: `${status.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Vehicles */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Booked Vehicles</h3>
          <div className="space-y-3">
            {analytics?.popularVehicles?.slice(0, 5).map((vehicle, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                    index === 0 ? 'bg-yellow-500' :
                    index === 1 ? 'bg-gray-400' :
                    index === 2 ? 'bg-orange-400' :
                    'bg-gray-300'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {vehicle.vehicleName || `${vehicle.vehicleMake} ${vehicle.vehicleModel}` || 'Unknown Vehicle'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatCurrency(vehicle.revenue)} revenue
                    </p>
                  </div>
                </div>
                <span className="text-sm font-bold text-gray-900">
                  {vehicle.bookings} bookings
                </span>
              </div>
            ))}
            {(!analytics?.popularVehicles || analytics.popularVehicles.length === 0) && (
              <p className="text-sm text-gray-500 text-center py-4">No vehicle data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Additional Insights Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Peak Booking Days */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Peak Booking Days</h3>
          <div className="space-y-2">
            {analytics?.peakDays?.slice(0, 7).map((day, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-gray-700">{day.day}</span>
                <span className="text-sm font-bold text-gray-900">{day.count} bookings</span>
              </div>
            ))}
            {(!analytics?.peakDays || analytics.peakDays.length === 0) && (
              <p className="text-sm text-gray-500 text-center py-4">No data available</p>
            )}
          </div>
        </div>

        {/* Customer Retention */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Insights</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-700">New Customers</span>
                <span className="text-sm font-bold text-gray-900">
                  {analytics?.newCustomers || 0}
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-700">Returning Customers</span>
                <span className="text-sm font-bold text-gray-900">
                  {analytics?.returningCustomers || 0}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-sm font-medium text-gray-700">Retention Rate</span>
                <span className="text-sm font-bold text-blue-600">
                  {analytics?.retentionRate?.toFixed(1) || 0}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue by Source */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Icon name="Clock" size={20} className="text-blue-600" />
                <span className="text-sm text-gray-700">Avg Response Time</span>
              </div>
              <span className="text-sm font-bold text-gray-900">
                {analytics?.avgResponseTime || '< 1h'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Icon name="CheckCircle" size={20} className="text-green-600" />
                <span className="text-sm text-gray-700">Approval Rate</span>
              </div>
              <span className="text-sm font-bold text-gray-900">
                {analytics?.approvalRate?.toFixed(1) || 0}%
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Icon name="Star" size={20} className="text-purple-600" />
                <span className="text-sm text-gray-700">Cancellation Rate</span>
              </div>
              <span className="text-sm font-bold text-gray-900">
                {analytics?.cancellationRate?.toFixed(1) || 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bookings Table */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
          <button
            onClick={loadAnalytics}
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1"
          >
            <Icon name="RefreshCw" size={16} />
            <span>Refresh</span>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analytics?.recentBookings?.slice(0, 10).map((booking) => (
                <tr key={booking._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {booking.firstName} {booking.lastName}
                    </div>
                    <div className="text-sm text-gray-500">{booking.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {booking.vehicleName || `${booking.vehicleMake} ${booking.vehicleModel}` || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(booking.vehiclePrice || 0)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      booking.status === 'confirmed' || booking.status === 'approved' ? 'bg-green-100 text-green-800' :
                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      booking.status === 'cancelled' || booking.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(booking.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!analytics?.recentBookings || analytics.recentBookings.length === 0) && (
            <p className="text-sm text-gray-500 text-center py-8">No bookings available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerAnalytics;
