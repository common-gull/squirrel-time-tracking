import { Button, Card, Grid, NativeSelect, Table, Text } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import dayjs from 'dayjs';
import { useLiveQuery } from 'dexie-react-hooks';
import { Task } from '../../database/database.ts';
import { useState } from 'react';
import { calculateTaskHours } from '../../services/reports/reports.service.ts';
import { TaskHours } from '../../services/reports/interfaces/task-hours.ts';

interface Settings {
    dateRange: [Date, Date];
    groupBy: keyof Pick<Task, 'name' | 'project'>;
}

export default function Reports() {
    const [settings, setSettings] = useState<Settings>({
        dateRange: [
            dayjs().subtract(7, 'd').startOf('day').toDate(),
            dayjs().endOf('day').toDate(),
        ],
        groupBy: 'name',
    });

    const form = useForm<Settings>({
        mode: 'uncontrolled',
        initialValues: settings,
    });

    const { data, dates }: TaskHours = useLiveQuery(
        async () =>
            calculateTaskHours(settings.dateRange[0], settings.dateRange[1], settings.groupBy),
        [settings],
        { data: {}, dates: [] },
    );

    const rows = Object.values(data).map((task) => (
        <Table.Tr key={task.name}>
            <Table.Td>{task.name}</Table.Td>
            {dates.map((date) => {
                const total = task.totals[date] ?? 0;
                const fixedTotal = total.toFixed(2);
                return (
                    <Table.Td key={date}>
                        <Text c={fixedTotal === '0.00' ? 'dimmed' : ''}>{fixedTotal}</Text>
                    </Table.Td>
                );
            })}
        </Table.Tr>
    ));

    return (
        <Grid>
            <Grid.Col
                span={{ base: 12, sm: 12, md: 8, lg: 9 }}
                order={{ base: 2, sm: 2, md: 1, lg: 1 }}
            >
                <Card>
                    <Text size="lg">Daily Task Hours Breakdown</Text>
                    <Table.ScrollContainer minWidth={undefined}>
                        <Table>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th style={{ textTransform: 'capitalize' }}>
                                        {settings.groupBy}
                                    </Table.Th>
                                    {dates.map((date) => (
                                        <Table.Th key={date}>{date}</Table.Th>
                                    ))}
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>{rows}</Table.Tbody>
                        </Table>
                    </Table.ScrollContainer>
                </Card>
            </Grid.Col>
            <Grid.Col
                span={{ base: 12, sm: 12, md: 4, lg: 3 }}
                order={{ base: 1, sm: 1, md: 2, lg: 2 }}
            >
                <Card>
                    Settings
                    <form onSubmit={form.onSubmit((values) => setSettings(values))}>
                        <DatePickerInput
                            type="range"
                            dropdownType="modal"
                            allowSingleDateInRange
                            maxDate={dayjs().toDate()}
                            minDate={dayjs().subtract(6, 'month').toDate()}
                            withAsterisk
                            label="Date Range"
                            key={form.key('dateRange')}
                            {...form.getInputProps('dateRange')}
                            mb={'sm'}
                        />
                        <NativeSelect
                            label="Group By"
                            data={[
                                { label: 'Name', value: 'name' },
                                { label: 'Project', value: 'project' },
                            ]}
                            key={form.key('groupBy')}
                            {...form.getInputProps('groupBy')}
                            mb={'sm'}
                        />
                        <Button type={'submit'}>Update</Button>
                    </form>
                </Card>
            </Grid.Col>
        </Grid>
    );
}
