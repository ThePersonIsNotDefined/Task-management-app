import { type TaskDraft, validateTaskDraft } from '../domain/taskLogic';
import type { Category, Task, TaskStatus } from '../domain/models';
import type { TaskRepository } from './TaskRepository';

export class TaskService {
  constructor(
    private readonly repository: TaskRepository,
    private readonly createId: () => string = () => crypto.randomUUID(),
    private readonly now: () => string = () => new Date().toISOString(),
  ) {}

  getTasks(): Promise<Task[]> { return this.repository.getTasks(); }
  getCategories(): Promise<Category[]> { return this.repository.getCategories(); }
  addCategory(category: Category): Promise<void> { return this.repository.putCategory(category); }

  async createCategory(name: string, color?: string): Promise<Category> {
    const trimmedName = name.trim();
    if (!trimmedName) throw new Error('Category name is required.');
    const category: Category = { id: this.createId(), name: trimmedName, color };
    await this.repository.putCategory(category);
    return category;
  }

  async updateCategory(id: string, name: string, color?: string): Promise<Category> {
    const trimmedName = name.trim();
    if (!trimmedName) throw new Error('Category name is required.');
    const category: Category = { id, name: trimmedName, color };
    await this.repository.putCategory(category);
    return category;
  }

  async deleteCategory(id: string): Promise<void> {
    const tasks = await this.repository.getTasks();
    if (tasks.some((task) => task.categoryId === id && task.status !== 'archived')) {
      throw new Error('Archive all tasks in this category before deleting it.');
    }
    await this.repository.deleteCategory(id);
  }

  async create(draft: TaskDraft): Promise<Task> {
    validateTaskDraft(draft);
    const id = this.createId();
    const timestamp = this.now();
    const created: Task = {
      id, title: draft.title.trim(), description: draft.description?.trim() ?? '', status: draft.status ?? 'todo', priority: draft.priority,
      categoryId: draft.categoryId, dueDate: draft.dueDate,
      createdAt: timestamp, updatedAt: timestamp,
    };
    await this.repository.putTask(created);
    return created;
  }

  async update(id: string, changes: Partial<TaskDraft>): Promise<Task> {
    const tasks = await this.repository.getTasks();
    const current = tasks.find((task) => task.id === id);
    if (!current) throw new Error('Task not found.');
    const merged: TaskDraft = { ...current, ...changes };
    validateTaskDraft(merged);
    const updated: Task = { ...current, ...merged, title: merged.title.trim(), description: merged.description?.trim() ?? '', updatedAt: this.now() };
    await this.repository.putTask(updated);
    return updated;
  }

  updateStatus(id: string, status: TaskStatus): Promise<Task> { return this.update(id, { status }); }

  async delete(id: string): Promise<void> {
    await this.repository.deleteTask(id);
  }
}