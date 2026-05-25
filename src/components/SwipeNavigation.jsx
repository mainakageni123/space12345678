import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from './AppIcon';

const SwipeNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [touchStart, setTouchStart] = useState(null);
  const [showSwipeHint, setShowSwipeHint] = useState(true);

  // Navigation routes in order
  const routes = [
    { path: '/homepage', name: 'Home' },
    { path: '/fleet-discovery', name: 'Fleet' },
    { path: '/road-trip-adventures', name: 'Trips & Tours' },
    { path: '/psv-professional-services', name: 'PSV' },
    { path: '/instant-booking-flow', name: 'Book Now' }
  ];

  // Helper to normalize paths for matching
  const normalizePath = (p) => p.replace(/\/$/, '') || '/homepage';
  const currentPath = normalizePath(location.pathname === '/' ? '/homepage' : location.pathname);
  const currentIndex = routes.findIndex(route => normalizePath(route.path) === currentPath);

  // Minimum swipe distance
  const minSwipeDistance = 70;

  const handleTouchStart = useCallback((e) => {
    // Check if the touch is within a horizontally scrollable container
    let element = e.target;
    let isScrollable = false;

    while (element && element !== document.body) {
      // Check if element has horizontal scroll capability
      if (element.scrollWidth > element.clientWidth) {
        const style = window.getComputedStyle(element);
        const overflowX = style.getPropertyValue('overflow-x');
        
        if (overflowX === 'auto' || overflowX === 'scroll') {
          isScrollable = true;
          break;
        }
      }
      element = element.parentElement;
    }

    if (isScrollable) {
      setTouchStart(null); // Ignore this swipe
      return;
    }

    setTouchStart(e.targetTouches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback((e) => {
    if (!touchStart) return;
    
    const touchEnd = e.changedTouches[0].clientX;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    // Check if we didn't swipe vertically too much to avoid accidental navigation while scrolling
    // (Optional enhancement, but let's keep it simple first)

    if (isLeftSwipe && currentIndex !== -1 && currentIndex < routes.length - 1) {
      // Swipe left - go to next page
      navigate(routes[currentIndex + 1].path);
      showSwipeNotification('Next: ' + routes[currentIndex + 1].name);
      setShowSwipeHint(false);
    }
    
    if (isRightSwipe && currentIndex > 0) {
      // Swipe right - go to previous page
      navigate(routes[currentIndex - 1].path);
      showSwipeNotification('Previous: ' + routes[currentIndex - 1].name);
      setShowSwipeHint(false);
    }
  }, [touchStart, currentIndex, navigate, routes]);

  const showSwipeNotification = (message) => {
    const notification = document.createElement('div');
    notification.innerHTML = message;
    notification.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(8px);
      color: white;
      padding: 14px 28px;
      border-radius: 30px;
      font-size: 15px;
      font-weight: 600;
      z-index: 10000;
      pointer-events: none;
      box-shadow: 0 10px 25px rgba(0,0,0,0.3);
      animation: fadeInOutSwipe 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    `;
    
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 1500);
  };

  useEffect(() => {
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    const hintTimer = setTimeout(() => setShowSwipeHint(false), 6000);
    
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      clearTimeout(hintTimer);
    };
  }, [handleTouchStart, handleTouchEnd]);

  // Only show indicators on touch devices
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (!isTouch || currentIndex === -1) return null;

  return (
    <>
      {/* Swipe hint */}
      {showSwipeHint && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
          <div className="bg-black/60 backdrop-blur-md text-white px-5 py-3 rounded-2xl text-xs flex items-center gap-3 animate-pulse border border-white/20">
            <Icon name="ArrowLeft" size={14} />
            <span className="font-medium tracking-wide uppercase">Swipe to Navigate</span>
            <Icon name="ArrowRight" size={14} />
          </div>
        </div>
      )}

      {/* Page indicator dots */}
      <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-40 pointer-events-none">
        <div className="flex gap-2.5 bg-black/40 backdrop-blur-md px-3.5 py-2.5 rounded-full border border-white/10 shadow-lg">
          {routes.map((route, index) => (
            <div
              key={route.path}
              className={`w-2 h-2 rounded-full transition-all duration-500 ${
                index === currentIndex 
                  ? 'bg-adventure-orange w-5 shadow-[0_0_10px_rgba(249,115,22,0.5)]' 
                  : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeInOutSwipe {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
          15% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          85% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
        }
      `}} />
    </>
  );
};

export default SwipeNavigation;
