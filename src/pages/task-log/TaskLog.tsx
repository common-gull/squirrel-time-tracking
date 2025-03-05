import { useLiveQuery } from 'dexie-react-hooks';
import { db, Task } from '../../database/database.ts';
import {
    MantineReactTable,
    type MRT_ColumnDef,
    type MRT_Row,
    useMantineReactTable,
} from 'mantine-react-table';
import { Button, Group } from '@mantine/core';
import { IconDownload } from '@tabler/icons-react';
import { isoStringToLocaleString } from '../../date/format.ts';
import { calculateDuration } from '../../date/duration.ts';
import { download } from '../../download/download.ts';
import Papa from 'papaparse';

interface FormattedTask extends Task, Record<string, string | number | undefined> {
    duration: string;
}

const columns: MRT_ColumnDef<FormattedTask>[] = [
    {
        accessorKey: 'name',
        header: 'Name',
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
        positionToolbarAlertBanner: 'bottom',
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
