import dayjs from 'dayjs';
import duration, { Duration } from 'dayjs/plugin/duration';
dayjs.extend(duration);

export function calculateDuration(startDate: string, endDate?: string) {
    const start = dayjs(startDate);
    const end = dayjs(endDate);

    const diff = end.diff(start);
    return dayjs.duration(diff);
}

export function formatDuration(duration: Duration) {
    const hours = String(duration.hours()).padStart(2, '0');
    const minutes = String(duration.minutes()).padStart(2, '0');
    const seconds = String(duration.seconds()).padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
}
