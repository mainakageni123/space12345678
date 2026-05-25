import React from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import { cn } from '../../../utils/cn';

export const psvInputClass = 'bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus-visible:ring-cyan-500 focus-visible:ring-offset-0';
export const psvLabelClass = 'text-gray-300';

export const PsvInput = ({ className, ...props }) => (
  <Input labelClassName={psvLabelClass} className={cn(psvInputClass, className)} {...props} />
);

export const DarkSelect = ({ label, value, onChange, options, placeholder = 'Select', required }) => (
  <div className="space-y-2">
    {label && (
      <label className="text-sm font-medium text-gray-300 block">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
    )}
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className="w-full h-11 rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 appearance-none cursor-pointer"
      style={{ colorScheme: 'dark' }}
    >
      <option value="" disabled className="text-gray-400">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} className="bg-gray-800 text-white">
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

const PsvModalShell = ({
  title,
  badge,
  badgeClass,
  isOpen,
  onClose,
  success,
  successTitle,
  successMessage,
  successButtonLabel = 'Done',
  onSuccessClose,
  children,
  footer
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="flex flex-col w-full sm:max-w-lg max-h-[92dvh] sm:max-h-[min(90vh,720px)] bg-gray-900 text-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-gray-700 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex-shrink-0 flex items-center justify-between gap-3 px-4 sm:px-5 py-4 border-b border-gray-700 bg-gray-900">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <h2 className="text-lg font-bold text-white">{title}</h2>
            {badge && (
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border whitespace-nowrap ${badgeClass}`}>
                {badge}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex-shrink-0 p-2 rounded-lg hover:bg-gray-800 text-gray-300"
            aria-label="Close"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        {success ? (
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 text-center flex flex-col justify-center">
            <Icon name="CheckCircle" size={48} className="text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">{successTitle}</h3>
            <p className="text-gray-400 text-sm mb-6">{successMessage}</p>
            <button
              type="button"
              onClick={onSuccessClose || onClose}
              className="w-full py-3 rounded-xl bg-adventure-orange hover:bg-adventure-orange/90 text-white font-semibold"
            >
              {successButtonLabel}
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto overscroll-contain min-h-0 px-4 sm:px-5 py-4">
              {children}
            </div>
            {footer && (
              <div className="flex-shrink-0 border-t border-gray-700 bg-gray-900 px-4 sm:px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                {footer}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PsvModalShell;
