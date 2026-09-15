# Taskboard

Taskboard is a small task management web application.

This is a university demo version made as part of a learning project.

## Features

- User registration and sign in.
- Tasks can be created, edited, completed, archived, and deleted.
- Tasks are split into active, completed, and archived sections.
- Search, filters, date range filters, sorting, and an option to hide archived tasks.
- Task statistics: completed percent, overdue tasks, open tasks, and average completion time.
- Categories can be created, edited, and deleted.
- A category with active tasks cannot be deleted.
- A category with only archived tasks can be deleted. Archived tasks keep their old category ID.

## Technology

- React
- TypeScript with strict mode
- Vite
- IndexedDB for browser storage
- Jest and React Testing Library

## Run the Project

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Run tests:

```bash
npm test
```

Build the project:

```bash
npm run build
```

## Data Storage

All data is stored in the browser. Users, tasks, and categories are saved in IndexedDB. The user session is saved in localStorage.