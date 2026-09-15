import type { Category, Task, TaskPriority, TaskStatus } from './models';

export interface TaskStatistics {
  byStatus: Record<TaskStatus, number>;
  byPriority: Record<TaskPriority, number>;
  byCategory: Record<string, number>;
  completionPercent: number;
  overdue: Task[];
  averageCompletionDays: number | null;
}

export function calculateTaskStatistics(tasks: readonly Task[], categories: readonly Category[], today = new Date()): TaskStatistics {
  const byStatus: Record<TaskStatus, number> = { todo: 0, 'in-progress': 0, done: 0, archived: 0 };
  const byPriority: Record<TaskPriority, number> = { low: 0, medium: 0, high: 0, urgent: 0 };
  const byCategory = Object.fromEntries(categories.map((category) => [category.id, 0])) as Record<string, number>;
  const todayText = today.toISOString().slice(0, 10);
  const completed = tasks.filter((task) => task.status === 'done');
  const durations = completed.map((task) => (Date.parse(task.updatedAt) - Date.parse(task.createdAt)) / 86_400_000);

  for (const task of tasks) {
    byStatus[task.status] += 1;
    byPriority[task.priority] += 1;
    byCategory[task.categoryId] = (byCategory[task.categoryId] ?? 0) + 1;
  }
  return {
    byStatus,
    byPriority,
    byCategory,
    completionPercent: tasks.length === 0 ? 0 : Math.round((completed.length / tasks.length) * 100),
    overdue: tasks.filter((task) => Boolean(task.dueDate && task.dueDate < todayText && task.status !== 'done' && task.status !== 'archived')),
    averageCompletionDays: durations.length === 0 ? null : durations.reduce((total, value) => total + value, 0) / durations.length,
  };
}