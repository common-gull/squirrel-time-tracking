import { Task } from '../../database/database.ts';
import { Button, Card, Group, Text } from '@mantine/core';
import { useCallback, useEffect, useState } from 'react';
import { calculateDuration, formatDuration } from '../../date/duration.ts';
import { isoStringToLocaleTimeString } from '../../date/format.ts';

interface Props {
    cancel: (task: Task) => void;
    complete: (task: Task) => void;
    task: Task;
}

export function CurrentTask({ cancel, complete, task }: Props) {
    const [duration, setDuration] = useState<string>('');

    const updateDuration = useCallback(() => {
        setDuration(formatDuration(calculateDuration(task.start)));
    }, [task.start]);

    useEffect(() => {
        updateDuration();
        const timer = setInterval(updateDuration, 1000);
        return () => {
            clearInterval(timer);
        };
    }, [updateDuration]);

    return (
        <Card p="xl" ta={'center'} withBorder mt={'sm'}>
            <Text fz="lg" tt="uppercase" fw={700} c="dimmed">
                Current Task
            </Text>
            <Text fz="mm" fw={500}>
                {task.name}
            </Text>
            <Text fz="sm" fw={500}>
                Start: {isoStringToLocaleTimeString(task.start)}
            </Text>
            <Text fz="sm" mb={'sm'} fw={500}>
                Duration: {duration}
            </Text>
            <Group justify={'center'}>
                <Button onClick={() => cancel(task)} variant={'light'}>
                    Cancel
                </Button>
                <Button onClick={() => complete(task)}>Complete</Button>
            </Group>
        </Card>
    );
}
