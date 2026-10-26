import React from 'react';
import { NotificationItem } from '../types';
import { Bell, Check, Trash2, X, Zap, MessageSquare, Trophy } from 'lucide-react';
import { storage } from '../utils/storage';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onUpdateNotifications: (notifs: NotificationItem[]) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onUpdateNotifications,
}) => {
  if (!isOpen) return null;

  const handleMarkAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    onUpdateNotifications(updated);
    storage.saveNotifications(updated);
  };

  const handleClearAll = () => {
    onUpdateNotifications([]);
    storage.saveNotifications([]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-2xl space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              실시간 알림 센터
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action strip */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <button
            onClick={handleMarkAllAsRead}
            className="hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1"
          >
            <Check className="w-3.5 h-3.5" />
            <span>모두 읽음 처리</span>
          </button>
          <button
            onClick={handleClearAll}
            className="hover:text-rose-500 flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>전체 삭제</span>
          </button>
        </div>

        {/* Notifications List */}
        <div className="space-y-2.5 max-h-80 overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map(item => (
              <div
                key={item.id}
                className={`p-3 rounded-xl border text-xs transition-colors flex items-start gap-3 ${
                  item.read
                    ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800/60 text-slate-600 dark:text-slate-400'
                    : 'bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800/50 text-slate-900 dark:text-slate-200'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                  {item.type === 'challenge' ? (
                    <Trophy className="w-3.5 h-3.5 text-amber-500" />
                  ) : item.type === 'community' ? (
                    <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
                  ) : (
                    <Zap className="w-3.5 h-3.5 text-indigo-500" />
                  )}
                </div>

                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold">{item.title}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                    {item.message}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-xs text-slate-500">
              새로운 알림이 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
