import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthScreen } from '../components/AuthScreen';
import { AuthProvider } from './useAuth';
import { AuthService, type PasswordHasher } from './AuthService';
import type { AuthRepository } from './AuthRepository';
import type { StoredUser } from './models';

class MemoryAuthRepository implements AuthRepository {
  private users: StoredUser[] = [];
  async findByEmail(email: string): Promise<StoredUser | undefined> { return this.users.find((user) => user.email === email); }
  async saveUser(user: StoredUser): Promise<void> { this.users.push(user); }
}
const hasher: PasswordHasher = async (password, salt) => `${salt}:${password}`;

describe('AuthScreen', () => {
  it('registers a user through the form', async () => {
    const user = userEvent.setup();
    render(<AuthProvider service={new AuthService(new MemoryAuthRepository(), hasher, () => 'id-1')}><AuthScreen /></AuthProvider>);
    await user.click(screen.getByRole('tab', { name: 'Create account' }));
    await user.type(screen.getByLabelText('Name'), 'Ada');
    await user.type(screen.getByLabelText('Email'), 'ada@example.com');
    await user.type(screen.getByLabelText('Password'), 'password1');
    await user.click(screen.getByRole('button', { name: 'Create account' }));
    expect(JSON.parse(localStorage.getItem('taskboard-session') ?? '{}')).toMatchObject({ displayName: 'Ada' });
  });
});