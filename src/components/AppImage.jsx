import React from 'react';

import { UPLOADS_URL } from '../config/api';

function Image({
  src,
  alt = "Image Name",
  className = "",
  ...props
}) {
  return (
    <div className={`relative ${className}`}>
      <img
        src={src || "/assets/images/no_image.png"}
        alt={alt}
        className={`${className} transition-opacity duration-200`}
        loading="lazy"
        decoding="async"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = "/assets/images/no_image.png";
        }}
        {...props}
      />
    </div>
  );
}

export default Image;
