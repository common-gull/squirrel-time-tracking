import { Card, Input } from '@mantine/core';
import { useForm } from '@mantine/form';
import { db } from '../../database/database.ts';

export function CreateTodo() {
    const form = useForm({
        mode: 'uncontrolled',
        initialValues: {
            todo: '',
        },
    });

    async function createTodo({ todo }: typeof form.values) {
        const trimmedTodo = todo.trim();
        if (!trimmedTodo) {
            return;
        }

        await db.todos.add({ name: todo, createdOn: new Date().toISOString() });
        form.reset();
    }

    return (
        <div>
            <Card>
                Todos
                <form onSubmit={form.onSubmit((values) => createTodo(values))}>
                    <Input
                        placeholder="What do you need to get done today?"
                        key={form.key('todo')}
                        {...form.getInputProps('todo')}
                    />
                </form>
            </Card>
        </div>
    );
}
