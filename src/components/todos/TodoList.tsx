import { Text, Card, ActionIcon, Group } from '@mantine/core';
import { db, Todo } from '../../database/database.ts';
import { IconCheck, IconPlayerPlay, IconTrash } from '@tabler/icons-react';

interface Props {
    onTodoStart: (todo: Todo) => void;
    todos: Todo[];
}

export function TodoList({ onTodoStart, todos }: Props) {
    if (!todos.length) {
        return null;
    }

    async function completeTodo(todo: Todo) {
        await db.todos.update(todo.id, {
            completedOn: new Date().toISOString(),
        });
    }

    async function deleteTodo(todo: Todo) {
        await db.todos.delete(todo.id);
    }

    return (
        <>
            {todos.map((todo) => {
                const isComplete = Boolean(todo.completedOn);
                return (
                    <Card mt={'sm'} key={todo.id} withBorder>
                        <Group justify={'space-between'}>
                            <Text
                                size={'xl'}
                                style={{ textDecoration: isComplete ? 'line-through' : '' }}
                            >
                                {todo.name}
                            </Text>
                            <Group justify={'flex-end'}>
                                {!isComplete && (
                                    <>
                                        <ActionIcon
                                            variant="filled"
                                            aria-label="Start"
                                            onClick={() => onTodoStart(todo)}
                                        >
                                            <IconPlayerPlay
                                                style={{ width: '70%', height: '70%' }}
                                                stroke={1.5}
                                            />
                                        </ActionIcon>

                                        <ActionIcon
                                            variant="filled"
                                            aria-label="Complete"
                                            onClick={() => completeTodo(todo)}
                                        >
                                            <IconCheck
                                                style={{ width: '70%', height: '70%' }}
                                                stroke={1.5}
                                            />
                                        </ActionIcon>
                                    </>
                                )}

                                <ActionIcon
                                    variant="filled"
                                    color={'red'}
                                    aria-label="Delete"
                                    onClick={() => deleteTodo(todo)}
                                >
                                    <IconTrash
                                        style={{ width: '70%', height: '70%' }}
                                        stroke={1.5}
                                    />
                                </ActionIcon>
                            </Group>
                        </Group>
                    </Card>
                );
            })}
        </>
    );
}
