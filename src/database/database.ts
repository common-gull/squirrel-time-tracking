import Dexie, { type EntityTable } from 'dexie';

interface Task {
    end?: string;
    id: number;
    name: string;
    project?: string;
    start: string;
}

interface Todo {
    completedOn?: string;
    createdOn: string;
    id: number;
    name: string;
}

const db = new Dexie('SquirrelDB') as Dexie & {
    tasks: EntityTable<Task, 'id'>;
    todos: EntityTable<Todo, 'id'>;
};

db.version(1).stores({
    tasks: '++id, name, start, end, project',
    todos: '++id, name, completedOn, createdOn',
});

export type { Task, Todo };
export { db };
