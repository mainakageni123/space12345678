import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import GroupTransportModal from './GroupTransportModal';
import CorporateTransportModal from './CorporateTransportModal';

  const services = [
    {
    id: 'group',
    badge: 'Groups',
    badgeClass: 'bg-green-500/20 text-green-400 border-green-500/30',
    headerClass: 'bg-gradient-to-br from-emerald-900 to-green-950',
    title: 'Group Transport',
    description: 'Comfortable group movement for any occasion — social, church, school or corporate outings.',
    bullets: [
      { icon: 'Users', text: '8 - 15+ people' },
      { icon: 'Calendar', text: 'One-off or recurring' },
      { icon: 'MapPin', text: 'Anywhere in Kenya' }
    ],
    cta: 'Book group trip',
    ctaClass: 'bg-gray-800 hover:bg-gray-700 border border-gray-600'
  },
  {
    id: 'corporate',
    badge: 'Corporate',
    badgeClass: 'bg-stellar-gold/20 text-stellar-gold border-stellar-gold/30',
    headerClass: 'bg-gradient-to-br from-cosmic-depth to-blue-950',
    title: 'Corporate & Personal',
    description: 'Guaranteed daily pick up and drop off. Machakos–Nairobi to and fro.',
    bullets: [
      { icon: 'Briefcase', text: 'Corporate & personal' },
      { icon: 'Clock', text: 'Daily scheduled runs' },
      { icon: 'Shield', text: 'Guaranteed seat' }
    ],
    cta: 'Reserve seat',
    ctaClass: 'bg-adventure-orange hover:bg-adventure-orange/90 border border-adventure-orange/50'
  }
];

const ServiceCard = ({ service, onOpen }) => (
  <div
    role="button"
    tabIndex={0}
    onClick={() => onOpen(service.id)}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onOpen(service.id);
      }
    }}
    className="bg-gray-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-800 flex flex-col h-full text-left"
  >
    <div className={`px-4 py-5 ${service.headerClass}`}>
      <span className={`inline-block text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full border mb-3 ${service.badgeClass}`}>
        {service.badge}
      </span>
      <h3 className="text-xl font-bold text-white">{service.title}</h3>
    </div>

    <div className="p-4 flex flex-col flex-grow">
      <p className="text-sm text-gray-400 leading-relaxed mb-4">{service.description}</p>

      <ul className="space-y-2.5 mb-5 flex-grow">
        {service.bullets.map((b) => (
          <li key={b.text} className="flex items-center gap-2 text-sm text-gray-300">
            <Icon name={b.icon} size={14} className="text-gray-500 flex-shrink-0" />
            <span>{b.text}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onOpen(service.id);
        }}
        className={`w-full py-3 px-4 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all ${service.ctaClass}`}
      >
        {service.cta}
        <Icon name="ArrowUpRight" size={14} />
      </button>
    </div>
  </div>
);

const ServiceCategories = () => {
  const [activeModal, setActiveModal] = useState(null);

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-br from-surface-premium via-white to-surface-premium/50 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-stellar-gold rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-cosmic-depth rounded-full blur-3xl" />
      </div>
      
      <div className="max-w-4xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-cosmic-depth/10 to-stellar-gold/10 backdrop-blur-sm rounded-full px-6 py-3 mb-8 border border-cosmic-depth/20">
            <span className="text-cosmic-depth font-semibold text-sm tracking-wide">PSV Services</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-cosmic-depth mb-6 leading-tight">
            Comprehensive PSV Solutions
          </h2>
          
          <p className="text-lg lg:text-xl text-text-refined max-w-2xl mx-auto leading-relaxed">
            We handle all corporate transportation, from daily commutes to large group travel, with precision and reliability.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} onOpen={setActiveModal} />
          ))}
        </div>
      </div>

      <GroupTransportModal isOpen={activeModal === 'group'} onClose={() => setActiveModal(null)} />
      <CorporateTransportModal isOpen={activeModal === 'corporate'} onClose={() => setActiveModal(null)} />
    </section>
  );
};

export default ServiceCategories;
