import React, { useEffect, useState } from 'react';

const MobileEnhancements = () => {
  const [isTouch, setIsTouch] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(true);

  useEffect(() => {
    // Detect touch device
    const checkTouch = () => {
      setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };
    
    checkTouch();
    window.addEventListener('resize', checkTouch);
    
    // Hide scroll hint after user scrolls
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowScrollHint(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    // Auto-hide scroll hint after 5 seconds
    const timer = setTimeout(() => setShowScrollHint(false), 5000);
    
    return () => {
      window.removeEventListener('resize', checkTouch);
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    };
  }, []);

  // Add haptic feedback for touch interactions
  const addHapticFeedback = () => {
    if (isTouch && navigator.vibrate) {
      navigator.vibrate(10); // Light haptic feedback
    }
  };

  // Enhanced button press effect
  const handleTouchStart = (e) => {
    if (isTouch) {
      e.currentTarget.style.transform = 'scale(0.98)';
      e.currentTarget.style.transition = 'transform 0.1s ease';
      addHapticFeedback();
    }
  };

  const handleTouchEnd = (e) => {
    if (isTouch) {
      setTimeout(() => {
        e.currentTarget.style.transform = 'scale(1)';
      }, 100);
    }
  };

  useEffect(() => {
    if (isTouch) {
      // Add touch enhancements to all buttons and clickable elements
      const clickableElements = document.querySelectorAll('button, a, [role="button"]');
      
      clickableElements.forEach(element => {
        element.addEventListener('touchstart', handleTouchStart, { passive: true });
        element.addEventListener('touchend', handleTouchEnd, { passive: true });
        
        // Add touch-friendly styling
        element.style.minHeight = '44px'; // Apple's recommended touch target size
        element.style.minWidth = '44px';
        element.style.cursor = 'pointer';
      });

      return () => {
        clickableElements.forEach(element => {
          element.removeEventListener('touchstart', handleTouchStart);
          element.removeEventListener('touchend', handleTouchEnd);
        });
      };
    }
  }, [isTouch]);

  if (!isTouch) return null;

  return (
    <>
      {/* Scroll Hint for Mobile Users */}
      {showScrollHint && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-black/80 text-white px-4 py-2 rounded-full text-sm flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
            Scroll to explore
          </div>
        </div>
      )}

      {/* Touch-friendly floating action button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="bg-adventure-orange text-white p-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          style={{ minHeight: '56px', minWidth: '56px' }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      </div>

      {/* Mobile-optimized loading overlay */}
      <style jsx>{`
        .mobile-loading {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }
        
        .mobile-spinner {
          width: 50px;
          height: 50px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #ff6f00;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default MobileEnhancements;
