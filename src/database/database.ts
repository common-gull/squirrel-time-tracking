import Dexie, { type EntityTable } from 'dexie';

interface Task {
    id: number;
    name: string;
    start: string;
    end?: string;
}

interface Todo {
    id: number;
    name: string;
    createdOn: string;
    completedOn?: string;
}

const db = new Dexie('SquirrelDB') as Dexie & {
    tasks: EntityTable<Task, 'id'>;
    todos: EntityTable<Todo, 'id'>;
};

db.version(1).stores({
    tasks: '++id, name, start, end',
    todos: '++id, name, completedOn, createdOn',
});

export type { Task, Todo };
export { db };
