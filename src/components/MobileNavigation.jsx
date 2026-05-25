import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from './AppIcon';

const MobileNavigation = () => {
  const location = useLocation();

  const navigationItems = [
    { path: '/homepage', label: 'Home', icon: 'Home' },
    { path: '/fleet-discovery', label: 'Fleet', icon: 'Car' },
    { path: '/road-trip-adventures', label: 'Trips & Tours', icon: 'MapPin' },
    { path: '/psv-professional-services', label: 'PSV', icon: 'Briefcase' },
    { path: '/instant-booking-flow', label: 'Book', icon: 'Calendar' }
  ];

  const isActivePath = (path) => location?.pathname === path;

  return (
    <nav className="nav-mobile">
      {navigationItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`nav-item-mobile ${isActivePath(item.path) ? 'text-adventure-orange' : 'text-gray-600'}`}
        >
          <Icon 
            name={item.icon} 
            size={20} 
            strokeWidth={2}
            color={isActivePath(item.path) ? '#f97316' : '#6b7280'}
          />
          <span className="text-xs font-medium">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
};

export default MobileNavigation;
