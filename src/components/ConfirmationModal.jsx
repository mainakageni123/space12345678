import React, { useEffect, useRef } from 'react';

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirm Action",
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    type = "danger", // danger, warning, info
    loading = false,
    children
}) => {
    const modalRef = useRef(null);
    const confirmButtonRef = useRef(null);
    const cancelButtonRef = useRef(null);

    // Focus management
    useEffect(() => {
        if (isOpen) {
            // Focus the cancel button by default for safety
            cancelButtonRef.current?.focus();
            
            // Prevent body scroll
            document.body.style.overflow = 'hidden';
            
            // Trap focus within modal
            const handleKeyDown = (e) => {
                if (e.key === 'Escape') {
                    onClose();
                    return;
                }
                
                if (e.key === 'Tab') {
                    const focusableElements = modalRef.current?.querySelectorAll(
                        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                    );
                    
                    if (focusableElements?.length) {
                        const firstElement = focusableElements[0];
                        const lastElement = focusableElements[focusableElements.length - 1];
                        
                        if (e.shiftKey && document.activeElement === firstElement) {
                            e.preventDefault();
                            lastElement.focus();
                        } else if (!e.shiftKey && document.activeElement === lastElement) {
                            e.preventDefault();
                            firstElement.focus();
                        }
                    }
                }
            };
            
            document.addEventListener('keydown', handleKeyDown);
            
            return () => {
                document.removeEventListener('keydown', handleKeyDown);
                document.body.style.overflow = 'unset';
            };
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const getTypeStyles = () => {
        switch (type) {
            case 'danger':
                return {
                    icon: '⚠️',
                    iconBg: 'bg-red-100',
                    iconColor: 'text-red-600',
                    confirmButton: 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                };
            case 'warning':
                return {
                    icon: '⚠️',
                    iconBg: 'bg-yellow-100',
                    iconColor: 'text-yellow-600',
                    confirmButton: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
                };
            case 'info':
                return {
                    icon: 'ℹ️',
                    iconBg: 'bg-blue-100',
                    iconColor: 'text-blue-600',
                    confirmButton: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                };
            default:
                return {
                    icon: '❓',
                    iconBg: 'bg-gray-100',
                    iconColor: 'text-gray-600',
                    confirmButton: 'bg-gray-600 hover:bg-gray-700 focus:ring-gray-500'
                };
        }
    };

    const styles = getTypeStyles();

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            />
            
            {/* Modal */}
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <div
                    ref={modalRef}
                    className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="modal-title"
                >
                    <div className="sm:flex sm:items-start">
                        {/* Icon */}
                        <div className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${styles.iconBg} sm:mx-0 sm:h-10 sm:w-10`}>
                            <span className={`text-xl ${styles.iconColor}`} aria-hidden="true">
                                {styles.icon}
                            </span>
                        </div>
                        
                        {/* Content */}
                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                            <h3 
                                className="text-base font-semibold leading-6 text-gray-900"
                                id="modal-title"
                            >
                                {title}
                            </h3>
                            <div className="mt-2">
                                {message && (
                                    <p className="text-sm text-gray-500">
                                        {message}
                                    </p>
                                )}
                                {children}
                            </div>
                        </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <button
                            ref={confirmButtonRef}
                            type="button"
                            disabled={loading}
                            onClick={onConfirm}
                            className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${styles.confirmButton}`}
                        >
                            {loading ? (
                                <div className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing...
                                </div>
                            ) : confirmText}
                        </button>
                        <button
                            ref={cancelButtonRef}
                            type="button"
                            disabled={loading}
                            onClick={onClose}
                            className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 sm:mt-0 sm:w-auto transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {cancelText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
