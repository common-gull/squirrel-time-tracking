import { describe, it, expect } from 'vitest';
import {
    encryptBackupData,
    decryptBackupData,
    createEncryptedBackupFormat,
} from './crypto.service';
import type { BackupData, EncryptedBackupFormat } from './types';

const mockBackupData: BackupData = {
    tasks: [
        {
            id: 1,
            name: 'Test Task',
            project: 'Test Project',
            start: '2023-01-01T10:00:00Z',
            end: '2023-01-01T11:00:00Z',
        },
    ],
    todos: [
        {
            id: 1,
            name: 'Test Todo',
            project: 'Test Project',
            createdOn: '2023-01-01T10:00:00Z',
        },
    ],
    settings: [
        {
            id: 'backupOnClose',
            value: true,
        },
    ],
};

describe('encryptBackupData', () => {
    it('should encrypt backup data with valid password', async () => {
        const password = 'TestPassword123!';
        const result = await encryptBackupData(mockBackupData, password);

        expect(result).toBeDefined();
        expect(result.encryptedData).toBeDefined();
        expect(result.salt).toBeDefined();
        expect(result.iv).toBeDefined();
        expect(result.authTag).toBeDefined();
        expect(typeof result.encryptedData).toBe('string');
        expect(typeof result.salt).toBe('string');
        expect(typeof result.iv).toBe('string');
        expect(typeof result.authTag).toBe('string');
    });

    it('should produce different results for same input due to random salt/IV', async () => {
        const password = 'TestPassword123!';
        const result1 = await encryptBackupData(mockBackupData, password);
        const result2 = await encryptBackupData(mockBackupData, password);

        expect(result1.encryptedData).not.toBe(result2.encryptedData);
        expect(result1.salt).not.toBe(result2.salt);
        expect(result1.iv).not.toBe(result2.iv);
        expect(result1.authTag).not.toBe(result2.authTag);
    });

    it('should work with various password lengths', async () => {
        const passwords = [
            'short123',
            'mediumLength456!',
            'VeryLongPasswordWithSpecialCharacters789!@#$%^&*()',
            'SimplePassword',
        ];

        for (const password of passwords) {
            const result = await encryptBackupData(mockBackupData, password);
            expect(result).toBeDefined();
            expect(result.encryptedData).toBeDefined();
            expect(result.salt).toBeDefined();
            expect(result.iv).toBeDefined();
            expect(result.authTag).toBeDefined();
        }
    });

    it('should handle empty backup data', async () => {
        const emptyData: BackupData = {
            tasks: [],
            todos: [],
            settings: [],
        };
        const password = 'TestPassword123!';
        const result = await encryptBackupData(emptyData, password);

        expect(result).toBeDefined();
        expect(result.encryptedData).toBeDefined();
    });

    it('should handle special characters in passwords', async () => {
        const specialPasswords = ['Test!@#$%^&*()', 'Test"\'\\|`~', 'Test[]{};:,.<>?/', 'Test+=_-'];

        for (const password of specialPasswords) {
            const result = await encryptBackupData(mockBackupData, password);
            expect(result).toBeDefined();
            expect(result.encryptedData).toBeDefined();
        }
    });
});

describe('decryptBackupData', () => {
    it('should decrypt data encrypted with correct password', async () => {
        const password = 'TestPassword123!';
        const encrypted = await encryptBackupData(mockBackupData, password);

        const decrypted = await decryptBackupData({
            encryptedData: encrypted.encryptedData,
            salt: encrypted.salt,
            iv: encrypted.iv,
            authTag: encrypted.authTag,
            password,
        });

        expect(decrypted).toEqual(mockBackupData);
    });

    it('should fail with incorrect password', async () => {
        const password = 'TestPassword123!';
        const wrongPassword = 'WrongPassword456!';
        const encrypted = await encryptBackupData(mockBackupData, password);

        await expect(
            decryptBackupData({
                encryptedData: encrypted.encryptedData,
                salt: encrypted.salt,
                iv: encrypted.iv,
                authTag: encrypted.authTag,
                password: wrongPassword,
            }),
        ).rejects.toThrow('Decryption failed');
    });

    it('should fail with corrupted encrypted data', async () => {
        const password = 'TestPassword123!';
        const encrypted = await encryptBackupData(mockBackupData, password);

        // Corrupt the encrypted data
        const corruptedData = encrypted.encryptedData.slice(0, -10) + 'corrupted';

        await expect(
            decryptBackupData({
                encryptedData: corruptedData,
                salt: encrypted.salt,
                iv: encrypted.iv,
                authTag: encrypted.authTag,
                password,
            }),
        ).rejects.toThrow('Decryption failed');
    });

    it('should fail with corrupted salt', async () => {
        const password = 'TestPassword123!';
        const encrypted = await encryptBackupData(mockBackupData, password);

        await expect(
            decryptBackupData({
                encryptedData: encrypted.encryptedData,
                salt: 'corruptedSalt',
                iv: encrypted.iv,
                authTag: encrypted.authTag,
                password,
            }),
        ).rejects.toThrow('Decryption failed');
    });

    it('should fail with corrupted IV', async () => {
        const password = 'TestPassword123!';
        const encrypted = await encryptBackupData(mockBackupData, password);

        await expect(
            decryptBackupData({
                encryptedData: encrypted.encryptedData,
                salt: encrypted.salt,
                iv: 'corruptedIV',
                authTag: encrypted.authTag,
                password,
            }),
        ).rejects.toThrow('Decryption failed');
    });

    it('should fail with corrupted auth tag', async () => {
        const password = 'TestPassword123!';
        const encrypted = await encryptBackupData(mockBackupData, password);

        await expect(
            decryptBackupData({
                encryptedData: encrypted.encryptedData,
                salt: encrypted.salt,
                iv: encrypted.iv,
                authTag: 'corruptedAuthTag',
                password,
            }),
        ).rejects.toThrow('Decryption failed');
    });

    it('should handle large backup data', async () => {
        // Create large backup data
        const largeBackupData: BackupData = {
            tasks: Array.from({ length: 1000 }, (_, i) => ({
                id: i + 1,
                name: `Task ${i + 1}`,
                project: `Project ${i % 10}`,
                start: '2023-01-01T10:00:00Z',
                end: '2023-01-01T11:00:00Z',
            })),
            todos: Array.from({ length: 500 }, (_, i) => ({
                id: i + 1,
                name: `Todo ${i + 1}`,
                project: `Project ${i % 5}`,
                createdOn: '2023-01-01T10:00:00Z',
                ...(i % 3 === 0 ? { completedOn: '2023-01-01T12:00:00Z' } : {}),
            })),
            settings: [
                { id: 'backupOnClose', value: true },
                { id: 'theme', value: 'dark' },
                { id: 'language', value: 'en' },
            ],
        };

        const password = 'TestPassword123!';
        const encrypted = await encryptBackupData(largeBackupData, password);
        const decrypted = await decryptBackupData({
            encryptedData: encrypted.encryptedData,
            salt: encrypted.salt,
            iv: encrypted.iv,
            authTag: encrypted.authTag,
            password,
        });

        expect(decrypted).toEqual(largeBackupData);
    });
});

describe('createEncryptedBackupFormat', () => {
    it('should create properly formatted encrypted backup structure', async () => {
        const password = 'TestPassword123!';
        const encrypted = await encryptBackupData(mockBackupData, password);
        const backupFormat = createEncryptedBackupFormat(encrypted);

        expect(backupFormat).toHaveProperty('format', 'squirrel-encrypted-backup');
        expect(backupFormat).toHaveProperty('version', '1.0');
        expect(backupFormat).toHaveProperty('metadata');
        expect(backupFormat).toHaveProperty('crypto');
        expect(backupFormat).toHaveProperty('data');

        // Check metadata structure
        const metadata = (backupFormat as EncryptedBackupFormat).metadata;
        expect(metadata).toHaveProperty('created');
        expect(metadata).toHaveProperty('appVersion');
        expect(metadata).toHaveProperty('encryption');
        expect(metadata.encryption).toHaveProperty('algorithm', 'AES-256-GCM');
        expect(metadata.encryption).toHaveProperty('keyDerivation');

        // Check crypto structure
        const crypto = (backupFormat as EncryptedBackupFormat).crypto;
        expect(crypto).toHaveProperty('salt', encrypted.salt);
        expect(crypto).toHaveProperty('iv', encrypted.iv);
        expect(crypto).toHaveProperty('authTag', encrypted.authTag);

        // Check data
        expect((backupFormat as EncryptedBackupFormat).data).toBe(encrypted.encryptedData);
    });

    it('should include proper encryption parameters in metadata', async () => {
        const password = 'TestPassword123!';
        const encrypted = await encryptBackupData(mockBackupData, password);
        const backupFormat = createEncryptedBackupFormat(encrypted);

        const keyDerivation = (backupFormat as EncryptedBackupFormat).metadata.encryption
            .keyDerivation;
        expect(keyDerivation).toHaveProperty('algorithm', 'PBKDF2');
        expect(keyDerivation).toHaveProperty('iterations', 100000);
        expect(keyDerivation).toHaveProperty('hash', 'SHA-256');
        expect(keyDerivation).toHaveProperty('saltLength', 32);
        expect(keyDerivation).toHaveProperty('keyLength', 32);
    });
});
