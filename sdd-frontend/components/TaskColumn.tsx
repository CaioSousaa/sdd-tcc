'use client';

import { Task } from '@/types';
import TaskCard from './TaskCard';

interface TaskColumnProps {
  title: string;
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

const priorityMap = { high: 3, medium: 2, low: 1 };

export default function TaskColumn({ title, tasks, onEdit, onDelete }: TaskColumnProps) {
  const sortedTasks = [...tasks].sort((a, b) => {
    if (priorityMap[b.priority] !== priorityMap[a.priority]) {
      return priorityMap[b.priority] - priorityMap[a.priority];
    }
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  return (
    <div className="flex flex-col gap-4 w-full min-w-[300px]">
      <div className="flex items-center justify-between px-2 mb-2">
        <h2 className="text-zinc-400 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
          {title}
          <span className="bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded-full text-[10px]">
            {tasks.length}
          </span>
        </h2>
      </div>

      <div className="flex flex-col gap-3 min-h-[500px] rounded-2xl bg-zinc-900/50 p-2 border border-zinc-800/50">
        {sortedTasks.map((task) => (
          <TaskCard 
            key={task.id} 
            task={task} 
            onEdit={onEdit} 
            onDelete={onDelete} 
          />
        ))}

        {sortedTasks.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 border-2 border-dashed border-zinc-800/50 rounded-xl p-8">
            <p className="text-sm">Nenhuma tarefa</p>
          </div>
        )}
      </div>
    </div>
  );
}
