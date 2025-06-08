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
    project?: string;
}

interface Setting {
    id: string;
    value: boolean | string | number;
}

const db = new Dexie('SquirrelDB') as Dexie & {
    tasks: EntityTable<Task, 'id'>;
    todos: EntityTable<Todo, 'id'>;
    settings: EntityTable<Setting, 'id'>;
};

db.version(1).stores({
    tasks: '++id, name, start, end, project',
    todos: '++id, name, completedOn, createdOn, project',
});

db.version(2).stores({
    tasks: '++id, name, start, end, project',
    todos: '++id, name, completedOn, createdOn, project',
    settings: 'id',
});

export type { Task, Todo, Setting };
export { db };
