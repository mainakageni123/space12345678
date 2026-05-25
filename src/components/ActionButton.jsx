import React from 'react';
import Icon from './AppIcon';
import { Link } from 'react-router-dom';
import { cn } from '../utils/cn';

const ActionButton = ({ to, icon, children, variant = 'default', onClick }) => {
  const buttonClasses = cn(
    'w-full flex items-center justify-center gap-3 py-4 rounded-lg font-medium transition-all duration-300 text-lg',
    variant === 'default' && 'bg-orange-600 text-white hover:bg-orange-700',
    variant === 'light' && 'bg-white/90 backdrop-blur-sm text-gray-900 hover:bg-white',
    variant === 'outline' && 'bg-transparent border-2 border-white text-white hover:bg-white/10'
  );

  const content = (
    <>
      {icon && <Icon name={icon} size={24} className="flex-shrink-0" />}
      <span>{children}</span>
    </>
  );

  if (to) {
    return (
      <Link to={to} className={buttonClasses}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={buttonClasses}>
      {content}
    </button>
  );
};

export default ActionButton;