import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import { getTripType } from '../../../utils/adventureTripType';

const SpecBox = ({ icon, label, value }) => (
  <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-2 py-1.5 bg-gray-50">
    <div className="flex-shrink-0 text-gray-400">
      <Icon name={icon} size={14} />
    </div>
    <div className="min-w-0 overflow-hidden">
      <p className="text-[9px] text-gray-400 uppercase tracking-wider font-semibold leading-none mb-0.5">
        {label}
      </p>
      <p className="text-[11px] font-semibold text-gray-700 truncate capitalize leading-none">
        {value || '—'}
      </p>
    </div>
  </div>
);

const AdventureCard = ({ adventure, onViewDetails, onBookNow }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = (() => {
    if (adventure?.images?.length > 0) {
      return adventure.images.filter(Boolean);
    }
    if (adventure?.image) {
      return [adventure.image];
    }
    return [];
  })();

  const nextImage = (e) => {
    e?.stopPropagation();
    if (!images.length) return;
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = (e) => {
    e?.stopPropagation();
    if (!images.length) return;
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const price = adventure?.price;
  const available = adventure?.availableSeats > 0 && adventure?.availability !== false;
  const tripType = getTripType(adventure);

  const handleCardClick = () => {
    if (onViewDetails) onViewDetails(adventure);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col border border-gray-100 h-full cursor-pointer"
    >
      <div
        className="relative w-full bg-gray-100 overflow-hidden"
        style={{ paddingBottom: '68%' }}
      >
        <div className="absolute inset-0">
          {images.length > 0 ? (
            <Image
              src={images[currentImageIndex]}
              alt={adventure?.title}
              className="w-full h-full object-cover transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100">
              <Icon name="MapPin" size={44} className="text-gray-300 mb-1" />
              <span className="text-gray-400 text-xs">No image</span>
            </div>
          )}
        </div>

        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start pointer-events-none">
          <span className="bg-cyan-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide shadow">
            {tripType}
          </span>
          <div className="flex items-center gap-1 bg-white/95 backdrop-blur-sm rounded-full px-2 py-0.5 shadow-sm border border-gray-100/50">
            <div className={`w-1.5 h-1.5 rounded-full ${available ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-[8px] font-bold text-gray-800 uppercase tracking-wide">
              {available ? 'Available' : 'Booked'}
            </span>
          </div>
        </div>

        {images.length > 1 && (
          <div className="hidden sm:block">
            <button
              type="button"
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition z-10"
            >
              <Icon name="ChevronLeft" size={18} />
            </button>
            <button
              type="button"
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition z-10"
            >
              <Icon name="ChevronRight" size={18} />
            </button>
          </div>
        )}

        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {images.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentImageIndex ? 'w-4 bg-cyan-400' : 'w-1.5 bg-white/70 hover:bg-white'
                }`}
                aria-label={`Image ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="p-2 sm:p-4 flex flex-col gap-1.5 sm:gap-3 flex-grow pointer-events-none">
        <div>
          <h3 className="text-[12px] sm:text-[15px] font-bold text-gray-900 leading-snug line-clamp-1">
            {adventure?.title}
          </h3>
          <div className="flex items-center gap-0.5 mt-0.5">
            <Icon name="MapPin" size={9} className="text-cyan-500 flex-shrink-0 sm:size-[11px]" />
            <span className="text-[9px] sm:text-[11px] text-gray-500 truncate">
              {adventure?.location || 'Kenya'}
            </span>
          </div>
        </div>

        <div className="hidden sm:grid grid-cols-2 gap-2">
          <SpecBox icon="Users"    label="CAPACITY" value={adventure?.maxParticipants ? `${adventure.maxParticipants} People` : '—'} />
          <SpecBox icon="Clock"    label="DURATION" value={adventure?.duration} />
          <SpecBox icon="Tag"      label="TRIP TYPE" value={tripType} />
          <SpecBox icon="Calendar" label="SEATS"    value={adventure?.availableSeats !== undefined ? `${adventure.availableSeats} left` : '—'} />
        </div>

        <div className="flex sm:hidden items-center justify-between text-[10px] text-gray-500 font-semibold px-1 border-t border-b border-gray-100 py-1">
          <div className="flex items-center gap-0.5">
            <Icon name="Users" size={10} className="text-gray-400" />
            <span>{adventure?.maxParticipants || '—'}</span>
          </div>
          <div className="flex items-center gap-0.5">
            <Icon name="Clock" size={10} className="text-gray-400" />
            <span className="truncate max-w-[40px]">{adventure?.duration || '—'}</span>
          </div>
          <div className="flex items-center gap-0.5">
            <Icon name="Tag" size={10} className="text-gray-400" />
            <span className="truncate max-w-[48px]">{tripType}</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 mt-auto pt-2">
          <div className="flex flex-col justify-center">
            <p className="text-[13px] sm:text-[17px] font-extrabold text-blue-700 leading-tight">
              {price ? `KES ${Number(price).toLocaleString()}` : 'Contact us'}
            </p>
            <p className="text-[9px] sm:text-[11px] text-gray-400 leading-none mt-1">Negotiable</p>
          </div>
          <div className="flex items-center gap-1.5 pointer-events-auto">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onBookNow) onBookNow(adventure);
              }}
              className="sm:hidden flex items-center gap-1 bg-adventure-orange hover:bg-adventure-orange/90 text-white text-[10px] font-bold px-2 py-1.5 rounded-lg shadow-sm active:scale-95 transition-all flex-shrink-0"
              aria-label="Book Now"
            >
              <Icon name="Calendar" size={11} />
              Book
            </button>
            <span className="bg-cyan-500 text-white text-[11px] sm:text-sm font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl whitespace-nowrap shadow-sm flex-shrink-0">
              Details
            </span>
          </div>
        </div>

        <button
          type="button"
          className="hidden sm:flex w-full bg-adventure-orange hover:bg-adventure-orange/90 text-white text-sm font-semibold py-2.5 rounded-xl items-center justify-center gap-2 pointer-events-auto transition-all active:scale-[0.98]"
          onClick={(e) => {
            e.stopPropagation();
            if (onBookNow) onBookNow(adventure);
          }}
        >
          <Icon name="Calendar" size={15} className="text-white" />
          Book Now
        </button>
      </div>
    </div>
  );
};

export default AdventureCard;
