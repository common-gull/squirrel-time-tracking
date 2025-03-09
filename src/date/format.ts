export const timePickerFormat = 'M/D/YYYY h:mm:ss A';
export const machineDateFormat = 'YYYY-MM-DD';

export function isoStringToLocaleTimeString(isoString: string) {
    return new Date(isoString).toLocaleTimeString();
}

export function isoStringToLocaleString(isoString: string) {
    return new Date(isoString).toLocaleString();
}
