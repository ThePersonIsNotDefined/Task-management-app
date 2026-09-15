import { calculateTaskStatistics } from '../domain/statistics';
import type { Category, Task } from '../domain/models';

export function useTaskStats(tasks: readonly Task[], categories: readonly Category[]) {
  return calculateTaskStatistics(tasks, categories);
}