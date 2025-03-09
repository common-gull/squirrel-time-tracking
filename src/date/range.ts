import dayjs, { Dayjs } from 'dayjs';
import { machineDateFormat } from './format.ts';

function* range(start: Dayjs, end: Dayjs, unit: 'd') {
    let day = start.clone().startOf(unit).subtract(1, unit);
    end = end.subtract(1, unit);
    while (day <= end) {
        day = day.add(1, unit);
        yield day.format(machineDateFormat);
    }
}

export function calculateRange(start: Date, end: Date, unit: 'd') {
    return Array.from(range(dayjs(start), dayjs(end), unit));
}
