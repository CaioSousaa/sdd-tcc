'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Bell, Check } from 'lucide-react';
import api from '@/lib/axios';
import { Notification } from '@/types';

export default function UserMenu() {
  const menuRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get<Notification[]>('/notifications');
      setNotifications(res.data);
    } catch {
      // silencioso — o interceptor já trata 401
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  async function handleMarkAsRead(id: string) {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read: true } : n)),
      );
    } catch {
      // silencioso
    }
  }

  function handleToggle() {
    const next = !isOpen;
    setIsOpen(next);
    if (next) fetchNotifications();
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={handleToggle}
        className="relative p-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
        aria-label="Notificações"
        title="Notificações"
      >
        <Bell size={22} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-amber-400 text-zinc-900 text-[10px] font-bold px-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-80 rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-300">Notificações</h3>
            {unreadCount > 0 && (
              <span className="text-xs text-amber-400 font-medium">
                {unreadCount} nova{unreadCount > 1 ? 's' : ''}
              </span>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-xs text-zinc-500 text-center py-8">Nenhuma notificação</p>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 px-4 py-3 border-b border-zinc-800/50 last:border-0 ${n.read ? 'opacity-50' : ''}`}
                >
                  <div
                    className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${n.read ? 'bg-zinc-700' : 'bg-amber-400'}`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-zinc-300 leading-relaxed break-words">{n.message}</p>
                    <p className="text-[10px] text-zinc-600 mt-1">
                      {new Date(n.createdAt).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  {!n.read && (
                    <button
                      onClick={() => handleMarkAsRead(n.id)}
                      className="shrink-0 mt-1 text-zinc-500 hover:text-amber-400 transition-colors"
                      title="Marcar como lida"
                    >
                      <Check size={14} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
