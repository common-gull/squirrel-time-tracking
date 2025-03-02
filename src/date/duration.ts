import { intervalToDuration } from 'date-fns';

function formatDurationUnit(unit?: number) {
    return (unit || 0).toString().padStart(2, '0');
}

export function getDurationString(start: Date, end: Date) {
    const { hours, minutes, seconds } = intervalToDuration({ start, end });
    return `${formatDurationUnit(hours)}:${formatDurationUnit(minutes)}:${formatDurationUnit(seconds)}`;
}
