
import React from 'react';
import { Notification } from '../types';
import { Check, Info, AlertTriangle, CheckCircle2, Bell, X, Clock } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface NotificationDropdownProps {
  notifications: Notification[];
  onMarkAllRead: () => void;
  onMarkRead: (id: string) => void;
  onClose: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ 
  notifications, 
  onMarkAllRead, 
  onMarkRead,
  onClose 
}) => {
  const { t } = useLanguage();
  const sortedNotifications = [...notifications].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="w-4 h-4 text-[#C2410C]" />;
      case 'alert': return <AlertTriangle className="w-4 h-4 text-rose-500" />;
      default: return <Info className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="absolute top-16 right-0 z-50 w-96 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300 ring-1 ring-[#121212]/5">
      
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white/50">
        <h3 className="font-serif font-bold text-[#121212] text-lg flex items-center">
          {t('notif.title')}
        </h3>
        <div className="flex items-center space-x-4">
          {notifications.some(n => !n.read) && (
            <button 
              onClick={onMarkAllRead}
              className="text-[10px] font-bold uppercase tracking-widest text-[#C2410C] hover:text-orange-800 transition-colors"
            >
              {t('notif.mark_all')}
            </button>
          )}
          <button onClick={onClose} className="text-slate-400 hover:text-[#121212] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="max-h-[400px] overflow-y-auto dark-scroll">
        {sortedNotifications.length === 0 ? (
          <div className="py-16 px-6 text-center text-slate-400 flex flex-col items-center">
            <Bell className="w-10 h-10 mb-4 opacity-10" />
            <p className="text-sm font-medium font-serif italic">{t('notif.empty')}</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {sortedNotifications.map(n => (
              <div 
                key={n.id} 
                className={`p-5 hover:bg-slate-50 transition-colors flex gap-4 cursor-pointer group ${!n.read ? 'bg-[#C2410C]/5' : ''}`}
                onClick={() => !n.read && onMarkRead(n.id)}
              >
                <div className="mt-1 shrink-0">
                  {getIcon(n.type)}
                </div>
                <div className="flex-1">
                  <p className={`text-sm text-[#121212] mb-1.5 leading-snug ${!n.read ? 'font-bold' : 'font-medium'}`}>
                    {n.message}
                  </p>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 flex items-center">
                    <Clock className="w-3 h-3 mr-1.5" />
                    {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {!n.read && (
                  <div className="shrink-0 mt-2">
                    <div className="w-2 h-2 rounded-full bg-[#C2410C] shadow-[0_0_10px_#C2410C]"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
