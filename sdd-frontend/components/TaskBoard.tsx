'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/axios';
import { Task, Tag } from '@/types';
import TaskColumn from '@/components/TaskColumn';
import TaskFormModal from '@/components/TaskFormModal';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';
import { Plus, Filter } from 'lucide-react';
import Button from '@/components/ui/Button';


export default function TaskBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: any = {};
      if (filterPriority !== 'all') params.priority = filterPriority;
      if (filterTags.length > 0) params.tags = filterTags.join(',');

      const res = await api.get<Task[]>('/tasks', { params });
      setTasks(res.data);
    } catch (err) {
      console.error('Erro ao buscar tarefas:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filterPriority, filterTags]);

  const fetchTags = useCallback(async () => {
    try {
      const res = await api.get<Tag[]>('/tags');
      setAvailableTags(res.data);
    } catch (err) {
      console.error('Erro ao buscar tags:', err);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const handleEdit = (task: Task) => {
    setSelectedTask(task);
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (taskId: string) => {
    setTaskToDelete(taskId);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;
    try {
      await api.delete(`/tasks/${taskToDelete}`);
      setTasks(prev => prev.filter(t => t.id !== taskToDelete));
      setIsDeleteModalOpen(false);
    } catch (err) {
      console.error('Erro ao excluir tarefa:', err);
    }
  };

  const handleFormSuccess = () => {
    fetchTasks();
    setIsFormModalOpen(false);
    setSelectedTask(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
      </div>
    );
  }

  const tasksByStatus = {
    todo: tasks.filter(t => t.status === 'todo'),
    in_progress: tasks.filter(t => t.status === 'in_progress'),
    done: tasks.filter(t => t.status === 'done'),
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100">Minhas Tarefas</h1>
          <p className="text-zinc-500 mt-1">Gerencie seu fluxo de trabalho</p>
        </div>
        <Button 
          onClick={() => {
            setSelectedTask(null);
            setIsFormModalOpen(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus size={18} />
          Nova Tarefa
        </Button>
      </div>

      <div className="flex flex-wrap gap-4 items-center mb-6 bg-zinc-800/50 p-4 rounded-lg border border-zinc-800/80">
        <div className="flex items-center gap-2 text-zinc-400">
          <Filter size={18} />
          <span className="font-medium text-sm">Filtros:</span>
        </div>
        
        <select 
          value={filterPriority} 
          onChange={e => setFilterPriority(e.target.value)}
          className="bg-zinc-900 border border-zinc-700 text-zinc-300 text-sm rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-400"
        >
          <option value="all">Todas as prioridades</option>
          <option value="high">Alta</option>
          <option value="medium">Média</option>
          <option value="low">Baixa</option>
        </select>

        <div className="flex flex-wrap gap-2 border-l border-zinc-700 pl-4">
          {availableTags.length === 0 && <span className="text-xs text-zinc-500 py-1">Nenhuma tag cadastrada</span>}
          {availableTags.map(tag => (
            <button
              key={tag.id}
              onClick={() => {
                setFilterTags(prev => 
                  prev.includes(tag.id) 
                    ? prev.filter(id => id !== tag.id) 
                    : [...prev, tag.id]
                );
              }}
              className={`text-xs px-2 py-1 rounded-md border transition-all ${
                filterTags.includes(tag.id) 
                  ? 'bg-zinc-800 text-zinc-100 font-medium' 
                  : 'bg-transparent border-transparent text-zinc-400 hover:bg-zinc-800 hover:text-zinc-300'
              }`}
              style={filterTags.includes(tag.id) ? { borderColor: tag.color, borderLeftWidth: '3px' } : { borderLeftWidth: '3px', borderColor: 'transparent' }}
            >
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tag.color }}></span>
                {tag.name}
              </span>
            </button>
          ))}
        </div>
        
        {(filterPriority !== 'all' || filterTags.length > 0) && (
          <button 
            onClick={() => { setFilterPriority('all'); setFilterTags([]); }}
            className="text-xs text-amber-400 hover:text-amber-300 ml-auto font-medium"
          >
            Limpar Filtros
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-6 overflow-x-auto pb-6 scrollbar-hide">
        <TaskColumn 
          title="A Fazer" 
          tasks={tasksByStatus.todo} 
          onEdit={handleEdit} 
          onDelete={handleDeleteClick} 
        />
        <TaskColumn 
          title="Em Andamento" 
          tasks={tasksByStatus.in_progress} 
          onEdit={handleEdit} 
          onDelete={handleDeleteClick} 
        />
        <TaskColumn 
          title="Concluído" 
          tasks={tasksByStatus.done} 
          onEdit={handleEdit} 
          onDelete={handleDeleteClick} 
        />
      </div>

      <TaskFormModal 
        isOpen={isFormModalOpen} 
        onClose={() => setIsFormModalOpen(false)} 
        onSuccess={handleFormSuccess}
        task={selectedTask ?? undefined}
      />

      <ConfirmDeleteModal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        onConfirm={handleConfirmDelete} 
      />
    </div>
  );
}
