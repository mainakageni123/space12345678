import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const Navbar = ({ 
  logo, 
  logoAlt = "Logo",
  menuItems = [],
  className = ''
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  
  // Detect touch device
  useEffect(() => {
    const checkTouchDevice = () => {
      return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    };
    
    setIsTouchDevice(checkTouchDevice());
    
    // Update vh for mobile height
    const updateVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    updateVH();
    window.addEventListener('resize', updateVH);
    
    // Close menu when clicking outside (desktop only)
    const handleClickOutside = (event) => {
      const nav = document.querySelector('.navbar-menu');
      const toggler = document.querySelector('.navbar-toggler');
      
      if (nav && toggler && 
          !nav.contains(event.target) && 
          !toggler.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    
    if (!isTouchDevice) {
      document.addEventListener('click', handleClickOutside);
    }
    
    return () => {
      window.removeEventListener('resize', updateVH);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isTouchDevice]);
  
  // Toggle menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    // Prevent body scroll when menu is open
    document.body.style.overflow = !isMenuOpen ? 'hidden' : '';
  };
  
  // Close menu on item click (mobile)
  const handleMenuItemClick = () => {
    if (isTouchDevice && isMenuOpen) {
      setIsMenuOpen(false);
      document.body.style.overflow = '';
    }
  };
  
  return (
    <nav className={`navbar ${className}`}>
      <div className="responsive-container responsive-flex justify-between items-center">
        {/* Logo */}
        <a href="/" className="navbar-brand">
          {logo ? (
            <img 
              src={logo} 
              alt={logoAlt} 
              className="logo responsive-img"
              style={{ height: '40px', width: 'auto' }}
            />
          ) : (
            <span className="text-xl font-bold">Logo</span>
          )}
        </a>
        
        {/* Hamburger for Mobile */}
        <button 
          className={`navbar-toggler ${isMenuOpen ? 'active' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle navigation"
          aria-expanded={isMenuOpen}
        >
          <span className="toggler-icon"></span>
          <span className="toggler-icon"></span>
          <span className="toggler-icon"></span>
        </button>
        
        {/* Navigation Menu */}
        <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          <ul className="navbar-nav">
            {menuItems.length > 0 ? (
              menuItems.map((item, index) => (
                <li key={index}>
                  <a 
                    href={item.href} 
                    className="nav-link"
                    onClick={handleMenuItemClick}
                  >
                    {item.label}
                  </a>
                </li>
              ))
            ) : (
              // Default items
              <>
                <li><a href="/" onClick={handleMenuItemClick}>Home</a></li>
                <li><a href="/about" onClick={handleMenuItemClick}>About</a></li>
                <li><a href="/services" onClick={handleMenuItemClick}>Services</a></li>
                <li><a href="/contact" onClick={handleMenuItemClick}>Contact</a></li>
              </>
            )}
          </ul>
        </div>
      </div>
      
      {/* Navbar CSS (scoped styles) */}
      <style jsx>{`
        .navbar {
          padding: 1rem 0;
          background: white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          position: relative;
          z-index: 100;
        }
        
        .navbar-toggler {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.5rem;
          z-index: 1001;
        }
        
        .toggler-icon {
          display: block;
          width: 25px;
          height: 3px;
          background: #333;
          margin: 5px 0;
          transition: 0.3s;
          border-radius: 2px;
        }
        
        .navbar-menu {
          display: flex;
        }
        
        .navbar-nav {
          display: flex;
          list-style: none;
          margin: 0;
          padding: 0;
          gap: 2rem;
        }
        
        .nav-link {
          text-decoration: none;
          color: #333;
          font-weight: 500;
          transition: color 0.2s;
        }
        
        .nav-link:hover {
          color: #007bff;
        }
        
        /* Mobile Styles */
        @media (max-width: 767px) {
          .navbar-toggler {
            display: block;
          }
          
          .navbar-menu {
            position: fixed;
            top: 0;
            right: -100%;
            width: 80%;
            max-width: 300px;
            height: 100vh;
            background: white;
            padding: 5rem 2rem 2rem;
            box-shadow: -2px 0 10px rgba(0,0,0,0.1);
            transition: right 0.3s ease-in-out;
            flex-direction: column;
            z-index: 1000;
          }
          
          .navbar-menu.active {
            right: 0;
          }
          
          .navbar-nav {
            flex-direction: column;
            gap: 1.5rem;
          }
          
          /* Hamburger to X animation */
          .navbar-toggler.active .toggler-icon:nth-child(1) {
            transform: rotate(45deg) translate(5px, 5px);
          }
          
          .navbar-toggler.active .toggler-icon:nth-child(2) {
            opacity: 0;
          }
          
          .navbar-toggler.active .toggler-icon:nth-child(3) {
            transform: rotate(-45deg) translate(7px, -6px);
          }
          
          /* Overlay when menu is open */
          .navbar-menu.active::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: -1;
          }
        }
        
        /* Desktop Styles */
        @media (min-width: 768px) {
          .navbar-nav {
            gap: 2rem;
          }
        }
      `}</style>
    </nav>
  );
};

Navbar.propTypes = {
  logo: PropTypes.string,
  logoAlt: PropTypes.string,
  menuItems: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      href: PropTypes.string.isRequired,
    })
  ),
  className: PropTypes.string,
};

export default Navbar;
