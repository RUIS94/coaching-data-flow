import React from 'react';
import Toast from './Toast';

export interface ToastData {
  id: string;
  message: string;
  type: 'success' | 'alert' | 'fail' | 'info';
  duration?: number;
}

interface ToastManagerProps {
  toasts: ToastData[];
  onRemoveToast: (id: string) => void;
}

const ToastManager: React.FC<ToastManagerProps> = ({ toasts, onRemoveToast }) => {
  return (
    <div className="fixed bottom-4 right-4 z-[99999] flex flex-col items-end justify-end gap-2">
      {toasts.map((toast) => (
        <div key={toast.id} className="transition-all duration-300 ease-in-out">
          <Toast
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => onRemoveToast(toast.id)}
          />
        </div>
      ))}
    </div>
  );
};

export default ToastManager;
