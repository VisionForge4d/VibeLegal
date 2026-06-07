import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertTriangle, Info, X, AlertCircle } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ type = 'success', title, message, duration = 5000 }) => {
    const id = Math.random().toString(36).substr(2, 9);
    const toast = { id, type, title, message, duration };
    
    setToasts(prev => [...prev, toast]);
    
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const toast = useCallback({
    success: (title, message, options = {}) => 
      addToast({ type: 'success', title, message, ...options }),
    error: (title, message, options = {}) => 
      addToast({ type: 'error', title, message, duration: 7000, ...options }),
    warning: (title, message, options = {}) => 
      addToast({ type: 'warning', title, message, duration: 6000, ...options }),
    info: (title, message, options = {}) => 
      addToast({ type: 'info', title, message, ...options }),
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ toast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, onRemove }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

function Toast({ toast, onRemove }) {
  const { id, type, title, message } = toast;

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getIcon = () => {
    const iconProps = { className: "w-5 h-5 flex-shrink-0" };
    switch (type) {
      case 'success':
        return <CheckCircle {...iconProps} className="w-5 h-5 flex-shrink-0 text-green-600" />;
      case 'error':
        return <AlertCircle {...iconProps} className="w-5 h-5 flex-shrink-0 text-red-600" />;
      case 'warning':
        return <AlertTriangle {...iconProps} className="w-5 h-5 flex-shrink-0 text-yellow-600" />;
      case 'info':
        return <Info {...iconProps} className="w-5 h-5 flex-shrink-0 text-blue-600" />;
      default:
        return <Info {...iconProps} />;
    }
  };

  return (
    <div
      className={`
        ${getToastStyles()}
        border rounded-lg p-4 shadow-lg backdrop-blur-sm
        animate-in slide-in-from-right-full duration-300
        flex items-start gap-3 relative max-w-sm
      `}
    >
      {getIcon()}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium">{title}</h4>
        {message && <p className="text-sm mt-1 opacity-90">{message}</p>}
      </div>
      <button
        onClick={() => onRemove(id)}
        className="flex-shrink-0 p-1 hover:opacity-70 transition-opacity"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// Convenience hook for common toast patterns
export const useSuccessToast = () => {
  const { toast } = useToast();
  return useCallback((title, message) => toast.success(title, message), [toast]);
};

export const useErrorToast = () => {
  const { toast } = useToast();
  return useCallback((title, message) => toast.error(title, message), [toast]);
};

export const useContractToasts = () => {
  const { toast } = useToast();
  
  return {
    contractGenerated: () => toast.success(
      'Contract Generated Successfully!', 
      'Your professional employment contract is ready for review.'
    ),
    contractSaved: () => toast.success(
      'Contract Saved', 
      'Your contract has been saved to your dashboard.'
    ),
    contractDownloaded: (format = 'document') => toast.success(
      'Download Complete', 
      `Your contract has been downloaded as a ${format}.`
    ),
    generationError: () => toast.error(
      'Generation Failed', 
      'Unable to generate contract. Please check your inputs and try again.'
    ),
    saveError: () => toast.error(
      'Save Failed', 
      'Unable to save contract. Please try again.'
    ),
    authError: () => toast.error(
      'Authentication Required', 
      'Please sign in to access this feature.'
    )
  };
};