import { db, Task } from '../../database/database.ts';
import dayjs from 'dayjs';
import { calculateDuration } from '../../date/duration.ts';
import { TaskHours } from './interfaces/task-hours.ts';
import { calculateRange } from '../../date/range.ts';
import { machineDateFormat } from '../../date/format.ts';

function buildTaskHourData(
    tasks: Task[],
    dates: string[],
    groupBy: keyof Pick<Task, 'name' | 'project'>,
) {
    return tasks.reduce<TaskHours['data']>((agg, task) => {
        const date = dayjs(task.start).format(machineDateFormat);
        const key = task[groupBy] || 'No Project';

        if (!agg[key]) {
            agg[key] = {
                name: key,
                date,
                totals: {},
            };
            dates.forEach((date) => {
                agg[key].totals[date] = 0;
            });
        }

        const duration = calculateDuration(task.start, task.end);
        agg[key].totals[date] += duration.asHours();
        return agg;
    }, {});
}

export async function calculateTaskHours(
    start: Date,
    end: Date,
    groupBy: keyof Pick<Task, 'name' | 'project'>,
): Promise<TaskHours> {
    const dates = calculateRange(start, end, 'd');
    const tasks = await db.tasks
        .where('start')
        .above(dayjs(start).subtract(1, 'd').format(machineDateFormat))
        .and((task) =>
            task.end
                ? dayjs(task.end).format(machineDateFormat) <= dayjs(end).format(machineDateFormat)
                : false,
        )
        .sortBy('start');

    const data = buildTaskHourData(tasks, dates, groupBy);
    return { data, dates };
}
