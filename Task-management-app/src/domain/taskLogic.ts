import type { Category, Priority, Task, TaskPriority, TaskStatus } from './models';
import { ValidationError } from './errors';

export interface TaskDraft {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority: TaskPriority;
  categoryId: string;
  dueDate?: string;
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  categoryId?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
  hideArchived?: boolean;
  sort?: 'dueDate' | 'priority' | 'createdAt' | 'title';
}

const statuses: readonly TaskStatus[] = ['todo', 'in-progress', 'done', 'archived'];
const priorities: readonly TaskPriority[] = ['low', 'medium', 'high', 'urgent'];
const priorityWeight: Record<TaskPriority, number> = { low: 1, medium: 2, high: 3, urgent: 4 };

export function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

export function validateTaskDraft(draft: TaskDraft): void {
  if (!draft.title.trim()) throw new ValidationError('Task title is required.');
  if (!draft.categoryId.trim()) throw new ValidationError('A category is required.');
  if (!priorities.includes(draft.priority)) throw new ValidationError('Task priority is invalid.');
  if (draft.status && !statuses.includes(draft.status)) throw new ValidationError('Task status is invalid.');
  if (draft.dueDate && !isValidDate(draft.dueDate)) throw new ValidationError('Due date must use YYYY-MM-DD.');
}

export function getTasksForCategory(tasks: readonly Task[], categoryId: Category['id']): Task[] {
  return tasks.filter((task) => task.categoryId === categoryId);
}

export function getTasksForPriority(tasks: readonly Task[], priority: Priority['level']): Task[] {
  return tasks.filter((task) => task.priority === priority);
}

export function queryTasks(tasks: readonly Task[], filters: TaskFilters): Task[] {
  const normalizedSearch = filters.search?.trim().toLocaleLowerCase();
  const filtered = tasks.filter((task) => {
    if (filters.hideArchived && task.status === 'archived') return false;
    if (filters.status && task.status !== filters.status) return false;
    if (filters.priority && task.priority !== filters.priority) return false;
    if (filters.categoryId && task.categoryId !== filters.categoryId) return false;
    if (filters.fromDate && (!task.dueDate || task.dueDate < filters.fromDate)) return false;
    if (filters.toDate && (!task.dueDate || task.dueDate > filters.toDate)) return false;
    if (normalizedSearch) {
      const searchable = [task.title, task.description].join(' ').toLocaleLowerCase();
      if (!searchable.includes(normalizedSearch)) return false;
    }
    return true;
  });

  return [...filtered].sort((first, second) => {
    switch (filters.sort) {
      case 'priority': return priorityWeight[second.priority] - priorityWeight[first.priority];
      case 'title': return first.title.localeCompare(second.title);
      case 'createdAt': return first.createdAt.localeCompare(second.createdAt);
      case 'dueDate': return (first.dueDate ?? '9999-12-31').localeCompare(second.dueDate ?? '9999-12-31');
      default: return 0;
    }
  });
}

