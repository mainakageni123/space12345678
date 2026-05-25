import React, { useState } from 'react';
import Icon from './AppIcon';
import Image from './AppImage';

const VehicleImageCarousel = ({
  images = [],
  alt = 'Vehicle',
  className = 'relative h-48 lg:h-64 overflow-hidden',
  imageClassName = 'w-full h-full object-cover group-hover:scale-105 brand-transition duration-700'
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);

  const list = images.filter(Boolean);
  const hasMultiple = list.length > 1;

  const nextImage = (e) => {
    e?.stopPropagation();
    if (!list.length) return;
    setCurrentImageIndex((prev) => (prev === list.length - 1 ? 0 : prev + 1));
  };

  const prevImage = (e) => {
    e?.stopPropagation();
    if (!list.length) return;
    setCurrentImageIndex((prev) => (prev === 0 ? list.length - 1 : prev - 1));
  };

  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (touchStartX === null || list.length < 2) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) nextImage();
      else prevImage();
    }
    setTouchStartX(null);
  };

  return (
    <div
      className={className}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {list.length > 0 ? (
        <Image
          src={list[currentImageIndex]}
          alt={alt}
          className={imageClassName}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100">
          <Icon name="Car" size={44} className="text-gray-300 mb-1" />
          <span className="text-gray-400 text-xs">No image</span>
        </div>
      )}

      {hasMultiple && (
        <>
          <button
            type="button"
            onClick={prevImage}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition z-20"
            aria-label="Previous image"
          >
            <Icon name="ChevronLeft" size={18} />
          </button>
          <button
            type="button"
            onClick={nextImage}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition z-20"
            aria-label="Next image"
          >
            <Icon name="ChevronRight" size={18} />
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
            {list.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(idx);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentImageIndex ? 'w-4 bg-cyan-400' : 'w-1.5 bg-white/70 hover:bg-white'
                }`}
                aria-label={`Image ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default VehicleImageCarousel;
