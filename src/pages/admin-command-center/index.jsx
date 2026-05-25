import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import FleetStatus from './components/FleetStatus';
import DashboardStats from './components/DashboardStats';
import SystemHealth from './components/SystemHealth';
import CustomerAnalytics from './components/CustomerAnalytics';
import AdventureManagement from './components/AdventureManagement';
import BookingList from './components/BookingList';
import AdminAuthModal from './components/AdminAuthModal';
import AdminUserManagement from './components/AdminUserManagement';

const AdminCommandCenter = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [newMessagesCount, setNewMessagesCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { admin, loading } = useAdminAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !admin) {
      navigate('/admin-login', { replace: true });
    }
  }, [admin, loading, navigate]);

  // Force re-authentication if token is missing even when admin state exists
  useEffect(() => {
    const token = sessionStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin-login', { replace: true });
    }
  }, [navigate]);

  // Note: Do not auto-logout on unmount to avoid dev StrictMode double-invoke issues causing loops

  // Navigation tabs configuration
  const navigationTabs = [
    { id: 'overview', label: 'Overview', icon: 'LayoutDashboard' },
    { id: 'bookings', label: 'Bookings', icon: 'Calendar' },
    { id: 'fleet', label: 'Fleet', icon: 'Car' },
    { id: 'adventures', label: 'Adventures', icon: 'MapPin' },
    { 
      id: 'customers', 
      label: 'Customers', 
      icon: 'Users',
      badge: newMessagesCount > 0 ? newMessagesCount : null 
    },
    { id: 'system', label: 'System', icon: 'Settings' },
    { id: 'admin', label: 'Admin Users', icon: 'ShieldCheck' }
  ].filter(tab => {
    // Restrict Customers/Analytics tab to superadmin only
    if (tab.id === 'customers') {
      return admin?.role === 'superadmin';
    }
    return true;
  });

  // Update time every minute
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Initialize active tab from navigation state
  useEffect(() => {
    const desiredTab = location?.state?.activeTab?.toLowerCase() || location?.state?.tab;
    if (desiredTab) {
      setActiveTab(desiredTab.toLowerCase());
    }
  }, [location?.state?.activeTab, location?.state?.tab]);



  // Check for new messages
  useEffect(() => {
    const checkNewMessages = () => {
      try {
        const messages = JSON.parse(localStorage.getItem('customerMessages') || '[]');
        const newMessages = messages.filter(msg => msg.status === 'new').length;
        setNewMessagesCount(newMessages);
      } catch (error) {
        console.error('Error checking new messages:', error);
      }
    };

    // Check initially
    checkNewMessages();

    // Listen for new messages
    const handleNewMessage = () => {
      checkNewMessages();
    };

    window.addEventListener('newCustomerMessage', handleNewMessage);
    return () => window.removeEventListener('newCustomerMessage', handleNewMessage);
  }, []);

  // Settings and system configuration tabs
  const systemTabs = [
    { id: 'general', label: 'General', icon: 'Settings' },
    { id: 'security', label: 'Security', icon: 'Shield' },
    { id: 'notifications', label: 'Notifications', icon: 'Bell' }
  ];

  // Handle sidebar navigation
  const handleSidebarNavigation = (tabId) => {
    setActiveTab(tabId);
    setSidebarOpen(false); // Close sidebar after selection
  };



  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8">
            <DashboardStats />
          </div>
        );
      case 'bookings':
        return <BookingList />;
      case 'fleet':
        return (
          <div className="space-y-8">
            <FleetStatus />
          </div>
        );
      case 'adventures':
        return (
          <div className="space-y-8">
            <AdventureManagement />
          </div>
        );
      // analytics removed
      case 'customers':
        return (
          <div className="space-y-8">
            <CustomerAnalytics />
          </div>
        );
      case 'system':
        return (
          <div className="space-y-8">
            <SystemHealth />
          </div>
        );
      case 'admin':
        return (
          <div className="space-y-8">
            <AdminUserManagement />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin Command Center - SpaceBorne</title>
        <meta name="description" content="Comprehensive business management platform for SpaceBorne operations" />
      </Helmet>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        {/* Admin Header */}
        <div className="pt-16 bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-4 sm:py-6">
              <div className="flex items-center justify-between">
                {/* Left side - Hamburger + Title */}
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                  >
                    <Icon name="Menu" size={24} />
                  </button>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Admin Command Center</h1>
                    <p className="text-gray-500 mt-1 text-sm sm:text-base">
                      <span className="hidden sm:inline">
                        {currentTime?.toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })} • 
                      </span>
                      {currentTime?.toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>

                {/* Right side - Admin badge */}
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-cosmic-depth rounded-full flex items-center justify-center">
                      <Icon name="ShieldCheck" size={16} color="white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Overlay - Works for both mobile and desktop */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)}></div>
            <div className={`fixed top-0 left-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}>
              {/* Sidebar Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                >
                  <Icon name="X" size={20} />
                </button>
              </div>

              {/* Sidebar Navigation */}
              <nav className="p-4">
                <ul className="space-y-2">
                  {navigationTabs?.map((tab) => (
                    <li key={tab?.id}>
                      <button
                        onClick={() => handleSidebarNavigation(tab?.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                          activeTab === tab?.id
                            ? 'bg-cosmic-depth text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Icon name={tab?.icon} size={20} />
                        <span className="font-medium">{tab?.label}</span>
                        {tab?.badge && (
                          <span className="ml-auto inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                            {tab.badge}
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 pb-20 sm:pb-8">
          {renderTabContent()}
        </main>

        {/* Emergency Actions Bar */}
        <div className="fixed bottom-4 right-4 z-40">
          <div className="flex flex-col sm:flex-row items-end sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
            <Button
              variant="destructive"
              size="sm"
              iconName="AlertTriangle"
              className="shadow-lg w-full sm:w-auto"
              onClick={() => window.location.href = 'tel:0724440293'}
            >
              <span className="sm:inline">Emergency Support</span>
              <span className="sm:hidden">SOS</span>
            </Button>
            <Button
              variant="default"
              size="sm"
              iconName="PhoneCall"
              className="bg-green-600 hover:bg-green-700 shadow-lg w-full sm:w-auto"
              onClick={() => window.location.href = 'tel:0724440293'}
            >
              <span className="sm:inline">Call Support: 0724440293</span>
              <span className="sm:hidden">Call</span>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminCommandCenter;