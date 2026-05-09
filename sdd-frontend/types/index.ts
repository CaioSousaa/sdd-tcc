export interface ApiError {
  message: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  owner: string;
  tags: string[];
  alert?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  owner: string;
  task: string;
  message: string;
  read: boolean;
  createdAt: string;
}

