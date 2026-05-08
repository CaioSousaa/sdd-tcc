'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/axios';
import { Task } from '@/types';
import TaskColumn from '@/components/TaskColumn';
import TaskFormModal from '@/components/TaskFormModal';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';
import { Plus } from 'lucide-react';
import Button from '@/components/ui/Button';


export default function TaskBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await api.get<Task[]>('/tasks');
      setTasks(res.data);
    } catch (err) {
      console.error('Erro ao buscar tarefas:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

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
      <div className="flex justify-between items-center">
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
