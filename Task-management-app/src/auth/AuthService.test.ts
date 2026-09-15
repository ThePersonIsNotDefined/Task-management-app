import { AuthenticationError, AuthService, type PasswordHasher } from './AuthService';
import type { AuthRepository } from './AuthRepository';
import type { StoredUser } from './models';

class MemoryAuthRepository implements AuthRepository {
  private users: StoredUser[] = [];
  async findByEmail(email: string): Promise<StoredUser | undefined> { return this.users.find((user) => user.email === email); }
  async saveUser(user: StoredUser): Promise<void> { this.users.push(user); }
}

describe('AuthService', () => {
  const hasher: PasswordHasher = async (password, salt) => `${salt}:${password}`;

  it('registers an account and subsequently authenticates it', async () => {
    const service = new AuthService(new MemoryAuthRepository(), hasher, (() => { let id = 0; return () => `id-${++id}`; })(), () => '2026-01-01T00:00:00.000Z');
    await expect(service.register({ email: 'Ada@Example.com', displayName: 'Ada', password: 'password1' })).resolves.toMatchObject({ email: 'ada@example.com', displayName: 'Ada' });
    await expect(service.login('ada@example.com', 'password1')).resolves.toMatchObject({ displayName: 'Ada' });
    await expect(service.login('ada@example.com', 'bad-password')).rejects.toBeInstanceOf(AuthenticationError);
  });
});