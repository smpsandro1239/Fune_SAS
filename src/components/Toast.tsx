'use client';

import React, { createContext, useCallback, useContext } from 'react';
import { toast as sonnerToast, Toaster } from 'sonner';

type ToastType = 'success' | 'error' | 'info';

interface ToastContextType {
  toast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const showToast = useCallback((type: ToastType, message: string) => {
    if (type === 'success') sonnerToast.success(message);
    else if (type === 'error') sonnerToast.error(message);
    else sonnerToast.info(message);
  }, []);

  return (
    <ToastContext.Provider value={{ toast: showToast }}>
      {children}
      <Toaster
        position="bottom-right"
        richColors
        theme="dark"
        closeButton
        toastOptions={{ duration: 4000 }}
      />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
