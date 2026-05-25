import React, { useState, useEffect } from 'react';

const MobileLoadingStates = ({ isLoading, loadingText = "Loading..." }) => {
  const [dots, setDots] = useState('');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isLoading) {
      // Animated dots
      const dotsInterval = setInterval(() => {
        setDots(prev => prev.length >= 3 ? '' : prev + '.');
      }, 500);

      // Simulated progress
      const progressInterval = setInterval(() => {
        setProgress(prev => prev >= 90 ? 90 : prev + 10);
      }, 200);

      return () => {
        clearInterval(dotsInterval);
        clearInterval(progressInterval);
      };
    } else {
      setDots('');
      setProgress(0);
    }
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-white/95 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center">
        {/* Animated logo/spinner */}
        <div className="relative mb-6">
          <div className="w-16 h-16 border-4 border-adventure-orange/20 rounded-full animate-spin">
            <div className="w-full h-full border-4 border-transparent border-t-adventure-orange rounded-full"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-8 h-8 text-adventure-orange animate-pulse" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
            </svg>
          </div>
        </div>

        {/* Loading text with animated dots */}
        <p className="text-lg font-medium text-cosmic-depth mb-4">
          {loadingText}{dots}
        </p>

        {/* Progress bar */}
        <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-adventure-orange to-stellar-gold transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Loading tips */}
        <div className="mt-6 text-sm text-gray-600 max-w-xs">
          <p className="animate-fade-in">
            💡 Tip: Use swipe gestures to navigate between pages
          </p>
        </div>
      </div>
    </div>
  );
};

// Skeleton loading component for content
export const MobileSkeleton = ({ lines = 3, showImage = false }) => {
  return (
    <div className="animate-pulse">
      {showImage && (
        <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
      )}
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, index) => (
          <div key={index} className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Pull to refresh component
export const PullToRefresh = ({ onRefresh, children }) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [startY, setStartY] = useState(0);

  const handleTouchStart = (e) => {
    if (window.scrollY === 0) {
      setStartY(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e) => {
    if (window.scrollY === 0 && startY) {
      const currentY = e.touches[0].clientY;
      const distance = Math.max(0, currentY - startY);
      setPullDistance(Math.min(distance, 100));
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance > 60 && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    setPullDistance(0);
    setStartY(0);
  };

  const isTouch = 'ontouchstart' in window;
  if (!isTouch) return children;

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ transform: `translateY(${pullDistance * 0.5}px)` }}
      className="transition-transform duration-200"
    >
      {/* Pull indicator */}
      {pullDistance > 0 && (
        <div 
          className="fixed top-0 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-200"
          style={{ 
            opacity: pullDistance / 60,
            transform: `translateX(-50%) translateY(${Math.min(pullDistance - 20, 40)}px)`
          }}
        >
          <div className="bg-adventure-orange text-white px-4 py-2 rounded-full text-sm flex items-center gap-2">
            <svg 
              className={`w-4 h-4 ${pullDistance > 60 ? 'animate-spin' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {pullDistance > 60 ? 'Release to refresh' : 'Pull to refresh'}
          </div>
        </div>
      )}
      
      {children}
    </div>
  );
};

export default MobileLoadingStates;
