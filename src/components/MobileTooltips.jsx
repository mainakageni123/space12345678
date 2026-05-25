import React, { useState, useEffect } from 'react';

const MobileTooltip = ({ children, content, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [touchTimer, setTouchTimer] = useState(null);

  const handleTouchStart = (e) => {
    e.preventDefault();
    const timer = setTimeout(() => {
      setIsVisible(true);
      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(15);
      }
    }, 500); // Show tooltip after 500ms press
    setTouchTimer(timer);
  };

  const handleTouchEnd = () => {
    if (touchTimer) {
      clearTimeout(touchTimer);
      setTouchTimer(null);
    }
    // Hide tooltip after 2 seconds
    setTimeout(() => setIsVisible(false), 2000);
  };

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  };

  return (
    <div className="relative inline-block">
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="cursor-pointer"
      >
        {children}
      </div>
      
      {isVisible && (
        <div className={`absolute z-50 ${positionClasses[position]} animate-fade-in`}>
          <div className="bg-black text-white text-sm px-3 py-2 rounded-lg shadow-lg max-w-xs">
            {content}
            <div className={`absolute w-2 h-2 bg-black transform rotate-45 ${
              position === 'top' ? 'top-full left-1/2 -translate-x-1/2 -mt-1' :
              position === 'bottom' ? 'bottom-full left-1/2 -translate-x-1/2 -mb-1' :
              position === 'left' ? 'left-full top-1/2 -translate-y-1/2 -ml-1' :
              'right-full top-1/2 -translate-y-1/2 -mr-1'
            }`} />
          </div>
        </div>
      )}
    </div>
  );
};

// Toast notification system for mobile
export const MobileToast = ({ message, type = 'info', duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Allow fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const typeStyles = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    warning: 'bg-yellow-500 text-black',
    info: 'bg-blue-500 text-white'
  };

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  return (
    <div className={`fixed top-4 left-4 right-4 z-50 transform transition-all duration-300 ${
      isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
    }`}>
      <div className={`${typeStyles[type]} px-4 py-3 rounded-lg shadow-lg flex items-center gap-3`}>
        <span className="text-lg">{icons[type]}</span>
        <span className="flex-1 text-sm font-medium">{message}</span>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-lg opacity-70 hover:opacity-100"
        >
          ×
        </button>
      </div>
    </div>
  );
};

// Mobile-friendly action sheet
export const MobileActionSheet = ({ isOpen, onClose, actions, title }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Action Sheet */}
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl animate-slide-up">
        <div className="p-4">
          {/* Handle */}
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
          
          {title && (
            <h3 className="text-lg font-semibold text-center mb-4 text-gray-800">
              {title}
            </h3>
          )}
          
          {/* Actions */}
          <div className="space-y-2">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={() => {
                  action.onPress();
                  onClose();
                }}
                className={`w-full p-4 text-left rounded-xl transition-colors ${
                  action.destructive 
                    ? 'text-red-600 hover:bg-red-50' 
                    : 'text-gray-800 hover:bg-gray-100'
                }`}
                style={{ minHeight: '56px' }}
              >
                <div className="flex items-center gap-3">
                  {action.icon && <span className="text-xl">{action.icon}</span>}
                  <div>
                    <div className="font-medium">{action.title}</div>
                    {action.subtitle && (
                      <div className="text-sm text-gray-500">{action.subtitle}</div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
          
          {/* Cancel button */}
          <button
            onClick={onClose}
            className="w-full p-4 mt-4 text-center font-medium text-gray-600 bg-gray-100 rounded-xl"
            style={{ minHeight: '56px' }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// Mobile-optimized modal
export const MobileModal = ({ isOpen, onClose, title, children, fullScreen = false }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className={`absolute bg-white shadow-2xl ${
        fullScreen 
          ? 'inset-0' 
          : 'bottom-0 left-0 right-0 max-h-[90vh] rounded-t-3xl'
      } animate-slide-up`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
            style={{ minHeight: '44px', minWidth: '44px' }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
          {children}
        </div>
      </div>
    </div>
  );
};

export default MobileTooltip;
