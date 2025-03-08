import { useLiveQuery } from 'dexie-react-hooks';
import { db, Task } from '../../database/database.ts';
import {
    MantineReactTable,
    type MRT_ColumnDef,
    type MRT_Row,
    useMantineReactTable,
} from 'mantine-react-table';
import { Button, Group, Stack, Title } from '@mantine/core';
import { IconDownload } from '@tabler/icons-react';
import { isoStringToLocaleString } from '../../date/format.ts';
import { calculateDuration } from '../../date/duration.ts';
import { download } from '../../download/download.ts';
import Papa from 'papaparse';
import { EditTask } from '../../components/tasks/EditTask.tsx';

interface FormattedTask extends Task, Record<string, string | number | undefined> {
    duration: string;
}

const columns: MRT_ColumnDef<FormattedTask>[] = [
    {
        accessorKey: 'id',
        header: 'ID',
        enableHiding: false,
        enableEditing: false,
    },
    {
        accessorKey: 'name',
        header: 'Name',
    },
    {
        accessorKey: 'project',
        header: 'Project',
    },
    {
        accessorKey: 'start',
        header: 'Start',
    },
    {
        accessorKey: 'end',
        header: 'End',
    },
    {
        accessorKey: 'duration',
        header: 'Duration',
        enableEditing: false,
    },
];

export default function TaskLog() {
    const tasks: FormattedTask[] = useLiveQuery(
        async () => {
            const tasks = await db.tasks.toArray();
            return tasks
                .filter((task) => Boolean(task.end))
                .map((task) => ({
                    ...task,
                    start: isoStringToLocaleString(task.start),
                    end: task.end && isoStringToLocaleString(task.end),
                    duration: task.end ? calculateDuration(task.start, task.end) : '',
                }));
        },
        [],
        [],
    );

    const handleExportRows = (rows: MRT_Row<FormattedTask>[]) => {
        const rowData = rows.map((row) => row.original);
        const csv = Papa.unparse(rowData, {
            header: true,
            newline: '\n',
            skipEmptyLines: true,
        });
        download(`squirrel-export_${new Date().toISOString()}.csv`, csv);
    };

    const table = useMantineReactTable({
        columns,
        data: tasks,
        enableRowSelection: true,
        enableEditing: true,
        initialState: {
            columnVisibility: {
                id: false,
            },
        },
        positionActionsColumn: 'last',
        positionToolbarAlertBanner: 'bottom',
        mantinePaginationProps: {
            rowsPerPageOptions: ['10', '20', '50'],
            withEdges: true,
        },
        enableFilterMatchHighlighting: false,
        renderEditRowModalContent: ({ row, table }) => (
            <Stack>
                <Title order={5}>Edit Task</Title>
                <EditTask
                    close={() => table.setEditingRow(null)}
                    task={{
                        id: row.getValue('id'),
                        name: row.getValue('name'),
                        start: row.getValue('start'),
                        end: row.getValue('end'),
                        project: row.getValue('project'),
                    }}
                />
            </Stack>
        ),
        renderTopToolbarCustomActions: ({ table }) => (
            <Group>
                <Button
                    disabled={table.getPrePaginationRowModel().rows.length === 0}
                    onClick={() => handleExportRows(table.getPrePaginationRowModel().rows)}
                    leftSection={<IconDownload />}
                    variant="filled"
                >
                    Export All Rows
                </Button>
                <Button
                    disabled={table.getRowModel().rows.length === 0}
                    onClick={() => handleExportRows(table.getRowModel().rows)}
                    leftSection={<IconDownload />}
                    variant="filled"
                >
                    Export Page Rows
                </Button>
                <Button
                    disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()}
                    onClick={() => handleExportRows(table.getSelectedRowModel().rows)}
                    leftSection={<IconDownload />}
                    variant="filled"
                >
                    Export Selected Rows
                </Button>
            </Group>
        ),
    });

    return <MantineReactTable table={table} />;
}
