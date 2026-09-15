import { useState, type FormEvent } from 'react';
import { useAuth } from '../auth/useAuth';

export function AuthScreen() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [error, setError] = useState<string | null>(null);
  const submit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      if (mode === 'login') await login(String(form.get('email')), String(form.get('password')));
      else await register({ email: String(form.get('email')), displayName: String(form.get('displayName')), password: String(form.get('password')) });
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to authenticate.'); }
  };
  return <main className="auth-page"><section className="auth-panel"><p className="eyebrow">Personal workflow</p><h1>Taskboard</h1><div className="auth-tabs" role="tablist"><button type="button" role="tab" aria-selected={mode === 'login'} className={mode === 'login' ? 'selected' : ''} onClick={() => { setMode('login'); setError(null); }}>Sign in</button><button type="button" role="tab" aria-selected={mode === 'register'} className={mode === 'register' ? 'selected' : ''} onClick={() => { setMode('register'); setError(null); }}>Create account</button></div>
    <form onSubmit={(event) => void submit(event)} aria-label={mode === 'login' ? 'Sign in' : 'Create account'}>
      {mode === 'register' && <label>Name<input name="displayName" required autoComplete="name" /></label>}
      <label>Email<input name="email" type="email" required autoComplete="email" /></label>
      <label>Password<input name="password" type="password" required minLength={8} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} /></label>
      {error && <p role="alert" className="banner">{error}</p>}
      <button type="submit">{mode === 'login' ? 'Sign in' : 'Create account'}</button>
    </form>
  </section></main>;
}