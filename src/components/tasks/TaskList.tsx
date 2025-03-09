import { Text, Modal, Timeline, Anchor, Card } from '@mantine/core';
import { calculateDuration, formatDuration } from '../../date/duration.ts';
import { useDisclosure } from '@mantine/hooks';
import { Task } from '../../database/database.ts';
import { useState } from 'react';
import { IconCheck } from '@tabler/icons-react';
import { EditTask } from './EditTask.tsx';

interface Props {
    tasks: Task[];
}

export function TaskList({ tasks }: Props) {
    const [opened, { open, close }] = useDisclosure(false, { onClose: handleClose });
    const [currentTask, setCurrentTask] = useState<Task>();

    function openTask(task: Task) {
        setCurrentTask(task);
        open();
    }

    function handleClose() {
        setCurrentTask(undefined);
    }

    if (!tasks.length) {
        return null;
    }

    return (
        <Card style={{ overflowX: 'hidden' }} withBorder mt={'sm'}>
            <Text size={'l'}>Completed</Text>

            <Modal opened={opened} onClose={close} title={'Edit Task'}>
                {currentTask && <EditTask close={close} task={currentTask} />}
            </Modal>

            <Timeline active={tasks.length} bulletSize={36} m={'xl'}>
                {tasks.map((task) => {
                    const start = new Date(task.start);
                    const end = new Date(task.end || task.start);

                    return (
                        <Timeline.Item
                            key={task.id}
                            title={
                                <Anchor onClick={() => openTask(task)}>
                                    <Text size={'xl'}>{task.name}</Text>
                                </Anchor>
                            }
                            bullet={<IconCheck size={20} />}
                        >
                            <Text c="dimmed" size="lg">
                                Start: {start.toLocaleTimeString()}
                            </Text>
                            <Text c="dimmed" size="lg">
                                End: {end.toLocaleTimeString()}
                            </Text>
                            <Text size="xs" mt={4}>
                                Duration: {formatDuration(calculateDuration(task.start, task.end))}
                            </Text>
                        </Timeline.Item>
                    );
                })}
            </Timeline>
        </Card>
    );
}
