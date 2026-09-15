import { useState } from 'react';
import { queryTasks, type TaskFilters } from '../domain/taskLogic';
import type { Task } from '../domain/models';

export function useTaskFilters(tasks: readonly Task[]) {
  const [filters, setFilters] = useState<TaskFilters>({ sort: 'dueDate' });
  return { filters, setFilters, filteredTasks: queryTasks(tasks, filters) };
}