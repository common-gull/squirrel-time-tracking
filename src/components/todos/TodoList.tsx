import { Text, Card, ActionIcon, Group, Grid } from '@mantine/core';
import { db, Todo } from '../../database/database.ts';
import { IconPlayerPlay, IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

interface Props {
    onTodoStart: (todo: Todo) => void;
    todos: Todo[];
}

export function TodoList({ onTodoStart, todos }: Props) {
    const { t } = useTranslation();

    if (!todos.length) {
        return null;
    }

    async function deleteTodo(todo: Todo) {
        await db.todos.delete(todo.id);
    }

    return (
        <Card withBorder mt={'sm'}>
            <Grid align={'center'} grow>
                {todos.map((todo) => {
                    const isComplete = Boolean(todo.completedOn);
                    return (
                        <Grid.Col span={'content'} key={todo.id}>
                            <Card withBorder>
                                <Group justify={'space-between'}>
                                    <div>
                                        <Text size={'l'}>{todo.name}</Text>
                                        {todo.project && (
                                            <Text c="dimmed" size={'sm'}>
                                                {todo.project}
                                            </Text>
                                        )}
                                    </div>

                                    <Group justify={'flex-end'}>
                                        {!isComplete && (
                                            <>
                                                <ActionIcon
                                                    variant="filled"
                                                    aria-label={t('todos.startTask')}
                                                    onClick={() => onTodoStart(todo)}
                                                >
                                                    <IconPlayerPlay
                                                        style={{ width: '70%', height: '70%' }}
                                                        stroke={1.5}
                                                    />
                                                </ActionIcon>
                                            </>
                                        )}

                                        <ActionIcon
                                            variant="filled"
                                            color={'red'}
                                            aria-label={t('common.delete')}
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
                        </Grid.Col>
                    );
                })}
            </Grid>
        </Card>
    );
}
