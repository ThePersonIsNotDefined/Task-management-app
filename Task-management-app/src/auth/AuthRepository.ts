import { RepositoryError } from '../domain/errors';
import type { StoredUser } from './models';

export interface AuthRepository {
  findByEmail(email: string): Promise<StoredUser | undefined>;
  saveUser(user: StoredUser): Promise<void>;
}

export class IndexedDbAuthRepository implements AuthRepository {
  private readonly databaseName = 'task-management-db';
  private readonly databaseVersion = 2;

  private open(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.databaseName, this.databaseVersion);
      request.onerror = () => reject(new RepositoryError('Unable to open account storage.', request.error));
      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains('users')) {
          const users = database.createObjectStore('users', { keyPath: 'id' });
          users.createIndex('email', 'email', { unique: true });
        }
      };
      request.onsuccess = () => resolve(request.result);
    });
  }

  private async request<T>(mode: IDBTransactionMode, operation: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
    try {
      const database = await this.open();
      return await new Promise<T>((resolve, reject) => {
        const transaction = database.transaction('users', mode);
        const request = operation(transaction.objectStore('users'));
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(new RepositoryError('Account storage operation failed.', request.error));
        transaction.oncomplete = () => database.close();
        transaction.onerror = () => reject(new RepositoryError('Account storage transaction failed.', transaction.error));
      });
    } catch (error) {
      if (error instanceof RepositoryError) throw error;
      throw new RepositoryError('Account storage is unavailable.', error);
    }
  }

  findByEmail(email: string): Promise<StoredUser | undefined> {
    return this.request('readonly', (store) => store.index('email').get(email));
  }

  async saveUser(user: StoredUser): Promise<void> {
    await this.request('readwrite', (store) => store.put(user));
  }
}