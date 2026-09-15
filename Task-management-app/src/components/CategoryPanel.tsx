import { useState, type FormEvent } from 'react';
import type { Category, Task } from '../domain/models';
import { useTasks } from '../hooks/useTasks';

export function CategoryPanel() {
  const { categories, tasks, createCategory, updateCategory, deleteCategory } = useTasks();
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#147dc4');
  const startEditing = (category: Category): void => { setEditing(category); setName(category.name); setColor(category.color ?? '#147dc4'); };
  const reset = (): void => { setEditing(null); setName(''); setColor('#147dc4'); };
  const save = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (editing) await updateCategory(editing.id, name, color); else await createCategory(name, color);
    reset();
  };
  const activeTaskCount = (categoryId: string): number => tasks.filter((task) => task.categoryId === categoryId && task.status !== 'archived').length;
  const taskCount = (categoryId: string): number => tasks.filter((task) => task.categoryId === categoryId).length;
  return <section className="categories-view" aria-label="Categories"><div className="categories-intro"><div><p className="eyebrow">Organization</p><h2>Categories</h2></div><p>Group tasks by the work that matters.</p></div>
    <form className="category-form" onSubmit={(event) => void save(event)} aria-label={editing ? 'Edit category' : 'Create category'}><label>Category name<input value={name} onChange={(event) => setName(event.target.value)} required /></label><label>Color<input className="color-input" type="color" value={color} onChange={(event) => setColor(event.target.value)} /></label><button type="submit">{editing ? 'Save category' : 'Create category'}</button>{editing && <button type="button" className="secondary" onClick={reset}>Cancel</button>}</form>
    <section className="category-list" aria-label="Category list">{categories.map((category) => { const activeCount = activeTaskCount(category.id); return <article className="category-card" key={category.id}><span className="category-color" style={{ backgroundColor: category.color ?? '#82cdee' }} /><div><h3>{category.name}</h3><p>{taskCount(category.id)} tasks{activeCount > 0 ? `, ${activeCount} active` : ''}</p></div><div className="category-actions"><button onClick={() => startEditing(category)}>Edit</button><button className="danger" disabled={activeCount > 0} title={activeCount > 0 ? 'Archive all category tasks before deleting.' : 'Delete category'} onClick={() => void deleteCategory(category.id)}>Delete</button></div></article>; })}</section>
  </section>;
}