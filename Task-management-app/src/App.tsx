import { useState } from 'react';
import { FilterPanel } from './components/FilterPanel';
import { StatisticsDashboard } from './components/StatisticsDashboard';
import { TaskForm } from './components/TaskForm';
import { TaskList } from './components/TaskList';
import { CategoryPanel } from './components/CategoryPanel';
import { useTaskFilters } from './hooks/useTaskFilters';
import { useTaskStats } from './hooks/useTaskStats';
import { useTasks } from './hooks/useTasks';
import type { Task } from './domain/models';
import { useAuth } from './auth/useAuth';

export default function App() {
  const { tasks, categories, loading, error, deleteTask, setStatus } = useTasks();
  const { user, logout } = useAuth();
  const { filters, setFilters, filteredTasks } = useTaskFilters(tasks);
  const statistics = useTaskStats(tasks, categories);
  const [editing, setEditing] = useState<Task | undefined>();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [view, setView] = useState<'tasks' | 'categories'>('tasks');
  const closeForm = (): void => { setEditing(undefined); setIsFormOpen(false); };
  if (loading) return <main className="loading">Loading taskboard...</main>;
  return <main><header><div><p className="eyebrow">Personal workflow</p><h1>Taskboard</h1></div><nav className="main-nav" aria-label="Main navigation"><button className={view === 'tasks' ? 'selected' : ''} onClick={() => setView('tasks')}>Tasks</button><button className={view === 'categories' ? 'selected' : ''} onClick={() => setView('categories')}>Categories</button></nav><p>{tasks.length} total tasks</p><div className="header-actions"><div className="account"><span>{user?.displayName}</span><button onClick={logout}>Sign out</button></div></div></header>{error && <p className="banner" role="alert">{error}</p>}
    {view === 'tasks' ? <><section className="dashboard"><StatisticsDashboard statistics={statistics} /></section><section className="task-toolbar" aria-label="Task search"><FilterPanel categories={categories} filters={filters} onChange={setFilters} /></section><section className="results"><TaskList tasks={filteredTasks} categories={categories} onCreate={() => { setEditing(undefined); setIsFormOpen(true); }} onEdit={(task) => { setEditing(task); setIsFormOpen(true); }} onDelete={(id) => void deleteTask(id)} onStatus={(id, status) => void setStatus(id, status)} /></section>{isFormOpen && <div className="form-overlay" role="presentation"><TaskForm editing={editing} onSaved={closeForm} onCancel={closeForm} /></div>}</> : <CategoryPanel />}
  </main>;
}