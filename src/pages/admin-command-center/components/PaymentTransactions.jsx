import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { API_BASE_URL } from '../../../config/api';

const PaymentTransactions = () => {
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalTransactions: 0,
    completedCount: 0,
    pendingCount: 0,
    failedCount: 0,
    provider: 'KCB Buni M-Pesa Gateway'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [providerFilter, setProviderFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = sessionStorage.getItem('admin_token');
      const response = await fetch(`${API_BASE_URL}/mpesa/admin/transactions`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setPayments(data.payments || []);
        if (data.summary) {
          setSummary(data.summary);
        }
      } else {
        setError(data.error || 'Failed to load transaction data.');
      }
    } catch (err) {
      console.error('Fetch payments error:', err);
      setError('Network error connecting to payment service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // Filter payments by status, provider, search query
  const filteredPayments = payments.filter((item) => {
    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'failed') {
        if (item.status !== 'failed' && item.status !== 'cancelled') return false;
      } else if (item.status !== statusFilter) {
        return false;
      }
    }

    // Provider filter
    if (providerFilter === 'buni') {
      if (!item.checkoutRequestId && !item.accountReference?.startsWith('BK')) return false;
    } else if (providerFilter === 'cash') {
      if (item.checkoutRequestId || item.accountReference?.startsWith('BK')) return false;
    }

    // Search query filter
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      const customer = String(item.bookingId?.customerName || '').toLowerCase();
      const phone = String(item.phoneNumber || '').toLowerCase();
      const receipt = String(item.mpesaReceiptNumber || '').toLowerCase();
      const checkout = String(item.checkoutRequestId || '').toLowerCase();
      const ref = String(item.accountReference || '').toLowerCase();
      const vehicle = String(item.bookingId?.vehicleName || '').toLowerCase();

      return (
        customer.includes(query) ||
        phone.includes(query) ||
        receipt.includes(query) ||
        checkout.includes(query) ||
        ref.includes(query) ||
        vehicle.includes(query)
      );
    }

    return true;
  });

  // Export filtered transactions report as CSV file
  const handleExportCSV = () => {
    if (filteredPayments.length === 0) return;

    const headers = [
      'Transaction Ref',
      'M-Pesa Receipt',
      'Customer Name',
      'Phone Number',
      'Vehicle Booked',
      'Amount (KES)',
      'Gateway / Provider',
      'Status',
      'Date & Time'
    ];

    const rows = filteredPayments.map((p) => [
      p.accountReference || p.checkoutRequestId || p._id,
      p.mpesaReceiptNumber || 'N/A',
      `"${p.bookingId?.customerName || 'Customer'}"`,
      p.phoneNumber || 'N/A',
      `"${p.bookingId?.vehicleName || 'Vehicle'}"`,
      p.amount || 0,
      p.checkoutRequestId ? 'KCB Buni M-Pesa STK Push' : 'Manual / Direct',
      p.status?.toUpperCase(),
      `"${new Date(p.createdAt || Date.now()).toLocaleString()}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `buni_payment_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Icon name="CreditCard" size={24} className="text-emerald-600" />
            Payment & Buni Transactions
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Real-time ledger of M-Pesa transactions via KCB Buni gateway and direct payments.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            iconName="RefreshCw"
            onClick={fetchPayments}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="default"
            size="sm"
            iconName="Download"
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={handleExportCSV}
            disabled={filteredPayments.length === 0}
          >
            Export CSV Report
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Revenue</p>
            <p className="text-2xl font-bold text-emerald-700 mt-1">
              KES {summary.totalRevenue?.toLocaleString()}
            </p>
            <p className="text-xs text-gray-400 mt-1">Completed M-Pesa payments</p>
          </div>
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
            <Icon name="DollarSign" size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Successful Payments</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{summary.completedCount}</p>
            <p className="text-xs text-green-600 mt-1">KCB Buni STK Received</p>
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
            <Icon name="CheckCircle2" size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Pending PIN Entry</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{summary.pendingCount}</p>
            <p className="text-xs text-amber-500 mt-1">Awaiting customer action</p>
          </div>
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
            <Icon name="Clock" size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Failed / Cancelled</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{summary.failedCount}</p>
            <p className="text-xs text-red-400 mt-1">Declined or wrong PIN</p>
          </div>
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-red-600">
            <Icon name="XCircle" size={24} />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search receipt, phone, name..."
            className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <label className="text-xs font-medium text-gray-500">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed / Cancelled</option>
            </select>
          </div>

          {/* Gateway Filter */}
          <div className="flex items-center space-x-2">
            <label className="text-xs font-medium text-gray-500">Gateway:</label>
            <select
              value={providerFilter}
              onChange={(e) => setProviderFilter(e.target.value)}
              className="border rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Providers</option>
              <option value="buni">KCB Buni M-Pesa</option>
              <option value="cash">Direct / Cash</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <Icon name="Loader2" size={32} className="animate-spin mx-auto mb-2 text-emerald-600" />
            Loading transaction records...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600 bg-red-50">
            <Icon name="AlertCircle" size={32} className="mx-auto mb-2" />
            {error}
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Icon name="Inbox" size={36} className="mx-auto mb-2 text-gray-400" />
            No transaction records found matching your query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Transaction Ref</th>
                  <th className="px-6 py-4">Customer & Vehicle</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Gateway / Receipt</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPayments.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50/80 transition-colors">
                    {/* Transaction Ref */}
                    <td className="px-6 py-4 font-mono text-xs">
                      <div className="font-semibold text-gray-900">
                        {item.accountReference || `BK${String(item._id).slice(-8).toUpperCase()}`}
                      </div>
                      {item.checkoutRequestId && (
                        <div className="text-[10px] text-gray-400 truncate max-w-[140px]" title={item.checkoutRequestId}>
                          {item.checkoutRequestId}
                        </div>
                      )}
                    </td>

                    {/* Customer & Vehicle */}
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {item.bookingId?.customerName || 'Direct Payment'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.phoneNumber} • {item.bookingId?.vehicleName || 'Vehicle Hire'}
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      KES {Number(item.amount || 0).toLocaleString()}
                    </td>

                    {/* Gateway & Receipt */}
                    <td className="px-6 py-4 text-xs">
                      <div className="inline-flex items-center gap-1 text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <Icon name="Smartphone" size={12} />
                        KCB Buni M-Pesa
                      </div>
                      {item.mpesaReceiptNumber ? (
                        <div className="mt-1 font-mono text-[11px] text-gray-700 font-bold">
                          Receipt: {item.mpesaReceiptNumber}
                        </div>
                      ) : (
                        <div className="mt-1 text-[11px] text-gray-400 italic">No receipt yet</div>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4">
                      {item.status === 'completed' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                          Completed
                        </span>
                      )}
                      {item.status === 'pending' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                          Pending PIN
                        </span>
                      )}
                      {(item.status === 'failed' || item.status === 'cancelled') && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                          {item.status === 'cancelled' ? 'Cancelled' : 'Failed'}
                        </span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {new Date(item.createdAt || Date.now()).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                      <div className="text-[10px] text-gray-400">
                        {new Date(item.createdAt || Date.now()).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentTransactions;
