export interface EncryptedBackupFormat {
    format: 'squirrel-encrypted-backup';
    version: string;
    metadata: {
        created: string;
        appVersion: string;
        encryption: {
            algorithm: string;
            keyDerivation: {
                algorithm: string;
                iterations: number;
                hash: string;
                saltLength: number;
                keyLength: number;
            };
        };
    };
    crypto: {
        salt: string;
        iv: string;
        authTag: string;
    };
    data: string;
}

export interface BackupData {
    settings: Array<{ id: string; value: boolean | string | number }>;
    tasks: Array<{
        id: number;
        name: string;
        start: string;
        end?: string;
        project?: string;
    }>;
    todos: Array<{
        id: number;
        name: string;
        createdOn: string;
        completedOn?: string;
        project?: string;
    }>;
}

export interface EncryptionResult {
    encryptedData: string;
    salt: string;
    iv: string;
    authTag: string;
}

export interface DecryptionOptions {
    encryptedData: string;
    salt: string;
    iv: string;
    authTag: string;
    password: string;
}

export type BackupType = 'plain' | 'encrypted';
