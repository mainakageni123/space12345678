import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';
import Logo from '../Logo';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { admin, loading, logout } = useAdminAuth();
  const [lastPath, setLastPath] = useState(location?.pathname);

  // Clear admin token when leaving admin area
  useEffect(() => {
    if (lastPath?.startsWith('/admin-command-center') && !location?.pathname?.startsWith('/admin-command-center')) {
      try { sessionStorage.removeItem('admin_token'); } catch (e) {}
      try { sessionStorage.removeItem('redirectAfterLogin'); } catch (e) {}
      logout();
    }
    setLastPath(location?.pathname);
  }, [location?.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigationItems = [
    { path: '/homepage', label: 'Home', icon: 'Home' },
    { path: '/fleet-discovery', label: 'Fleet', icon: 'Car' },
    { path: '/road-trip-adventures', label: 'Trips & Tours', icon: 'MapPin' },
    { path: '/psv-professional-services', label: 'PSV', icon: 'Briefcase' },
    { path: '/instant-booking-flow', label: 'Book Now', icon: 'Calendar' }
  ];

  const isActivePath = (path) => location?.pathname === path;
  
  // Check if we're on an admin page
  const isAdminPage = location?.pathname?.startsWith('/admin-command-center') || location?.pathname?.startsWith('/admin-login');

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-40 brand-transition header-mobile ${
        isScrolled 
          ? 'bg-white/98 backdrop-blur-xl shadow-lg border-b border-gray-200' 
          : 'bg-transparent shadow-none border-none'
      }`}
    >
      <div className="h-safe-area w-full bg-inherit" />
      <div className="w-full">
        <div className="flex items-center justify-between h-14 sm:h-16 px-3 sm:px-6 lg:px-8 gap-2">
          {/* Logo - More compact on mobile */}
          <Link 
            to="/homepage" 
            className="flex items-center space-x-1.5 sm:space-x-3 group brand-transition hover:scale-105 flex-shrink-0 min-w-0"
          >
            <div className="relative flex-shrink-0">
              <Logo className="group-hover:stellar-glow brand-transition rounded-lg w-8 h-8 sm:w-10 sm:h-10" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm sm:text-base lg:text-lg font-bold text-cosmic-depth font-inter tracking-tight truncate">
                Space Borne LTD
              </span>
              <span className="text-xs text-text-refined font-medium -mt-1 hidden sm:block">
                Premium Mobility
              </span>
            </div>
          </Link>

          {/* Desktop Navigation - Hidden on admin pages and mobile */}
          {!isAdminPage && (
            <nav className="hidden lg:flex items-center gap-2 flex-shrink-0">
              {navigationItems?.map((item) => (
                <Link
                  key={item?.path}
                  to={item?.path}
                  className={`flex items-center space-x-2.5 px-4 py-2.5 rounded-lg brand-transition font-medium text-sm 
                    ${item?.label === 'Book Now' 
                      ? 'bg-adventure-orange text-white shadow-xl shadow-adventure-orange/40 hover:bg-adventure-orange/90 hover:scale-105 hover:shadow-2xl'
                      : isActivePath(item?.path)
                        ? 'bg-gray-900 text-white font-semibold shadow-lg'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:shadow-md'
                    }`}
                  style={{ minHeight: '44px', minWidth: '44px' }} // Touch-friendly sizing
                  onClick={() => {
                    if (location?.pathname?.startsWith('/admin-command-center') && !item?.path?.startsWith('/admin-command-center')) {
                      try { sessionStorage.removeItem('admin_token'); } catch (e) {}
                      try { sessionStorage.removeItem('redirectAfterLogin'); } catch (e) {}
                      logout();
                    }
                  }}
                >
                  <Icon 
                    name={item?.icon} 
                    size={18} 
                    strokeWidth={2} 
                    className={item?.label === 'Book Now' ? 'text-white' : ''}
                  />
                  <span className={item?.label === 'Book Now' ? 'font-semibold' : ''}>{item?.label}</span>
                </Link>
              ))}
            </nav>
          )}

          {/* Admin Navigation - Only visible on admin pages */}
          {isAdminPage && (
            <nav className="flex items-center gap-4">
              <div className="flex items-center space-x-2 text-cosmic-depth">
                <Icon name="ShieldCheck" size={20} />
                <span className="font-medium text-sm">Admin Panel</span>
              </div>
              {admin && (
                <Button
                  onClick={() => {
                    logout();
                    navigate('/homepage');
                  }}
                  variant="outline"
                  size="sm"
                  iconName="LogOut"
                  iconPosition="left"
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  Logout
                </Button>
              )}
            </nav>
          )}

          {/* Hamburger menu removed - using horizontal navigation only */}
        </div>
        
        {/* Mobile Horizontal Navigation - Just below logo as requested */}
        {!isAdminPage && (
          <div className="lg:hidden w-full overflow-x-auto scrollbar-none border-t border-white/10 bg-transparent backdrop-blur-sm">
            <div className="flex items-center px-3 py-2.5 gap-2.5 w-max pr-8">
              {navigationItems?.filter(item => item.label !== 'Book Now').map((item) => (
                <Link
                  key={item?.path}
                  to={item?.path}
                  className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-full text-xs font-medium whitespace-nowrap brand-transition border flex-shrink-0 ${
                    isActivePath(item?.path)
                      ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => {
                    if (location?.pathname?.startsWith('/admin-command-center') && !item?.path?.startsWith('/admin-command-center')) {
                      try { sessionStorage.removeItem('admin_token'); } catch (e) {}
                      try { sessionStorage.removeItem('redirectAfterLogin'); } catch (e) {}
                      logout();
                    }
                  }}
                >
                  <Icon name={item?.icon} size={14} />
                  <span>{item?.label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

        {/* Mobile menu overlay removed - using horizontal navigation only */}
    </header>
  );
};

export default Header;