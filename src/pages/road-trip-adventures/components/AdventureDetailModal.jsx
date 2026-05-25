import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import { getTripType } from '../../../utils/adventureTripType';

const AdventureDetailModal = ({ adventure, isOpen, onClose, onBookNow }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    setCurrentImageIndex(0);
    setActiveTab('overview');
  }, [adventure?._id, adventure?.id, isOpen]);

  if (!isOpen || !adventure) return null;

  const adventureImages = (() => {
    if (adventure?.images?.length > 0) {
      return adventure.images.filter(Boolean);
    }
    if (adventure?.image) {
      return [adventure.image];
    }
    return ['/assets/images/no_image.png'];
  })();

  const available = adventure?.availableSeats > 0 && adventure?.availability !== false;
  const tripType = getTripType(adventure);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'Info' },
    { id: 'details', label: 'Trip Details', icon: 'MapPin' }
  ];

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === adventureImages.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? adventureImages.length - 1 : prev - 1
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto overscroll-y-contain bg-black/50 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div className="flex min-h-full items-end sm:items-center justify-center sm:p-4">
        <div
          className="bg-surface-premium w-full sm:rounded-xl deep-shadow sm:max-w-4xl flex flex-col max-h-[100dvh] sm:max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
        >
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border shrink-0 sticky top-0 bg-surface-premium z-10">
          <div>
            <h2 className="text-2xl font-bold text-text-charcoal">
              {adventure?.title}
            </h2>
            <p className="text-text-refined">
              {adventure?.location} • {tripType}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            iconName="X"
            onClick={onClose}
            className="text-text-refined hover:text-text-charcoal"
          />
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain">
        <div className="flex flex-col lg:flex-row lg:min-h-0">
          <div className="lg:w-1/2 relative shrink-0">
            <div className="relative h-44 sm:h-56 lg:h-72">
              <Image
                src={adventureImages[currentImageIndex]}
                alt={adventure?.title}
                className="w-full h-full object-cover"
              />

              {adventureImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white brand-transition"
                  >
                    <Icon name="ChevronLeft" size={20} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white brand-transition"
                  >
                    <Icon name="ChevronRight" size={20} />
                  </button>
                </>
              )}

              <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                {currentImageIndex + 1} / {adventureImages.length}
              </div>
            </div>

            {adventureImages.length > 1 && (
              <div className="flex space-x-2 p-4 overflow-x-auto">
                {adventureImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 brand-transition ${
                      index === currentImageIndex ? 'border-cosmic-depth' : 'border-transparent'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`View ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="lg:w-1/2 flex flex-col lg:min-h-0">
            <div className="flex border-b border-border overflow-x-auto shrink-0 sticky top-0 lg:static bg-surface-premium z-[1]">
              {tabs?.map((tab) => (
                <button
                  key={tab?.id}
                  onClick={() => setActiveTab(tab?.id)}
                  className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium whitespace-nowrap brand-transition ${
                    activeTab === tab?.id
                      ? 'text-cosmic-depth border-b-2 border-cosmic-depth'
                      : 'text-text-refined hover:text-text-charcoal'
                  }`}
                >
                  <Icon name={tab?.icon} size={16} />
                  <span>{tab?.label}</span>
                </button>
              ))}
            </div>

            <div className="p-4 sm:p-6 lg:flex-1 lg:overflow-y-auto lg:min-h-0">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    {adventure?.duration && (
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-cosmic-silver rounded-lg flex items-center justify-center">
                          <Icon name="Clock" size={20} className="text-cosmic-depth" />
                        </div>
                        <div>
                          <p className="text-sm text-text-refined">Duration</p>
                          <p className="font-semibold text-text-charcoal">{adventure.duration}</p>
                        </div>
                      </div>
                    )}
                    {adventure?.maxParticipants && (
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-cosmic-silver rounded-lg flex items-center justify-center">
                          <Icon name="Users" size={20} className="text-cosmic-depth" />
                        </div>
                        <div>
                          <p className="text-sm text-text-refined">Capacity</p>
                          <p className="font-semibold text-text-charcoal">{adventure.maxParticipants} people</p>
                        </div>
                      </div>
                    )}
                    {adventure?.availableSeats !== undefined && (
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-cosmic-silver rounded-lg flex items-center justify-center">
                          <Icon name="Calendar" size={20} className="text-cosmic-depth" />
                        </div>
                        <div>
                          <p className="text-sm text-text-refined">Seats Left</p>
                          <p className="font-semibold text-text-charcoal">{adventure.availableSeats}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-cosmic-silver rounded-lg flex items-center justify-center">
                        <Icon name="Tag" size={20} className="text-cosmic-depth" />
                      </div>
                      <div>
                        <p className="text-sm text-text-refined">Trip Type</p>
                        <p className="font-semibold text-text-charcoal">{tripType}</p>
                      </div>
                    </div>
                  </div>

                  {adventure?.description && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Description</h3>
                      <p className="text-text-refined leading-relaxed">{adventure.description}</p>
                    </div>
                  )}

                  {adventure?.highlights?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold text-text-charcoal uppercase tracking-wider mb-3">
                        Trip Highlights
                      </h4>
                      <ul className="space-y-2">
                        {adventure.highlights.map((highlight, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-text-refined">
                            <Icon name="Check" size={16} className="text-adventure-orange flex-shrink-0 mt-0.5" />
                            <span>{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="bg-cosmic-silver/30 rounded-lg p-4">
                    <h4 className="text-xs font-bold text-text-charcoal uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Icon name="Tag" size={14} className="text-adventure-orange" />
                      Price (KES)
                    </h4>
                    <p className="text-2xl font-bold text-cosmic-depth">
                      {adventure?.price ? `KES ${Number(adventure.price).toLocaleString()}` : 'Contact us'}
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'details' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    {adventure?.location && (
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-text-refined">Location</span>
                        <span className="font-medium text-text-charcoal">{adventure.location}</span>
                      </div>
                    )}
                    {adventure?.duration && (
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-text-refined">Duration</span>
                        <span className="font-medium text-text-charcoal">{adventure.duration}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-text-refined">Trip Type</span>
                      <span className="font-medium text-text-charcoal">{tripType}</span>
                    </div>
                    {adventure?.bestTime && (
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-text-refined">Best Time</span>
                        <span className="font-medium text-text-charcoal">{adventure.bestTime}</span>
                      </div>
                    )}
                    {adventure?.maxParticipants && (
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-text-refined">Max Participants</span>
                        <span className="font-medium text-text-charcoal">{adventure.maxParticipants}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-border p-4 sm:p-6 shrink-0 bg-surface-premium">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-cosmic-depth">
                    {adventure?.price ? `KES ${Number(adventure.price).toLocaleString()}` : 'Contact us'}
                  </p>
                  <p className="text-sm text-text-refined">
                    {available ? `${adventure.availableSeats} seats available` : 'Currently fully booked'}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={onClose} className="flex-1 sm:flex-none">
                    Close
                  </Button>
                  <Button
                    variant="default"
                    onClick={() => onBookNow(adventure)}
                    disabled={!available}
                    className="flex-1 sm:flex-none rounded-full bg-adventure-orange hover:bg-adventure-orange/90 disabled:opacity-50"
                  >
                    {available ? 'Book Now' : 'Unavailable'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default AdventureDetailModal;
