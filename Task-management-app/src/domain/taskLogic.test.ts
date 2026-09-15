import { ValidationError } from './errors';
import { queryTasks, validateTaskDraft } from './taskLogic';
import { calculateTaskStatistics } from './statistics';
import type { Task } from './models';

const task = (overrides: Partial<Task>): Task => ({
  id: 'task-1', title: 'Write plan', description: 'Quarterly planning', status: 'todo', priority: 'high', categoryId: 'work', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z', ...overrides,
});

describe('task business rules', () => {
  it('validates required fields and dates', () => {
    expect(() => validateTaskDraft({ title: '', priority: 'low', categoryId: 'work' })).toThrow(ValidationError);
    expect(() => validateTaskDraft({ title: 'Valid', priority: 'low', categoryId: 'work', dueDate: '2026-02-30' })).toThrow(ValidationError);
  });

  it('filters, searches and sorts tasks', () => {
    const result = queryTasks([task({ id: 'a', dueDate: '2026-05-01', status: 'archived' }), task({ id: 'b', title: 'Buy milk', priority: 'urgent' })], { search: 'milk', sort: 'priority', hideArchived: true });
    expect(result.map((item) => item.id)).toEqual(['b']);
  });

  it('calculates task statistics', () => {
    const stats = calculateTaskStatistics([task({ dueDate: '2026-01-02' }), task({ id: 'done', status: 'done', priority: 'low', updatedAt: '2026-01-03T00:00:00.000Z' })], [{ id: 'work', name: 'Work' }], new Date('2026-01-10T00:00:00.000Z'));
    expect(stats.overdue).toHaveLength(1);
    expect(stats.completionPercent).toBe(50);
    expect(stats.averageCompletionDays).toBe(2);
  });
});