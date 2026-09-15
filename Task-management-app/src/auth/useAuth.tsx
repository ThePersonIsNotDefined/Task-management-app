import { createContext, useContext, useState, type PropsWithChildren } from 'react';
import { IndexedDbAuthRepository } from './AuthRepository';
import { AuthService } from './AuthService';
import type { RegistrationInput, User } from './models';

interface AuthContextValue {
  user: User | null;
  login(email: string, password: string): Promise<void>;
  register(input: RegistrationInput): Promise<void>;
  logout(): void;
}

const sessionKey = 'taskboard-session';
const AuthContext = createContext<AuthContextValue | null>(null);

function readSession(): User | null {
  try {
    const stored = localStorage.getItem(sessionKey);
    return stored ? JSON.parse(stored) as User : null;
  } catch { return null; }
}

export function AuthProvider({ children, service = new AuthService(new IndexedDbAuthRepository()) }: PropsWithChildren<{ service?: AuthService }>) {
  const [user, setUser] = useState<User | null>(readSession);
  const setSession = (nextUser: User): void => {
    localStorage.setItem(sessionKey, JSON.stringify(nextUser));
    setUser(nextUser);
  };
  return <AuthContext.Provider value={{ user, login: async (email, password) => setSession(await service.login(email, password)), register: async (input) => setSession(await service.register(input)), logout: () => { localStorage.removeItem(sessionKey); setUser(null); } }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider.');
  return context;
}