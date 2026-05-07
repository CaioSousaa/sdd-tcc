'use client';

import { useState } from 'react';
import axios from 'axios';
import api from '@/lib/axios';

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
      setError('o name é obrigatório');
      return;
    }
    if (!color) {
      setError('o color é obrigatório');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await api.post('/tags', { name, color });
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
    <form onSubmit={handleSubmit} noValidate>
      <div>
        <label htmlFor="tag-name">Nome</label>
        <input
          id="tag-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <fieldset>
        <legend>Cor</legend>
        {availableColors.map((c) => (
          <button
            key={c.hex}
            type="button"
            aria-label={c.label}
            aria-pressed={color === c.hex}
            onClick={() => setColor(c.hex)}
          />
        ))}
      </fieldset>

      {error && <p role="alert">{error}</p>}

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Aguarde...' : 'Criar tag'}
      </button>
    </form>
  );
}
