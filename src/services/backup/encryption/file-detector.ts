import type { EncryptedBackupFormat, BackupData } from './types';

export function isEncryptedBackup(fileContent: string): boolean {
    try {
        const parsed = JSON.parse(fileContent);
        return parsed.format === 'squirrel-encrypted-backup';
    } catch {
        return false;
    }
}

export function validateEncryptedBackupFormat(fileContent: string): EncryptedBackupFormat {
    try {
        const parsed = JSON.parse(fileContent);

        if (parsed.format !== 'squirrel-encrypted-backup') {
            throw new Error('Invalid format');
        }

        if (!parsed.version || !parsed.metadata || !parsed.crypto || !parsed.data) {
            throw new Error('Missing required fields');
        }

        if (!parsed.crypto.salt || !parsed.crypto.iv || !parsed.crypto.authTag) {
            throw new Error('Missing crypto fields');
        }

        return parsed as EncryptedBackupFormat;
    } catch {
        throw new Error('Invalid encrypted backup format');
    }
}

export function validatePlainTextBackup(fileContent: string): BackupData {
    try {
        const parsed = JSON.parse(fileContent);

        if (!parsed.tasks || !Array.isArray(parsed.tasks)) {
            throw new Error('Invalid backup format: missing tasks array');
        }

        if (!parsed.todos || !Array.isArray(parsed.todos)) {
            throw new Error('Invalid backup format: missing todos array');
        }

        if (parsed.settings === undefined) {
            throw new Error('Invalid backup format: missing settings');
        }

        let settings = parsed.settings;
        if (!Array.isArray(settings)) {
            settings = Object.entries(settings).map(([id, value]) => ({ id, value }));
        }

        return {
            ...parsed,
            settings,
        } as BackupData;
    } catch {
        throw new Error('Invalid plain-text backup format');
    }
}

export function detectAndValidateBackupFile(fileContent: string): {
    type: 'encrypted' | 'plain';
    data: EncryptedBackupFormat | BackupData;
} {
    if (isEncryptedBackup(fileContent)) {
        return {
            type: 'encrypted',
            data: validateEncryptedBackupFormat(fileContent),
        };
    } else {
        return {
            type: 'plain',
            data: validatePlainTextBackup(fileContent),
        };
    }
}
