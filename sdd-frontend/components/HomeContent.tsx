'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import Header from '@/components/Header';
import TaskBoard from '@/components/TaskBoard';
import SettingsModal from '@/components/SettingsModal';

export default function HomeContent() {
  const router = useRouter();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await api.post('/auth/logout');
    } catch {
      // encerra sessão localmente mesmo com falha na API
    } finally {
      localStorage.removeItem('token');
      router.replace('/');
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <Header
        onSettingsClick={() => setIsSettingsOpen(true)}
        onLogout={handleLogout}
        isLoggingOut={isLoggingOut}
      />
      <main>
        <TaskBoard />
      </main>
      {/* Modal renderizado fora do Header para evitar stacking context do sticky z-40 */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}
