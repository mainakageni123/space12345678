import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../../config/api';
import Icon from '../../../components/AppIcon';

const DashboardStats = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalVehicles: 0,
    totalBookings: 0,
    totalAdventures: 0,
    activeBookings: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch vehicles
      const vehiclesRes = await fetch(`${API_BASE_URL}/vehicles`);
      const vehicles = await vehiclesRes.json();

      // Fetch bookings
      const bookingsRes = await fetch(`${API_BASE_URL}/bookings`);
      const bookings = await bookingsRes.json();

      // Fetch adventure bookings
      let adventureBookings = [];
      try {
        const adventureBookingsRes = await fetch(`${API_BASE_URL}/adventure-bookings`);
        adventureBookings = await adventureBookingsRes.json();
      } catch (err) {
        console.warn('Adventure bookings not available:', err);
      }

      let psvBookings = [];
      try {
        const psvRes = await fetch(`${API_BASE_URL}/psv-bookings`);
        psvBookings = await psvRes.json();
      } catch (err) {
        console.warn('PSV bookings not available:', err);
      }

      // Fetch adventures
      const adventuresRes = await fetch(`${API_BASE_URL}/adventures`);
      const adventures = await adventuresRes.json();

      // Calculate stats - Active bookings are approved bookings (vehicle + adventure)
      const approvedVehicleBookings = bookings.filter(booking => 
        booking.status === 'approved'
      ).length;
      const approvedAdventureBookings = adventureBookings.filter(booking => 
        booking.status === 'approved'
      ).length;
      const approvedPsvBookings = (Array.isArray(psvBookings) ? psvBookings : []).filter(booking =>
        booking.status === 'approved'
      ).length;
      const activeBookings = approvedVehicleBookings + approvedAdventureBookings + approvedPsvBookings;

      setStats({
        totalVehicles: Array.isArray(vehicles) ? vehicles.length : 0,
        totalBookings: (Array.isArray(bookings) ? bookings.length : 0) + (Array.isArray(adventureBookings) ? adventureBookings.length : 0) + (Array.isArray(psvBookings) ? psvBookings.length : 0),
        totalAdventures: Array.isArray(adventures?.adventures) ? adventures.adventures.length : 0,
        activeBookings
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats_items = [
    {
      id: 'total-vehicles',
      label: 'Total Vehicles',
      value: stats.totalVehicles,
      icon: 'Car',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      navigateTo: 'fleet'
    },
    {
      id: 'total-bookings',
      label: 'Total Bookings',
      value: stats.totalBookings,
      icon: 'Calendar',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      navigateTo: 'bookings'
    },
    {
      id: 'active-bookings',
      label: 'Active Bookings',
      value: stats.activeBookings,
      icon: 'Clock',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      navigateTo: 'bookings'
    },
    {
      id: 'total-adventures',
      label: 'Total Adventures',
      value: stats.totalAdventures,
      icon: 'MapPin',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      navigateTo: 'adventures'
    }
  ];

  const handleCardClick = (tab) => {
    navigate('/admin-command-center', { state: { activeTab: tab } });
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg overflow-hidden shadow-md animate-pulse">
            {/* Header */}
            <div className="relative h-32 bg-gray-200">
              <div className="absolute top-2 right-2">
                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
              </div>
              <div className="absolute bottom-2 left-2">
                <div className="bg-gray-300 rounded px-2 py-1 w-12 h-6"></div>
              </div>
            </div>
            {/* Content */}
            <div className="p-3">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-16 mx-auto"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
      {stats_items.map((item) => (
        <div 
          key={item.id} 
          onClick={() => handleCardClick(item.navigateTo)}
          className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 group cursor-pointer hover:scale-105"
        >
          {/* Header */}
          <div className={`relative h-32 ${item.bgColor} flex items-center justify-center`}>
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Icon name={item.icon} size={24} className={item.color} />
            </div>
            
            {/* Status Badge */}
            <div className="absolute top-2 right-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>

            {/* Value Badge */}
            <div className="absolute bottom-2 left-2">
              <div className="bg-white/90 backdrop-blur-sm rounded px-2 py-1">
                <div className="text-lg font-bold text-cosmic-depth">{item.value}</div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-3">
            <h3 className="text-sm font-bold text-cosmic-depth mb-2 line-clamp-1">{item.label}</h3>
            
            {/* Status */}
            <div className="flex items-center justify-center">
              <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded">
                Active
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;