import { db } from '../../database/database';
import { download } from '../../download/download';
import { encryptBackupData, createEncryptedBackupFormat } from './encryption/crypto.service';
import type { BackupData, BackupType } from './encryption/types';

export async function collectBackupData(): Promise<BackupData> {
    const settings = await db.settings.toArray();
    const tasks = await db.tasks.toArray();
    const todos = await db.todos.toArray();

    return { settings, tasks, todos };
}

export async function createPlainTextBackup(): Promise<void> {
    const data = await collectBackupData();
    const fileName = `squirrel-backup_${new Date().toISOString()}.json`;
    download(fileName, data as unknown as Record<string, unknown>);
}

export async function createEncryptedBackup(password: string): Promise<void> {
    try {
        const data = await collectBackupData();
        const encryptionResult = await encryptBackupData(data, password);
        const encryptedBackupFormat = createEncryptedBackupFormat(encryptionResult);

        const fileName = `squirrel-encrypted-backup_${new Date().toISOString()}.json`;
        download(fileName, encryptedBackupFormat as unknown as Record<string, unknown>);
    } catch {
        throw new Error('Failed to create encrypted backup');
    }
}

export async function createBackup(type: BackupType, password?: string): Promise<void> {
    if (type === 'encrypted') {
        if (!password) {
            throw new Error('Password is required for encrypted backup');
        }
        await createEncryptedBackup(password);
    } else {
        await createPlainTextBackup();
    }
}

export async function restoreBackupData(data: BackupData): Promise<void> {
    await db.tasks.clear();
    await db.todos.clear();
    await db.settings.clear();

    await db.settings.bulkAdd(Array.isArray(data.settings) ? data.settings : []);
    await db.tasks.bulkAdd(data.tasks);
    await db.todos.bulkAdd(data.todos);
}
