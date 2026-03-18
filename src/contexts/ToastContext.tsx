import React, { createContext, useContext, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ToastData } from '@/components/CommonComponents/ToastManager';

interface ToastContextType {
  toasts: ToastData[];
  addToast: (message: string, type: 'success' | 'alert' | 'fail' | 'info', duration?: number) => string;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
  showSuccess: (message: string, duration?: number) => string;
  showAlert: (message: string, duration?: number) => string;
  showError: (message: string, duration?: number) => string;
  showInfo: (message: string, duration?: number) => string;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const toastMethods = useToast();
  return (
    <ToastContext.Provider value={toastMethods}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToastContext = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
};

export default ToastContext;
