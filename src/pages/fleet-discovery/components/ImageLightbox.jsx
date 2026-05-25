import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const ImageLightbox = ({ isOpen, onClose, images, initialIndex = 0, vehicleName }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Synchronize index when lightbox is opened with a specific image index
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, initialIndex]);

  // Support ESC and Arrow keys navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && images?.length > 1) {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
      }
      if (e.key === 'ArrowLeft' && images?.length > 1) {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, images, onClose]);

  if (!isOpen || !images || images.length === 0) return null;

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 md:p-6 transition-all duration-300"
      onClick={onClose}
    >
      {/* Top Header Controls */}
      <div className="flex justify-between items-center text-white z-10 w-full" onClick={(e) => e.stopPropagation()}>
        <div>
          <h4 className="font-bold text-lg md:text-xl tracking-tight text-white/90">{vehicleName || 'Vehicle Images'}</h4>
          <p className="text-xs text-white/50">{currentIndex + 1} of {images.length}</p>
        </div>
        <button 
          onClick={onClose} 
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all active:scale-95 text-white/80 hover:text-white cursor-pointer"
          aria-label="Close Lightbox"
        >
          <Icon name="X" size={24} />
        </button>
      </div>

      {/* Main Image Viewport */}
      <div className="relative flex-grow flex items-center justify-center max-h-[80vh] my-auto select-none w-full">
        {/* Left Arrow */}
        {images.length > 1 && (
          <button
            onClick={prevImage}
            className="absolute left-2 md:left-4 z-10 p-3 rounded-full bg-white/5 hover:bg-white/10 active:scale-95 transition-all text-white/70 hover:text-white cursor-pointer"
            aria-label="Previous Image"
          >
            <Icon name="ChevronLeft" size={28} />
          </button>
        )}

        {/* Image Display */}
        <div 
          className="relative max-w-full max-h-full overflow-auto flex items-center justify-center p-2 rounded-lg"
          onClick={(e) => e.stopPropagation()} // Prevent closing when tapping image itself
        >
          <img
            src={images[currentIndex]}
            alt={`${vehicleName || 'Vehicle'} - View ${currentIndex + 1}`}
            className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl transition-all duration-300 select-none cursor-zoom-in"
          />
        </div>

        {/* Right Arrow */}
        {images.length > 1 && (
          <button
            onClick={nextImage}
            className="absolute right-2 md:right-4 z-10 p-3 rounded-full bg-white/5 hover:bg-white/10 active:scale-95 transition-all text-white/70 hover:text-white cursor-pointer"
            aria-label="Next Image"
          >
            <Icon name="ChevronRight" size={28} />
          </button>
        )}
      </div>

      {/* Footer / Thumbnail Selector */}
      <div className="flex flex-col items-center gap-4 z-10 w-full" onClick={(e) => e.stopPropagation()}>
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto max-w-full px-4 py-2 scrollbar-thin scrollbar-thumb-white/20 justify-center">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-14 h-10 md:w-16 md:h-12 rounded overflow-hidden border-2 transition-all flex-shrink-0 cursor-pointer ${
                  idx === currentIndex ? 'border-stellar-gold scale-105 shadow-md' : 'border-transparent opacity-50 hover:opacity-85'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
        <p className="text-[10px] text-white/30 uppercase tracking-widest">Tap outside or press ESC to dismiss</p>
      </div>
    </div>
  );
};

export default ImageLightbox;
