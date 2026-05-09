export interface CreateTaskDTO {
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string;
  tags: string[];
  alert?: string;
}
