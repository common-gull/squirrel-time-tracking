export function isoStringToLocaleTimeString(isoString: string) {
    return new Date(isoString).toLocaleTimeString();
}
