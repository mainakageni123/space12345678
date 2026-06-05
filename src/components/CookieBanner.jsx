import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const CookieBanner = () => {
  const [accepted, setAccepted] = useState(true); // Default to true so it doesn't flash during SSR/initial load

  useEffect(() => {
    // Read from localStorage on mount
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setAccepted(false);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'true');
    setAccepted(true);
  };

  if (accepted) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-8 md:right-8 lg:left-12 lg:right-12 z-50 max-w-4xl mx-auto transform animate-slide-up">
      <div className="bg-cosmic-depth/90 backdrop-blur-lg border border-white/10 text-white p-5 rounded-2xl shadow-cosmic flex flex-col md:flex-row justify-between items-center gap-4 transition-all duration-300 hover:border-white/20">
        
        {/* Consent description */}
        <div className="flex-1 text-center md:text-left">
          <p className="text-xs sm:text-sm text-cosmic-silver/90 leading-relaxed">
            We use essential cookies and session storage to manage your authentication, bookings, and payment pipeline. 
            By continuing, you agree to our processing under the Kenya Data Protection Act 2019. 
            <Link to="/privacy-policy" className="text-stellar-gold hover:underline font-medium ml-1.5 inline-flex items-center gap-0.5">
              Learn more
              <svg className="w-3.5 h-3.5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-center">
          <button
            onClick={handleAccept}
            className="w-full md:w-auto px-6 py-2.5 bg-gradient-to-r from-stellar-gold to-amber-500 hover:from-amber-400 hover:to-stellar-gold text-cosmic-depth font-bold rounded-lg text-sm transition-all duration-300 shadow-md hover:shadow-stellar active:scale-95"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
