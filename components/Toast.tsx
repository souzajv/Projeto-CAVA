import React, { useEffect } from 'react';
import { Notification } from '../types';
import { Bell, CheckCircle, XCircle, X } from 'lucide-react';

interface ToastContainerProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ notifications, onDismiss }) => {
  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-3 pointer-events-none">
      {notifications.map(n => (
        <Toast key={n.id} notification={n} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const Toast: React.FC<{ notification: Notification; onDismiss: (id: string) => void }> = ({ notification, onDismiss }) => {
  
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(notification.id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [notification.id, onDismiss]);

  const styles = {
    info: 'bg-white border-slate-200 text-slate-800',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    alert: 'bg-amber-50 border-amber-200 text-amber-900'
  };

  const icons = {
    info: <Bell className="w-5 h-5 text-indigo-500" />,
    success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    alert: <XCircle className="w-5 h-5 text-amber-500" />
  };

  return (
    <div className={`pointer-events-auto flex items-start p-4 rounded-xl shadow-xl border ${styles[notification.type]} w-80 animate-in slide-in-from-right-10 fade-in duration-300`}>
      <div className="flex-shrink-0 mt-0.5">
        {icons[notification.type]}
      </div>
      <div className="ml-3 w-0 flex-1 pt-0.5">
        <p className="text-sm font-medium">{notification.message}</p>
        <p className="mt-1 text-xs opacity-70">{new Date(notification.timestamp).toLocaleTimeString()}</p>
      </div>
      <div className="ml-4 flex flex-shrink-0">
        <button
          onClick={() => onDismiss(notification.id)}
          className="inline-flex text-slate-400 hover:text-slate-500 focus:outline-none"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};