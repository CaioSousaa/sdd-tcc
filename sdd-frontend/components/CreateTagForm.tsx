'use client';

import { useState } from 'react';
import axios from 'axios';
import api from '@/lib/axios';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const TAG_COLORS = [
  { hex: '#F59E0B', label: 'Amber' },
  { hex: '#EF4444', label: 'Red' },
  { hex: '#22C55E', label: 'Green' },
  { hex: '#3B82F6', label: 'Blue' },
  { hex: '#A855F7', label: 'Purple' },
  { hex: '#EC4899', label: 'Pink' },
  { hex: '#06B6D4', label: 'Cyan' },
] as const;

interface CreateTagFormProps {
  unavailableColors?: string[];
  onSuccess?: () => void;
}

export default function CreateTagForm({ unavailableColors = [], onSuccess }: CreateTagFormProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const availableColors = TAG_COLORS.filter((c) => !unavailableColors.includes(c.hex));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) {
      setError('O nome é obrigatório');
      return;
    }
    if (!color) {
      setError('Selecione uma cor');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await api.post('/tags', { name, color });
      setName('');
      setColor('');
      onSuccess?.();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message ?? 'Erro inesperado. Tente novamente.');
      } else {
        setError('Erro inesperado. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <Input
        id="tag-name"
        label="Nome da Tag"
        type="text"
        placeholder="Ex: Urgente, Pessoal..."
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-zinc-300">Cor</label>
        <div className="flex flex-wrap gap-3">
          {availableColors.map((c) => (
            <button
              key={c.hex}
              type="button"
              aria-label={c.label}
              onClick={() => setColor(c.hex)}
              className={`h-8 w-8 rounded-full border-2 transition-all hover:scale-110 ${
                color === c.hex ? 'border-white scale-110 shadow-[0_0_10px_rgba(255,255,255,0.3)]' : 'border-transparent'
              }`}
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>
      </div>

      {error && (
        <p role="alert" className="text-red-400 text-sm">
          {error}
        </p>
      )}

      <Button type="submit" isLoading={isLoading} className="mt-2">
        Criar Tag
      </Button>
    </form>
  );
}
