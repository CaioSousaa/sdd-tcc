'use client';

import { useState, FormEvent } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';
import api from '@/lib/axios';
import { ApiError } from '@/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  function handleClose() {
    setName('');
    setPassword('');
    setError(null);
    setSuccess(false);
    onClose();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsLoading(true);

    const payload: { name?: string; password?: string } = {};
    if (name.trim()) payload.name = name.trim();
    if (password) payload.password = password;

    try {
      await api.put('/users', payload);
      setSuccess(true);
      setName('');
      setPassword('');
      setTimeout(handleClose, 1500);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError((err.response.data as ApiError).message);
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-zinc-100">Configurações</h2>
          <button
            onClick={handleClose}
            className="text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            id="settings-name"
            label="Novo nome (opcional)"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Deixe vazio para não alterar"
          />
          <Input
            id="settings-password"
            label="Nova senha (opcional)"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Mínimo 8 caracteres"
          />

          {error && (
            <p className="text-sm text-red-400" role="alert">{error}</p>
          )}
          {success && (
            <p className="text-sm text-green-400" role="status">Dados atualizados com sucesso!</p>
          )}

          <Button type="submit" isLoading={isLoading}>
            Salvar Alterações
          </Button>
        </form>
      </div>
    </div>
  );
}
