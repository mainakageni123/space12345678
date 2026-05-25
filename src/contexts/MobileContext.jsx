import React, { createContext, useContext, useState, useEffect } from 'react';

const MobileContext = createContext();

export const useMobile = () => {
  const context = useContext(MobileContext);
  if (!context) {
    throw new Error('useMobile must be used within a MobileProvider');
  }
  return context;
};

export const MobileProvider = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const [orientation, setOrientation] = useState('portrait');
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 });
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [toast, setToast] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Detect device capabilities
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setScreenSize({ width, height });
      setIsMobile(width <= 768);
      setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
      setOrientation(width > height ? 'landscape' : 'portrait');
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    window.addEventListener('orientationchange', checkDevice);

    return () => {
      window.removeEventListener('resize', checkDevice);
      window.removeEventListener('orientationchange', checkDevice);
    };
  }, []);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Toast management
  const showToast = (message, type = 'info', duration = 3000) => {
    setToast({ message, type, duration, id: Date.now() });
  };

  const hideToast = () => {
    setToast(null);
  };

  // Haptic feedback
  const hapticFeedback = (type = 'light') => {
    if (isTouch && navigator.vibrate) {
      const patterns = {
        light: 10,
        medium: 20,
        heavy: 30,
        success: [10, 50, 10],
        error: [20, 100, 20, 100, 20]
      };
      navigator.vibrate(patterns[type] || patterns.light);
    }
  };

  // Loading state management
  const showLoading = (text = 'Loading...') => {
    setIsLoading({ show: true, text });
  };

  const hideLoading = () => {
    setIsLoading(false);
  };

  // Device info
  const deviceInfo = {
    isMobile,
    isTouch,
    orientation,
    screenSize,
    isOnline,
    isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
    isAndroid: /Android/.test(navigator.userAgent),
    isStandalone: window.matchMedia('(display-mode: standalone)').matches,
    supportsVibration: 'vibrate' in navigator,
    supportsGeolocation: 'geolocation' in navigator,
    supportsPushNotifications: 'Notification' in window && 'serviceWorker' in navigator,
  };

  const value = {
    // Device info
    ...deviceInfo,
    
    // Toast system
    toast,
    showToast,
    hideToast,
    
    // Loading system
    isLoading,
    showLoading,
    hideLoading,
    
    // Haptic feedback
    hapticFeedback,
    
    // Utility functions
    scrollToTop: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
    scrollToElement: (elementId) => {
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },
    
    // Share API
    share: async (data) => {
      if (navigator.share) {
        try {
          await navigator.share(data);
          return true;
        } catch (error) {
          console.error('Share failed:', error);
          return false;
        }
      }
      return false;
    },
    
    // Copy to clipboard
    copyToClipboard: async (text) => {
      try {
        await navigator.clipboard.writeText(text);
        showToast('Copied to clipboard!', 'success');
        hapticFeedback('light');
        return true;
      } catch (error) {
        console.error('Copy failed:', error);
        showToast('Failed to copy', 'error');
        return false;
      }
    },
  };

  return (
    <MobileContext.Provider value={value}>
      {children}
    </MobileContext.Provider>
  );
};
