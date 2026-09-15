import { createContext, useContext, useEffect, useReducer, useState, type PropsWithChildren } from 'react';
import type { Category, Task, TaskStatus } from '../domain/models';
import type { TaskDraft } from '../domain/taskLogic';
import { IndexedDbTaskRepository } from '../data/TaskRepository';
import { TaskService } from '../data/TaskService';

interface TaskState { tasks: Task[]; categories: Category[]; loading: boolean; error: string | null; }
type Action = { type: 'loaded'; tasks: Task[]; categories: Category[] } | { type: 'error'; message: string } | { type: 'taskSaved'; task: Task } | { type: 'taskDeleted'; id: string };
const initialState: TaskState = { tasks: [], categories: [], loading: true, error: null };
const defaultCategories: Category[] = [{ id: 'work', name: 'Work', color: '#157a6e' }, { id: 'personal', name: 'Personal', color: '#d35d3f' }];

function reducer(state: TaskState, action: Action): TaskState {
  if (action.type === 'loaded') return { tasks: action.tasks, categories: action.categories, loading: false, error: null };
  if (action.type === 'error') return { ...state, loading: false, error: action.message };
  if (action.type === 'taskSaved') return { ...state, tasks: [...state.tasks.filter((task) => task.id !== action.task.id), action.task], error: null };
  return { ...state, tasks: state.tasks.filter((task) => task.id !== action.id), error: null };
}

interface TasksContextValue extends TaskState {
  createTask(draft: TaskDraft): Promise<void>;
  updateTask(id: string, changes: Partial<TaskDraft>): Promise<void>;
  deleteTask(id: string): Promise<void>;
  setStatus(id: string, status: TaskStatus): Promise<void>;
  createCategory(name: string, color?: string): Promise<void>;
  updateCategory(id: string, name: string, color?: string): Promise<void>;
  deleteCategory(id: string): Promise<void>;
}
const TasksContext = createContext<TasksContextValue | null>(null);

export function TaskProvider({ children, service, storageName }: PropsWithChildren<{ service?: TaskService; storageName?: string }>) {
  const [taskService] = useState(() => service ?? new TaskService(new IndexedDbTaskRepository(storageName)));
  const [state, dispatch] = useReducer(reducer, initialState);
  const refresh = async (): Promise<void> => {
    try {
      let categories = await taskService.getCategories();
      if (categories.length === 0) {
        await Promise.all(defaultCategories.map((category) => taskService.addCategory(category)));
        categories = defaultCategories;
      }
      dispatch({ type: 'loaded', tasks: await taskService.getTasks(), categories });
    } catch (error) { dispatch({ type: 'error', message: error instanceof Error ? error.message : 'Unable to load tasks.' }); }
  };
  useEffect(() => { void refresh(); }, [taskService]);
  const run = async (operation: () => Promise<Task | Category | void>): Promise<void> => {
    try {
      const result = await operation();
      if (result && 'status' in result) dispatch({ type: 'taskSaved', task: result });
      const [tasks, categories] = await Promise.all([taskService.getTasks(), taskService.getCategories()]);
      dispatch({ type: 'loaded', tasks, categories });
    } catch (error) { dispatch({ type: 'error', message: error instanceof Error ? error.message : 'Task operation failed.' }); }
  };
  return <TasksContext.Provider value={{ ...state, createTask: (draft) => run(() => taskService.create(draft)), updateTask: (id, changes) => run(() => taskService.update(id, changes)), deleteTask: (id) => run(() => taskService.delete(id)), setStatus: (id, status) => run(() => taskService.updateStatus(id, status)), createCategory: (name, color) => run(() => taskService.createCategory(name, color)), updateCategory: (id, name, color) => run(() => taskService.updateCategory(id, name, color)), deleteCategory: (id) => run(() => taskService.deleteCategory(id)) }}>{children}</TasksContext.Provider>;
}

export function useTasks(): TasksContextValue {
  const context = useContext(TasksContext);
  if (!context) throw new Error('useTasks must be used inside TaskProvider.');
  return context;
}