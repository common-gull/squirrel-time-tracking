function jsonDataToFileData(data: Record<string, unknown> | Array<unknown>) {
    return new Blob([JSON.stringify(data)], { type: 'application/json;charset=utf-8;' });
}

function csvDataToFileData(data: string) {
    return new Blob([data], { type: 'text/csv;charset=utf-8;' });
}

function createDownloadData(
    fileName: string,
    data: Record<string, unknown> | Array<unknown> | string,
) {
    if (fileName.toLowerCase().endsWith('.json') && typeof data !== 'string') {
        return jsonDataToFileData(data);
    }
    if (fileName.toLowerCase().endsWith('.csv') && typeof data === 'string') {
        return csvDataToFileData(data);
    }
    throw new Error('Unsupported File Type');
}

export function download(
    fileName: string,
    data: Record<string, unknown> | Array<unknown> | string,
) {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(createDownloadData(fileName, data));
    link.download = fileName;
    link.click();
}
