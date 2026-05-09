'use client';

import { X, AlertTriangle } from 'lucide-react';
import Button from './ui/Button';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ConfirmDeleteModal({ isOpen, onClose, onConfirm }: ConfirmDeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 text-red-500 mb-4 mx-auto">
          <AlertTriangle size={24} />
        </div>

        <h2 className="text-xl font-bold text-zinc-100 text-center mb-2">Excluir tarefa?</h2>
        <p className="text-zinc-400 text-center text-sm mb-6">
          Esta ação não pode ser desfeita. A tarefa será removida permanentemente.
        </p>

        <div className="flex gap-3">
          <Button 
            variant="ghost" 
            onClick={onClose} 
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button 
            variant="danger"
            onClick={onConfirm}
            className="flex-1"
          >
            Excluir
          </Button>

        </div>
      </div>
    </div>
  );
}
