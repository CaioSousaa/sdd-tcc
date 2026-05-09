'use client';

import { Settings, LogOut } from 'lucide-react';
import UserMenu from '@/components/UserMenu';

interface HeaderProps {
  onSettingsClick: () => void;
  onLogout: () => void;
  isLoggingOut: boolean;
}

export default function Header({ onSettingsClick, onLogout, isLoggingOut }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <span className="text-amber-400 font-bold text-lg tracking-tight select-none">SDD</span>

        <div className="flex items-center gap-1">
          <UserMenu />

          <button
            onClick={onSettingsClick}
            className="p-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
            aria-label="Configurações"
            title="Configurações"
          >
            <Settings size={22} />
          </button>

          <button
            onClick={onLogout}
            disabled={isLoggingOut}
            className="p-2 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-60"
            aria-label="Sair"
            title="Sair"
          >
            <LogOut size={22} />
          </button>
        </div>
      </div>
    </header>
  );
}
