import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from './AppIcon';

const MobileBottomNav = () => {
  const location = useLocation();

  const navigationItems = [
    { path: '/homepage', label: 'Home', icon: 'Home' },
    { path: '/fleet-discovery', label: 'Fleet', icon: 'Car' },
    { path: '/road-trip-adventures', label: 'Trips & Tours', icon: 'MapPin' },
    { path: '/psv-professional-services', label: 'PSV', icon: 'Briefcase' },
    { path: '/instant-booking-flow', label: 'Book', icon: 'Calendar' }
  ];

  const isActivePath = (path) => location?.pathname === path;

  // Only show on very small screens as a backup
  const isVerySmallScreen = window.innerWidth < 400;
  if (!isVerySmallScreen) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-gray-200 safe-bottom">
      <nav className="flex items-center justify-around px-2 py-2">
        {navigationItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center p-2 rounded-lg min-w-[70px] min-h-[70px] brand-transition ${
              item.label === 'Book'
                ? 'bg-adventure-orange text-white shadow-lg'
                : isActivePath(item.path)
                ? 'bg-cosmic-silver/30 text-cosmic-depth'
                : 'text-text-charcoal hover:bg-cosmic-silver/20'
            }`}
          >
            <Icon 
              name={item.icon} 
              size={24} 
              strokeWidth={2}
              className={item.label === 'Book' ? 'text-white' : ''}
            />
            <span className={`text-xs mt-1 font-medium ${
              item.label === 'Book' ? 'text-white' : ''
            }`}>
              {item.label}
            </span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default MobileBottomNav;
