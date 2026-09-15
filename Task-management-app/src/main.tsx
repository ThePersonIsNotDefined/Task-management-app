import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { TaskProvider } from './hooks/useTasks';
import { AuthProvider, useAuth } from './auth/useAuth';
import { AuthScreen } from './components/AuthScreen';
import './styles.css';
import './aero.css';

function Application() {
	const { user } = useAuth();
	if (!user) return <AuthScreen />;
	return <TaskProvider storageName={`task-management-${user.id}`}><App /></TaskProvider>;
}

createRoot(document.getElementById('root')!).render(<StrictMode><AuthProvider><Application /></AuthProvider></StrictMode>);