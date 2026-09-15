import { useState, type FormEvent } from 'react';
import type { Task } from '../domain/models';
import type { TaskDraft } from '../domain/taskLogic';
import { useTasks } from '../hooks/useTasks';

interface Props { editing?: Task; onSaved(): void; onCancel?(): void; }
export function TaskForm({ editing, onSaved, onCancel }: Props) {
  const { categories, createTask, updateTask } = useTasks();
  const [error, setError] = useState<string | null>(null);
  const submit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const draft: TaskDraft = {
      title: String(form.get('title') ?? ''), description: String(form.get('description') ?? ''), priority: String(form.get('priority')) as Task['priority'], categoryId: String(form.get('categoryId')),
      dueDate: String(form.get('dueDate') ?? '') || undefined,
    };
    try { if (editing) await updateTask(editing.id, draft); else await createTask(draft); onSaved(); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to save task.'); }
  };
  return <form className="task-form" onSubmit={(event) => void submit(event)} aria-label={editing ? 'Edit task' : 'Create task'}>
    <h2>{editing ? 'Edit task' : 'New task'}</h2>
    <label>Title<input name="title" defaultValue={editing?.title} required /></label>
    <label>Description<textarea name="description" defaultValue={editing?.description} /></label>
    <div className="form-grid"><label>Task priority<select name="priority" defaultValue={editing?.priority ?? 'medium'}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option></select></label>
      <label>Category<select name="categoryId" defaultValue={editing?.categoryId}>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
      <label>Due date<input name="dueDate" type="date" defaultValue={editing?.dueDate} /></label></div>
    {error && <p role="alert">{error}</p>}<div className="form-actions"><button type="submit">{editing ? 'Save changes' : 'Add task'}</button>{onCancel && <button type="button" className="secondary" onClick={onCancel}>Cancel</button>}</div>
  </form>;
}