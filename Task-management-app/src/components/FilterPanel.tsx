import type { Category } from '../domain/models';
import type { TaskFilters } from '../domain/taskLogic';
interface Props { categories: readonly Category[]; filters: TaskFilters; onChange(filters: TaskFilters): void; }
export function FilterPanel({ categories, filters, onChange }: Props) {
  const change = (field: keyof TaskFilters, value: string): void => onChange({ ...filters, [field]: value || undefined });
  return <section className="filters" aria-label="Task filters"><input className="search-field" aria-label="Search tasks" placeholder="Search tasks" value={filters.search ?? ''} onChange={(event) => change('search', event.target.value)} />
    <select aria-label="Status" value={filters.status ?? ''} onChange={(event) => change('status', event.target.value)}><option value="">All statuses</option><option value="todo">To do</option><option value="in-progress">In progress</option><option value="done">Done</option><option value="archived">Archived</option></select>
    <select aria-label="Priority" value={filters.priority ?? ''} onChange={(event) => change('priority', event.target.value)}><option value="">All priorities</option><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option></select>
    <select aria-label="Category" value={filters.categoryId ?? ''} onChange={(event) => change('categoryId', event.target.value)}><option value="">All categories</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select>
    <input aria-label="From date" type="date" value={filters.fromDate ?? ''} onChange={(event) => change('fromDate', event.target.value)} /><input aria-label="To date" type="date" value={filters.toDate ?? ''} onChange={(event) => change('toDate', event.target.value)} />
    <select aria-label="Sort" value={filters.sort ?? 'dueDate'} onChange={(event) => change('sort', event.target.value)}><option value="dueDate">Due date</option><option value="priority">Priority</option><option value="createdAt">Created</option><option value="title">Title</option></select>
    <label className="hide-archived"><input type="checkbox" checked={filters.hideArchived ?? false} onChange={(event) => onChange({ ...filters, hideArchived: event.target.checked })} />Hide archived</label></section>;
}