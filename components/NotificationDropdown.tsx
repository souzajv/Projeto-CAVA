import React from 'react';
import { Notification } from '../types';
import { Check, Info, AlertTriangle, CheckCircle, Bell, X } from 'lucide-react';
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
      case 'success': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'alert': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="absolute top-16 right-4 sm:right-20 z-50 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-top-2">
      
      {/* Header */}
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex justify-between items-center">
        <h3 className="font-bold text-slate-800 flex items-center">
          <Bell className="w-4 h-4 mr-2 text-slate-500" />
          {t('notif.title')}
        </h3>
        <div className="flex items-center space-x-2">
          {notifications.some(n => !n.read) && (
            <button 
              onClick={onMarkAllRead}
              className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 px-2 py-1 rounded transition-colors"
            >
              {t('notif.mark_all')}
            </button>
          )}
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="max-h-[60vh] overflow-y-auto">
        {sortedNotifications.length === 0 ? (
          <div className="py-12 px-6 text-center text-slate-400">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
            <p className="text-sm">{t('notif.empty')}</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {sortedNotifications.map(n => (
              <div 
                key={n.id} 
                className={`p-4 hover:bg-slate-50 transition-colors flex gap-3 cursor-pointer ${!n.read ? 'bg-blue-50/30' : ''}`}
                onClick={() => !n.read && onMarkRead(n.id)}
              >
                <div className="mt-1 shrink-0">
                  {getIcon(n.type)}
                </div>
                <div className="flex-1">
                  <p className={`text-sm text-slate-800 mb-1 ${!n.read ? 'font-semibold' : ''}`}>
                    {n.message}
                  </p>
                  <p className="text-xs text-slate-400">
                    {new Date(n.timestamp).toLocaleString()}
                  </p>
                </div>
                {!n.read && (
                  <div className="shrink-0 mt-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
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