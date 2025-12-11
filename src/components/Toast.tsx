/**
 * Toast Notification Component
 *
 * Displays temporary notifications to the user
 * Types: success, warning, error, info
 */

import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'warning' | 'error' | 'info';

export interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number; // milliseconds, 0 = no auto-dismiss
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 5000,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) {
          setTimeout(onClose, 300); // Wait for animation
        }
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) {
      setTimeout(onClose, 300);
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50 border-green-200',
          text: 'text-green-800',
          icon: <CheckCircle2 size={20} className="text-green-600" />
        };
      case 'warning':
        return {
          bg: 'bg-amber-50 border-amber-200',
          text: 'text-amber-800',
          icon: <AlertTriangle size={20} className="text-amber-600" />
        };
      case 'error':
        return {
          bg: 'bg-rose-50 border-rose-200',
          text: 'text-rose-800',
          icon: <XCircle size={20} className="text-rose-600" />
        };
      case 'info':
      default:
        return {
          bg: 'bg-blue-50 border-blue-200',
          text: 'text-blue-800',
          icon: <Info size={20} className="text-blue-600" />
        };
    }
  };

  const styles = getStyles();

  if (!isVisible) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-md ${styles.bg} border rounded-2xl p-4 shadow-xl transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 mt-0.5">{styles.icon}</div>
        <p className={`flex-1 text-sm font-medium ${styles.text}`}>{message}</p>
        <button
          onClick={handleClose}
          className={`shrink-0 ${styles.text} hover:opacity-70 transition-opacity`}
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

/**
 * Toast Container - Manages multiple toasts
 */
interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

export const ToastContainer: React.FC<{ toasts: ToastItem[]; onRemove: (id: string) => void }> = ({
  toasts,
  onRemove
}) => {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast, index) => (
        <div key={toast.id} className="pointer-events-auto" style={{ animationDelay: `${index * 100}ms` }}>
          <Toast
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => onRemove(toast.id)}
          />
        </div>
      ))}
    </div>
  );
};

/**
 * Toast Hook - Manage toasts in your component
 */
export const useToasts = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = (message: string, type: ToastType = 'info', duration: number = 5000) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type, duration }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const success = (message: string, duration?: number) => addToast(message, 'success', duration);
  const warning = (message: string, duration?: number) => addToast(message, 'warning', duration);
  const error = (message: string, duration?: number) => addToast(message, 'error', duration);
  const info = (message: string, duration?: number) => addToast(message, 'info', duration);

  return {
    toasts,
    addToast,
    removeToast,
    success,
    warning,
    error,
    info
  };
};

export default Toast;
