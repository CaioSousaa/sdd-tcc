'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { Tag } from '@/types';
import CreateTagForm from './CreateTagForm';
import { Trash2, X } from 'lucide-react';

interface ManageTagsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTagsChange: () => void;
}

export default function ManageTagsModal({ isOpen, onClose, onTagsChange }: ManageTagsModalProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchTags();
    }
  }, [isOpen]);

  async function fetchTags() {
    setIsLoading(true);
    try {
      const res = await api.get<Tag[]>('/tags');
      setTags(res.data);
    } catch (err) {
      console.error('Erro ao buscar tags:', err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir esta tag?')) return;

    try {
      await api.delete(`/tags/${id}`);
      fetchTags();
      onTagsChange();
    } catch (err) {
      console.error('Erro ao excluir tag:', err);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-zinc-100">Gerenciar Tags</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-8">
          <section>
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Nova Tag</h3>
            <CreateTagForm 
              unavailableColors={tags.map(t => t.color)} 
              onSuccess={() => {
                fetchTags();
                onTagsChange();
              }} 
            />
          </section>

          <section>
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Suas Tags</h3>
            {isLoading ? (
              <p className="text-sm text-zinc-500 animate-pulse">Carregando tags...</p>
            ) : tags.length === 0 ? (
              <p className="text-sm text-zinc-500 italic">Nenhuma tag criada ainda.</p>
            ) : (
              <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {tags.map((tag) => (
                  <div
                    key={tag.id}
                    className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 p-3 transition-colors hover:bg-zinc-900"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span className="text-sm font-medium text-zinc-200">{tag.name}</span>
                    </div>
                    <button
                      onClick={() => handleDelete(tag.id)}
                      className="text-zinc-500 hover:text-red-400 transition-colors"
                      title="Excluir tag"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
