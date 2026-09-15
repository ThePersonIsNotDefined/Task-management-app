import { RepositoryError } from '../domain/errors';
import type { Category, Task } from '../domain/models';

export interface TaskRepository {
  getTasks(): Promise<Task[]>;
  getCategories(): Promise<Category[]>;
  putTask(task: Task): Promise<void>;
  deleteTask(id: string): Promise<void>;
  putCategory(category: Category): Promise<void>;
  deleteCategory(id: string): Promise<void>;
}

export class IndexedDbTaskRepository implements TaskRepository {
  private readonly databaseVersion = 1;

  constructor(private readonly databaseName = 'task-management-db') {}

  private open(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.databaseName, this.databaseVersion);
      request.onerror = () => reject(new RepositoryError('Unable to open task storage.', request.error));
      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains('tasks')) database.createObjectStore('tasks', { keyPath: 'id' });
        if (!database.objectStoreNames.contains('categories')) database.createObjectStore('categories', { keyPath: 'id' });
      };
      request.onsuccess = () => resolve(request.result);
    });
  }

  private async request<T>(storeName: 'tasks' | 'categories', mode: IDBTransactionMode, operation: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
    try {
      const database = await this.open();
      return await new Promise<T>((resolve, reject) => {
        const transaction = database.transaction(storeName, mode);
        const request = operation(transaction.objectStore(storeName));
        request.onerror = () => reject(new RepositoryError('Task storage operation failed.', request.error));
        request.onsuccess = () => resolve(request.result);
        transaction.oncomplete = () => database.close();
        transaction.onerror = () => reject(new RepositoryError('Task storage transaction failed.', transaction.error));
      });
    } catch (error) {
      if (error instanceof RepositoryError) throw error;
      throw new RepositoryError('Task storage is unavailable.', error);
    }
  }

  async getTasks(): Promise<Task[]> {
    return this.request('tasks', 'readonly', (store) => store.getAll());
  }

  async getCategories(): Promise<Category[]> {
    return this.request('categories', 'readonly', (store) => store.getAll());
  }

  async putTask(task: Task): Promise<void> {
    await this.request('tasks', 'readwrite', (store) => store.put(task));
  }

  async deleteTask(id: string): Promise<void> {
    await this.request('tasks', 'readwrite', (store) => store.delete(id));
  }

  async putCategory(category: Category): Promise<void> {
    await this.request('categories', 'readwrite', (store) => store.put(category));
  }

  async deleteCategory(id: string): Promise<void> {
    await this.request('categories', 'readwrite', (store) => store.delete(id));
  }
}