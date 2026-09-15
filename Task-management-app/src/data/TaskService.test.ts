import 'fake-indexeddb/auto';
import { IndexedDbTaskRepository } from './TaskRepository';
import { TaskService } from './TaskService';

describe('TaskService with IndexedDB', () => {
  it('persists and completes a task', async () => {
    const service = new TaskService(new IndexedDbTaskRepository(), (() => { let value = 0; return () => `id-${++value}`; })(), () => '2026-01-01T00:00:00.000Z');
    const created = await service.create({ title: 'Standup', priority: 'medium', categoryId: 'work', dueDate: '2026-01-10' });
    await service.updateStatus(created.id, 'done');
    const all = await service.getTasks();
    expect(all).toHaveLength(1);
    expect(all[0].status).toBe('done');
  });

  it('only deletes a category once all of its tasks are archived', async () => {
    const service = new TaskService(new IndexedDbTaskRepository(`category-test-${Math.random()}`), (() => { let value = 0; return () => `id-${++value}`; })());
    const category = await service.createCategory('Projects', '#147dc4');
    const task = await service.create({ title: 'Launch', priority: 'high', categoryId: category.id });
    await expect(service.deleteCategory(category.id)).rejects.toThrow('Archive all tasks');
    await service.updateStatus(task.id, 'archived');
    await service.deleteCategory(category.id);
    expect(await service.getCategories()).not.toContainEqual(category);
    expect((await service.getTasks())[0].categoryId).toBe(category.id);
  });
});