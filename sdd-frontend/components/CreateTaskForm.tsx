'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import api from '@/lib/axios';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Tag } from '@/types';

const SELECT_CLASSES =
  'rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors w-full';

interface CreateTaskFormProps {
  onSuccess?: () => void;
}

export default function CreateTaskForm({ onSuccess }: CreateTaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('todo');
  const [priority, setPriority] = useState('low');
  const [dueDate, setDueDate] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [alert, setAlert] = useState('');
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    api.get<Tag[]>('/tags').then((res) => setAvailableTags(res.data)).catch(() => {});
  }, []);

  function toggleTag(id: string) {
    setSelectedTags((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await api.post('/tasks', {
        title,
        description,
        status,
        priority,
        dueDate,
        tags: selectedTags,
        alert: alert || undefined,
      });
      setTitle('');
      setDescription('');
      setStatus('todo');
      setPriority('low');
      setDueDate('');
      setSelectedTags([]);
      setAlert('');
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
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 w-full max-w-lg">
      <h2 className="text-lg font-semibold text-zinc-100 mb-5">Nova tarefa</h2>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <Input
          id="task-title"
          label="Título"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div className="flex flex-col gap-1">
          <label htmlFor="task-description" className="text-sm font-medium text-zinc-300">
            Descrição
          </label>
          <textarea
            id="task-description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors resize-none"
          />
        </div>

        <div className="flex gap-3">
          <div className="flex flex-col gap-1 flex-1">
            <label htmlFor="task-status" className="text-sm font-medium text-zinc-300">
              Status
            </label>
            <select
              id="task-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={SELECT_CLASSES}
            >
              <option value="todo">A fazer</option>
              <option value="in_progress">Em andamento</option>
              <option value="done">Concluído</option>
            </select>
          </div>

          <div className="flex flex-col gap-1 flex-1">
            <label htmlFor="task-priority" className="text-sm font-medium text-zinc-300">
              Prioridade
            </label>
            <select
              id="task-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className={SELECT_CLASSES}
            >
              <option value="low">Baixa</option>
              <option value="medium">Média</option>
              <option value="high">Alta</option>
            </select>
          </div>
        </div>

        <Input
          id="task-dueDate"
          label="Data de vencimento"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />

        {availableTags.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-zinc-300">Tags</span>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => {
                const selected = selectedTags.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    style={{ borderColor: tag.color, color: selected ? tag.color : undefined }}
                    className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                      selected
                        ? 'bg-zinc-800 font-semibold'
                        : 'border-zinc-600 text-zinc-400 hover:border-zinc-400'
                    }`}
                  >
                    {tag.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <Input
          id="task-alert"
          label="Alerta (opcional)"
          type="datetime-local"
          value={alert}
          onChange={(e) => setAlert(e.target.value)}
        />

        {error && (
          <p role="alert" className="text-red-400 text-sm">
            {error}
          </p>
        )}

        <Button type="submit" isLoading={isLoading}>
          Criar tarefa
        </Button>
      </form>
    </div>
  );
}
