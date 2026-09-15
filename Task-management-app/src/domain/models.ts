export type TaskStatus = 'todo' | 'in-progress' | 'done' | 'archived';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Category {
  id: string;
  name: string;
  color?: string;
}

export interface Priority {
  id: string;
  level: TaskPriority;
  weight: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  categoryId: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}