import React from 'react';
import PropTypes from 'prop-types';

/**
 * Responsive Container Component
 * Wraps content with responsive padding and max-width constraints
 */
const Container = ({ 
  children, 
  fluid = false, 
  className = '', 
  ...props 
}) => {
  const baseClass = fluid ? 'responsive-container-fluid' : 'responsive-container';
  const combinedClasses = `${baseClass} ${className}`.trim();
  
  return (
    <div className={combinedClasses} {...props}>
      {children}
    </div>
  );
};

Container.propTypes = {
  children: PropTypes.node,
  fluid: PropTypes.bool,
  className: PropTypes.string,
};

export default Container;
