'use client';

import { Task } from '@/types';
import { Calendar, Tag, AlertCircle, Edit2, Trash2 } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

const priorityColors = {
  high: 'bg-red-500/10 text-red-500 border-red-500/20',
  medium: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  low: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
};

const priorityLabels = {
  high: 'Alta',
  medium: 'Média',
  low: 'Baixa',
};

export default function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const formattedDate = new Date(task.dueDate).toLocaleDateString('pt-BR');

  return (
    <div className="group relative bg-zinc-800/50 border border-zinc-700/50 p-4 rounded-xl hover:border-amber-400/30 transition-all duration-300">
      <div className="flex justify-between items-start mb-3">
        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${priorityColors[task.priority]}`}>
          {priorityLabels[task.priority]}
        </span>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-amber-400 transition-colors"
            title="Editar"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-1.5 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-red-400 transition-colors"
            title="Excluir"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <h3 className="text-zinc-100 font-semibold mb-2 line-clamp-1">{task.title}</h3>
      <p className="text-zinc-400 text-sm mb-4 line-clamp-2 leading-relaxed">
        {task.description}
      </p>

      <div className="flex flex-wrap gap-4 mt-auto">
        <div className="flex items-center gap-1.5 text-zinc-500 text-xs">
          <Calendar size={14} />
          <span>{formattedDate}</span>
        </div>
        
        {task.alert && (
          <div className="flex items-center gap-1.5 text-amber-400/80 text-xs">
            <AlertCircle size={14} />
            <span>Alerta</span>
          </div>
        )}

        {task.tags.length > 0 && (
          <div className="flex items-center gap-1.5 text-zinc-500 text-xs">
            <Tag size={14} />
            <span>{task.tags.length} tag{task.tags.length > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>
    </div>
  );
}
