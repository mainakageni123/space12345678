import React from 'react';
import PropTypes from 'prop-types';

const Card = ({ 
  imageSrc,
  imageAlt = "Card image",
  title,
  children,
  linkText = "Learn More",
  linkHref = "#",
  className = "",
  aspectRatio = "16-9" // '1-1', '4-3', '16-9'
}) => {
  const aspectClass = `aspect-${aspectRatio}`;
  
  return (
    <div className={`card ${className}`}>
      {imageSrc && (
        <div className={`card-img-container ${aspectClass}`}>
          <img 
            src={imageSrc} 
            alt={imageAlt} 
            className="responsive-img object-cover"
          />
        </div>
      )}
      
      <div className="card-body responsive-p-4">
        {title && <h3 className="card-title fluid-heading-3 mb-3">{title}</h3>}
        <div className="card-text mb-4">{children}</div>
        {linkText && (
          <a href={linkHref} className="card-link font-medium text-blue-600 hover:text-blue-800 transition-colors">
            {linkText} →
          </a>
        )}
      </div>
      
      <style jsx>{`
        .card {
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transition: transform 0.3s, box-shadow 0.3s;
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        
        .card:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.15);
        }
        
        .card-img-container {
          position: relative;
          overflow: hidden;
        }
        
        .card-body {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        
        .card-title {
          color: #333;
          font-weight: 600;
        }
        
        .card-text {
          color: #666;
          line-height: 1.6;
          flex: 1;
        }
        
        /* Mobile optimizations */
        @media (max-width: 767px) {
          .card {
            transition: none; /* Reduce animations on mobile */
          }
          
          .card:hover {
            transform: none;
          }
        }
      `}</style>
    </div>
  );
};

Card.propTypes = {
  imageSrc: PropTypes.string,
  imageAlt: PropTypes.string,
  title: PropTypes.string,
  children: PropTypes.node,
  linkText: PropTypes.string,
  linkHref: PropTypes.string,
  className: PropTypes.string,
  aspectRatio: PropTypes.oneOf(['1-1', '4-3', '16-9']),
};

export default Card;
