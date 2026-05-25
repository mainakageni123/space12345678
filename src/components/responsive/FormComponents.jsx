import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

// Input Component
export const Input = forwardRef(({
  label,
  error,
  className = '',
  touchFriendly = true,
  ...props
}, ref) => {
  const touchClass = touchFriendly ? 'touch-target' : '';
  
  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label className="block mb-2 text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`responsive-input ${touchClass} w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      
      <style jsx>{`
        .responsive-input {
          font-size: 16px; /* Prevent iOS zoom */
        }
        
        @media (max-width: 767px) {
          .touch-target {
            min-height: 44px;
          }
          
          .responsive-input:focus {
            border-width: 2px;
          }
        }
      `}</style>
    </div>
  );
});

Input.displayName = 'Input';

Input.propTypes = {
  label: PropTypes.string,
  error: PropTypes.string,
  className: PropTypes.string,
  touchFriendly: PropTypes.bool,
};

// Select Component
export const Select = forwardRef(({
  label,
  options = [],
  error,
  className = '',
  touchFriendly = true,
  ...props
}, ref) => {
  const touchClass = touchFriendly ? 'touch-target' : '';
  
  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label className="block mb-2 text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <select
        ref={ref}
        className={`responsive-select ${touchClass} w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none bg-white`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      
      <style jsx>{`
        .responsive-select {
          font-size: 16px; /* Prevent iOS zoom */
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
          background-position: right 0.5rem center;
          background-repeat: no-repeat;
          background-size: 1.5em 1.5em;
          padding-right: 2.5rem;
        }
        
        @media (max-width: 767px) {
          .touch-target {
            min-height: 44px;
          }
        }
      `}</style>
    </div>
  );
});

Select.displayName = 'Select';

Select.propTypes = {
  label: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ),
  error: PropTypes.string,
  className: PropTypes.string,
  touchFriendly: PropTypes.bool,
};

// Textarea Component
export const Textarea = forwardRef(({
  label,
  error,
  className = '',
  rows = 4,
  touchFriendly = true,
  ...props
}, ref) => {
  const touchClass = touchFriendly ? 'touch-target' : '';
  
  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label className="block mb-2 text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        rows={rows}
        className={`responsive-textarea ${touchClass} w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      
      <style jsx>{`
        .responsive-textarea {
          font-size: 16px; /* Prevent iOS zoom */
          resize: vertical;
          min-height: 100px;
        }
        
        @media (max-width: 767px) {
          .touch-target {
            min-height: 44px;
          }
          
          .responsive-textarea {
            min-height: 120px;
          }
        }
      `}</style>
    </div>
  );
});

Textarea.displayName = 'Textarea';

Textarea.propTypes = {
  label: PropTypes.string,
  error: PropTypes.string,
  className: PropTypes.string,
  rows: PropTypes.number,
  touchFriendly: PropTypes.bool,
};

// Button Component (Touch-friendly)
export const Button = forwardRef(({
  children,
  variant = 'primary',
  className = '',
  touchFriendly = true,
  ...props
}, ref) => {
  const touchClass = touchFriendly ? 'touch-target' : '';
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    outline: 'border border-blue-600 text-blue-600 hover:bg-blue-50',
  };
  
  return (
    <button
      ref={ref}
      className={`responsive-button ${touchClass} ${variantClasses[variant]} px-6 py-3 rounded-md font-medium transition-colors ${className}`}
      {...props}
    >
      {children}
      
      <style jsx>{`
        .responsive-button {
          font-size: 16px;
        }
        
        @media (max-width: 767px) {
          .touch-target {
            min-height: 44px;
            min-width: 44px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
          }
        }
      `}</style>
    </button>
  );
});

Button.displayName = 'Button';

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline']),
  className: PropTypes.string,
  touchFriendly: PropTypes.bool,
};
