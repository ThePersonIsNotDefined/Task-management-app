import { ValidationError } from '../domain/errors';
import type { AuthRepository } from './AuthRepository';
import type { RegistrationInput, StoredUser, User } from './models';

export class AuthenticationError extends Error {
  constructor(message: string) { super(message); this.name = 'AuthenticationError'; }
}

export type PasswordHasher = (password: string, salt: string) => Promise<string>;

async function defaultHashPassword(password: string, salt: string): Promise<string> {
  const bytes = new TextEncoder().encode(`${salt}:${password}`);
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export class AuthService {
  constructor(
    private readonly repository: AuthRepository,
    private readonly hashPassword: PasswordHasher = defaultHashPassword,
    private readonly createId: () => string = () => crypto.randomUUID(),
    private readonly now: () => string = () => new Date().toISOString(),
  ) {}

  async register(input: RegistrationInput): Promise<User> {
    const email = input.email.trim().toLocaleLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(email)) throw new ValidationError('Enter a valid email address.');
    if (!input.displayName.trim()) throw new ValidationError('Name is required.');
    if (input.password.length < 8) throw new ValidationError('Password must contain at least 8 characters.');
    if (await this.repository.findByEmail(email)) throw new AuthenticationError('An account with this email already exists.');
    const passwordSalt = this.createId();
    const user: StoredUser = { id: this.createId(), email, displayName: input.displayName.trim(), passwordSalt, passwordHash: await this.hashPassword(input.password, passwordSalt), createdAt: this.now() };
    await this.repository.saveUser(user);
    return this.publicUser(user);
  }

  async login(emailInput: string, password: string): Promise<User> {
    const user = await this.repository.findByEmail(emailInput.trim().toLocaleLowerCase());
    if (!user || user.passwordHash !== await this.hashPassword(password, user.passwordSalt)) {
      throw new AuthenticationError('Email or password is incorrect.');
    }
    return this.publicUser(user);
  }

  private publicUser({ passwordHash: _passwordHash, passwordSalt: _passwordSalt, ...user }: StoredUser): User {
    return user;
  }
}