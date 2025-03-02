import { Card, SimpleGrid, Text } from '@mantine/core';
import { db, Task, Todo } from '../../database/database';
import { CurrentTask } from '../../components/tasks/CurrentTask.tsx';
import { TaskList } from '../../components/tasks/TaskList.tsx';
import { useLiveQuery } from 'dexie-react-hooks';
import dayjs from 'dayjs';
import { CreateTodo } from '../../components/todos/CreateTodo.tsx';
import { CreateTask } from '../../components/tasks/CreateTask.tsx';
import { useEffect, useState } from 'react';
import { TodoList } from '../../components/todos/TodoList.tsx';

export default function Today() {
    const today = dayjs().format('YYYY-MM-DD');
    const tasks =
        useLiveQuery(() => db.tasks.where('start').aboveOrEqual(today).sortBy('start')) || [];
    const todos =
        useLiveQuery(() => db.todos.where('createdOn').aboveOrEqual(today).sortBy('createdOn')) ||
        [];
    const completedTasks = tasks.filter((task) => task.end !== undefined);
    const incompleteTask = tasks.filter((task) => task.end === undefined).pop();
    const [currentTask, setCurrentTask] = useState<Task>();

    async function cancelTask(task: Task) {
        await db.tasks.delete(task.id);
        setCurrentTask(undefined);
    }

    async function completeIncompleteTask() {
        if (incompleteTask) {
            await db.tasks.update(incompleteTask.id, { end: new Date().toISOString() });
        }
    }

    async function markCurrentTaskComplete() {
        await completeIncompleteTask();
        setCurrentTask(undefined);
    }

    async function handleTaskCreated(task: Task) {
        await completeIncompleteTask();
        setCurrentTask(task);
    }

    async function handleTodoStart(todo: Todo) {
        if (todo.name === currentTask?.name) {
            return;
        }
        const newTask = {
            name: todo.name,
            start: new Date().toISOString(),
        };
        const id = await db.tasks.add(newTask);
        await handleTaskCreated({ id, ...newTask });
    }

    useEffect(() => {
        if (incompleteTask) {
            setCurrentTask(incompleteTask);
        }
    }, [incompleteTask]);

    return (
        <div>
            <SimpleGrid cols={{ base: 1, sm: 1, lg: 2 }}>
                <div>
                    <Card>
                        <Text fw={500} size={'xl'}>
                            Todos
                        </Text>
                        <CreateTodo />
                        <TodoList onTodoStart={handleTodoStart} todos={todos} />
                    </Card>
                </div>

                <div>
                    <Card>
                        <Text fw={500} size={'xl'}>
                            Tasks
                        </Text>
                        <CreateTask onTaskCreated={handleTaskCreated} />
                        {currentTask && (
                            <CurrentTask
                                cancel={cancelTask}
                                complete={markCurrentTaskComplete}
                                task={currentTask}
                            />
                        )}
                        <TaskList tasks={completedTasks} />
                    </Card>
                </div>
            </SimpleGrid>
        </div>
    );
}
