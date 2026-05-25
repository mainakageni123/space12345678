import React from 'react';

const Logo = ({ className }) => {
  return (
    <img
      src="/images/space_logo.gpeg.jpg"
      alt="Space Borne LTD Logo"
      className={`w-12 h-12 object-contain ${className || ''}`}
    />
  );
};

export default Logo;
