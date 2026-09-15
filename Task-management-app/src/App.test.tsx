import 'fake-indexeddb/auto';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { TaskProvider } from './hooks/useTasks';
import { IndexedDbTaskRepository } from './data/TaskRepository';
import { TaskService } from './data/TaskService';
import { AuthProvider } from './auth/useAuth';

const renderApp = (): void => { localStorage.setItem('taskboard-session', JSON.stringify({ id: 'test-user', email: 'test@example.com', displayName: 'Test user', createdAt: '2026-01-01T00:00:00.000Z' })); const service = new TaskService(new IndexedDbTaskRepository(`test-${Math.random()}`), () => 'id-1'); render(<AuthProvider><TaskProvider service={service}><App /></TaskProvider></AuthProvider>); };

describe('Taskboard UI', () => {
  it('adds, finds, edits and deletes a task', async () => {
    const user = userEvent.setup(); renderApp();
    await user.click(await screen.findByRole('button', { name: 'Create task' }));
    await screen.findByRole('heading', { name: 'New task' });
    await user.type(screen.getByLabelText('Title'), 'Prepare release');
    await user.selectOptions(screen.getByLabelText('Task priority'), 'high');
    await user.click(screen.getByRole('button', { name: 'Add task' }));
    expect(await screen.findByRole('heading', { name: 'Prepare release' })).toBeInTheDocument();
    await user.type(screen.getByLabelText('Search tasks'), 'release');
    expect(screen.getByRole('heading', { name: 'Prepare release' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Edit' }));
    await user.clear(screen.getByLabelText('Title')); await user.type(screen.getByLabelText('Title'), 'Ship release');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(await screen.findByRole('heading', { name: 'Ship release' })).toBeInTheDocument();
    await user.clear(screen.getByLabelText('Search tasks'));
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await waitFor(() => expect(screen.getByText('No tasks match the current view.')).toBeInTheDocument());
  });

  it('creates, edits, and deletes a category', async () => {
    const user = userEvent.setup(); renderApp();
    await user.click(await screen.findByRole('button', { name: 'Categories' }));
    await screen.findByRole('heading', { name: 'Categories' });
    await user.type(screen.getByLabelText('Category name'), 'Planning');
    await user.click(screen.getByRole('button', { name: 'Create category' }));
    const planningHeading = await screen.findByRole('heading', { name: 'Planning' });
    const planningCard = planningHeading.closest('article');
    if (!planningCard) throw new Error('Planning category card was not found.');
    await user.click(within(planningCard).getByRole('button', { name: 'Edit' }));
    await user.clear(screen.getByLabelText('Category name'));
    await user.type(screen.getByLabelText('Category name'), 'Roadmap');
    await user.click(screen.getByRole('button', { name: 'Save category' }));
    const roadmapHeading = await screen.findByRole('heading', { name: 'Roadmap' });
    const roadmapCard = roadmapHeading.closest('article');
    if (!roadmapCard) throw new Error('Roadmap category card was not found.');
    await user.click(within(roadmapCard).getByRole('button', { name: 'Delete' }));
    await waitFor(() => expect(screen.queryByRole('heading', { name: 'Roadmap' })).not.toBeInTheDocument());
  });
});