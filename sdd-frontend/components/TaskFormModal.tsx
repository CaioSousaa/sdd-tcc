'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import api from '@/lib/axios';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Tag, Task } from '@/types';
import ManageTagsModal from './ManageTagsModal';
import { Settings2, X } from 'lucide-react';

const SELECT_CLASSES =
  'rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors w-full';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  task?: Task; // Se presente, modo edição
}

export default function TaskFormModal({ isOpen, onClose, onSuccess, task }: TaskFormModalProps) {
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
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchTags();
      if (task) {
        setTitle(task.title);
        setDescription(task.description);
        setStatus(task.status);
        setPriority(task.priority);
        // Formatar data para o input date (YYYY-MM-DD)
        const date = new Date(task.dueDate).toISOString().split('T')[0];
        setDueDate(date);
        setSelectedTags(task.tags);
        // Formatar alerta para datetime-local (YYYY-MM-DDTHH:mm)
        if (task.alert) {
          const alertDate = new Date(task.alert).toISOString().slice(0, 16);
          setAlert(alertDate);
        } else {
          setAlert('');
        }
      } else {
        // Reset para criação
        setTitle('');
        setDescription('');
        setStatus('todo');
        setPriority('low');
        setDueDate('');
        setSelectedTags([]);
        setAlert('');
      }
    }
  }, [isOpen, task]);

  async function fetchTags() {
    try {
      const res = await api.get<Tag[]>('/tags');
      setAvailableTags(res.data);
    } catch (err) {
      console.error('Erro ao buscar tags:', err);
    }
  }

  function toggleTag(id: string) {
    setSelectedTags((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const payload = {
      title,
      description,
      status,
      priority,
      dueDate,
      tags: selectedTags,
      alert: alert || undefined,
    };

    try {
      if (task) {
        await api.patch(`/tasks/${task.id}`, payload);
      } else {
        await api.post('/tasks', payload);
      }
      onSuccess?.();
      onClose();
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative bg-zinc-950 border border-zinc-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200 my-8">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-zinc-100 mb-6">
          {task ? 'Editar tarefa' : 'Nova tarefa'}
        </h2>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          <Input
            id="task-title"
            label="Título"
            type="text"
            placeholder="O que precisa ser feito?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="task-description" className="text-sm font-medium text-zinc-300">
              Descrição
            </label>
            <textarea
              id="task-description"
              rows={3}
              value={description}
              placeholder="Adicione mais detalhes..."
              onChange={(e) => setDescription(e.target.value)}
              className="rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
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

            <div className="flex flex-col gap-1.5">
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

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-300">Tags</span>
              <button
                type="button"
                onClick={() => setIsTagModalOpen(true)}
                className="flex items-center gap-1.5 text-xs font-medium text-amber-400 hover:text-amber-300 transition-colors"
              >
                <Settings2 size={14} />
                Gerenciar Tags
              </button>
            </div>

            <div className="flex flex-wrap gap-2 min-h-[32px] items-center">
              {availableTags.length > 0 ? (
                availableTags.map((tag) => {
                  const selected = selectedTags.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      style={{ 
                        borderColor: tag.color, 
                        color: selected ? '#fff' : tag.color,
                        backgroundColor: selected ? tag.color : 'transparent'
                      }}
                      className={`px-3 py-1 rounded-full text-[10px] border transition-all hover:brightness-110 ${
                        selected ? 'font-bold shadow-lg scale-105' : 'bg-transparent'
                      }`}
                    >
                      {tag.name}
                    </button>
                  );
                })
              ) : (
                <p className="text-[10px] text-zinc-500 italic">Você ainda não tem tags.</p>
              )}
            </div>
          </div>

          <Input
            id="task-alert"
            label="Alerta (opcional)"
            type="datetime-local"
            value={alert}
            onChange={(e) => setAlert(e.target.value)}
          />

          {error && (
            <p role="alert" className="text-red-400 text-sm text-center">
              {error}
            </p>
          )}

          <div className="flex gap-3 mt-2">
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" isLoading={isLoading} className="flex-1">
              {task ? 'Salvar alterações' : 'Criar tarefa'}
            </Button>
          </div>
        </form>

        <ManageTagsModal
          isOpen={isTagModalOpen}
          onClose={() => setIsTagModalOpen(false)}
          onTagsChange={fetchTags}
        />
      </div>
    </div>
  );
}
