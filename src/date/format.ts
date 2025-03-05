export function isoStringToLocaleTimeString(isoString: string) {
    return new Date(isoString).toLocaleTimeString();
}

export function isoStringToLocaleString(isoString: string) {
    return new Date(isoString).toLocaleString();
}
