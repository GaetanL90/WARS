import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

interface AppContextType {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  showToast: (message: string, type?: ToastType) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: ToastType = 'info') => {
    const id = crypto.randomUUID();
    const newToast: ToastMessage = { id, message, type };

    setToasts((prev) => [...prev, newToast]);

    // Auto-remove toast after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const value: AppContextType = {
    loading,
    setLoading,
    showToast,
  };

  const getToastVariant = (type: ToastType): string => {
    switch (type) {
      case 'success':
        return 'success';
      case 'error':
        return 'danger';
      case 'warning':
        return 'warning';
      case 'info':
      default:
        return 'info';
    }
  };

  return (
    <AppContext.Provider value={value}>
      {children}
      {/* Global Loading Spinner */}
      {loading && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <div className="text-center text-white">
            <div className="spinner-border spinner-border-lg" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <div className="mt-3">Loading...</div>
          </div>
        </div>
      )}

      {/* Toast Container */}
      <ToastContainer
        position="top-end"
        className="p-3"
        style={{ zIndex: 10000 }}
      >
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            onClose={() => removeToast(toast.id)}
            show={true}
            delay={5000}
            autohide
            bg={getToastVariant(toast.type)}
          >
            <Toast.Header className="text-white">
              <strong className="me-auto">
                {toast.type === 'success' && '✓ '}
                {toast.type === 'error' && '✕ '}
                {toast.type === 'warning' && '⚠ '}
                {toast.type === 'info' && 'ℹ '}
                {toast.type.charAt(0).toUpperCase() + toast.type.slice(1)}
              </strong>
            </Toast.Header>
            <Toast.Body className="text-white">{toast.message}</Toast.Body>
          </Toast>
        ))}
      </ToastContainer>
    </AppContext.Provider>
  );
};

