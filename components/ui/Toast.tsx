
import React, { useEffect } from 'react';
import { Notification } from '../../types';
import { Bell, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface ToastContainerProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ notifications, onDismiss }) => {
  return (
    <div className="fixed top-24 right-6 z-[100] flex flex-col gap-4 pointer-events-none">
      {notifications.map(n => (
        <Toast key={n.id} notification={n} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const Toast: React.FC<{ notification: Notification; onDismiss: (id: string) => void }> = ({ notification, onDismiss }) => {
  const DURATION = 6000; // 6 seconds

  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(notification.id);
    }, DURATION); 
    return () => clearTimeout(timer);
  }, [notification.id, onDismiss]);

  const styles = {
    info: 'bg-white border-slate-100 text-[#121212] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)]',
    success: 'bg-[#121212] border-[#333] text-white shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)]',
    alert: 'bg-white border-rose-100 text-rose-900 shadow-[0_20px_40px_-10px_rgba(255,0,0,0.1)]'
  };

  const progressColors = {
    info: 'bg-[#C2410C]',
    success: 'bg-[#C2410C]', // Terracotta on Black looks premium
    alert: 'bg-rose-500'
  };

  const icons = {
    info: <Bell className="w-5 h-5 text-[#C2410C]" />,
    success: <CheckCircle2 className="w-5 h-5 text-[#C2410C]" />,
    alert: <AlertTriangle className="w-5 h-5 text-rose-500" />
  };

  return (
    <div className={`pointer-events-auto relative overflow-hidden flex items-start p-5 rounded-none md:rounded-sm border-l-4 ${notification.type === 'success' ? 'border-l-[#C2410C]' : 'border-l-transparent'} w-96 animate-in slide-in-from-right-10 fade-in duration-500 ${styles[notification.type]}`}>
      <div className="flex-shrink-0 pt-0.5">
        {icons[notification.type]}
      </div>
      <div className="ml-4 w-0 flex-1 relative z-10">
        <p className="text-sm font-bold font-serif tracking-wide">{notification.message}</p>
        <p className={`mt-1 text-[10px] uppercase tracking-widest font-medium ${notification.type === 'success' ? 'text-slate-400' : 'text-slate-400'}`}>
           {new Date(notification.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      <div className="ml-4 flex flex-shrink-0 relative z-10">
        <button
          onClick={() => onDismiss(notification.id)}
          className={`inline-flex focus:outline-none transition-colors ${notification.type === 'success' ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-[#121212]'}`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Bar */}
      <motion.div 
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: DURATION / 1000, ease: "linear" }}
        className={`absolute bottom-0 left-0 h-1 ${progressColors[notification.type]}`}
      />
    </div>
  );
};
