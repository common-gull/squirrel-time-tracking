import { describe, it, expect } from 'vitest';
import { detectAndValidateBackupFile } from './file-detector';
import { encryptBackupData, createEncryptedBackupFormat } from './crypto.service';
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

describe('detectAndValidateBackupFile', () => {
    describe('Plain-text backup detection', () => {
        it('should detect plain-text backup with standard format', () => {
            const plainBackup = JSON.stringify(mockBackupData);
            const result = detectAndValidateBackupFile(plainBackup);

            expect(result.type).toBe('plain');
            expect(result.data).toEqual(mockBackupData);
        });

        it('should detect plain-text backup with minimal data', () => {
            const minimalData: BackupData = {
                tasks: [],
                todos: [],
                settings: [],
            };
            const plainBackup = JSON.stringify(minimalData);
            const result = detectAndValidateBackupFile(plainBackup);

            expect(result.type).toBe('plain');
            expect(result.data).toEqual(minimalData);
        });

        it('should detect plain-text backup with extra properties', () => {
            const dataWithExtra = {
                ...mockBackupData,
                extraProperty: 'should be ignored',
            };
            const plainBackup = JSON.stringify(dataWithExtra);
            const result = detectAndValidateBackupFile(plainBackup);

            expect(result.type).toBe('plain');
            expect(result.data).toEqual(expect.objectContaining(mockBackupData));
            expect((result.data as BackupData & { extraProperty: string }).extraProperty).toBe(
                'should be ignored',
            );
        });
    });

    describe('Encrypted backup detection', () => {
        it('should detect encrypted backup with proper format', async () => {
            const password = 'TestPassword123!';
            const encrypted = await encryptBackupData(mockBackupData, password);
            const encryptedBackup = createEncryptedBackupFormat(encrypted);
            const fileContent = JSON.stringify(encryptedBackup);

            const result = detectAndValidateBackupFile(fileContent);

            expect(result.type).toBe('encrypted');
            expect(result.data).toHaveProperty('format', 'squirrel-encrypted-backup');
            expect(result.data).toHaveProperty('version', '1.0');
            expect(result.data).toHaveProperty('metadata');
            expect(result.data).toHaveProperty('crypto');
            expect(result.data).toHaveProperty('data');
        });

        it('should detect encrypted backup with different version', async () => {
            const password = 'TestPassword123!';
            const encrypted = await encryptBackupData(mockBackupData, password);
            const encryptedBackup = createEncryptedBackupFormat(encrypted);

            // Modify version
            (encryptedBackup as EncryptedBackupFormat).version = '2.0';
            const fileContent = JSON.stringify(encryptedBackup);

            const result = detectAndValidateBackupFile(fileContent);

            expect(result.type).toBe('encrypted');
            expect(result.data).toHaveProperty('version', '2.0');
        });
    });

    describe('Invalid file detection', () => {
        it('should throw error for invalid JSON', () => {
            const invalidJson = 'not valid json {';

            expect(() => detectAndValidateBackupFile(invalidJson)).toThrow();
        });

        it('should throw error for empty string', () => {
            expect(() => detectAndValidateBackupFile('')).toThrow();
        });

        it('should throw error for null content', () => {
            expect(() => detectAndValidateBackupFile('null')).toThrow();
        });

        it('should throw error for non-object content', () => {
            expect(() => detectAndValidateBackupFile('"just a string"')).toThrow();
            expect(() => detectAndValidateBackupFile('123')).toThrow();
            expect(() => detectAndValidateBackupFile('true')).toThrow();
            expect(() => detectAndValidateBackupFile('[]')).toThrow();
        });

        it('should throw error for object without required properties', () => {
            const invalidData = { someProperty: 'value' };
            expect(() => detectAndValidateBackupFile(JSON.stringify(invalidData))).toThrow();
        });

        it('should throw error for encrypted backup missing required fields', () => {
            const incompleteEncrypted = {
                format: 'squirrel-encrypted-backup',
                // missing version, metadata, crypto, data
            };
            expect(() =>
                detectAndValidateBackupFile(JSON.stringify(incompleteEncrypted)),
            ).toThrow();
        });

        it('should throw error for encrypted backup with wrong format', () => {
            const wrongFormat = {
                format: 'wrong-format',
                version: '1.0',
                metadata: {},
                crypto: {},
                data: '',
            };
            expect(() => detectAndValidateBackupFile(JSON.stringify(wrongFormat))).toThrow();
        });

        it('should throw error for plain backup missing tasks array', () => {
            const missingTasks = {
                todos: [],
                settings: [],
            };
            expect(() => detectAndValidateBackupFile(JSON.stringify(missingTasks))).toThrow();
        });

        it('should throw error for plain backup missing todos array', () => {
            const missingTodos = {
                tasks: [],
                settings: [],
            };
            expect(() => detectAndValidateBackupFile(JSON.stringify(missingTodos))).toThrow();
        });

        it('should throw error for plain backup missing settings array', () => {
            const missingSettings = {
                tasks: [],
                todos: [],
            };
            expect(() => detectAndValidateBackupFile(JSON.stringify(missingSettings))).toThrow();
        });

        it('should throw error for plain backup with non-array properties', () => {
            const nonArrays = {
                tasks: 'not an array',
                todos: [],
                settings: [],
            };
            expect(() => detectAndValidateBackupFile(JSON.stringify(nonArrays))).toThrow();
        });
    });

    describe('Corrupted file detection', () => {
        it('should throw error for corrupted encrypted backup', async () => {
            const password = 'TestPassword123!';
            const encrypted = await encryptBackupData(mockBackupData, password);
            const encryptedBackup = createEncryptedBackupFormat(encrypted);
            let fileContent = JSON.stringify(encryptedBackup);

            // Corrupt the JSON by removing some characters
            fileContent = fileContent.slice(0, -50) + 'corrupted';

            expect(() => detectAndValidateBackupFile(fileContent)).toThrow();
        });

        it('should throw error for encrypted backup with corrupted metadata', async () => {
            const password = 'TestPassword123!';
            const encrypted = await encryptBackupData(mockBackupData, password);
            const encryptedBackup = createEncryptedBackupFormat(encrypted);

            // @ts-expect-error - removing metadata for testing
            delete (encryptedBackup as EncryptedBackupFormat).metadata;
            const fileContent = JSON.stringify(encryptedBackup);

            expect(() => detectAndValidateBackupFile(fileContent)).toThrow();
        });

        it('should throw error for encrypted backup with corrupted crypto section', async () => {
            const password = 'TestPassword123!';
            const encrypted = await encryptBackupData(mockBackupData, password);
            const encryptedBackup = createEncryptedBackupFormat(encrypted);

            // @ts-expect-error - Corrupt crypto section
            (encryptedBackup as Omit<EncryptedBackupFormat, 'crypto'> & { crypto: string }).crypto =
                'corrupted';
            const fileContent = JSON.stringify(encryptedBackup);

            expect(() => detectAndValidateBackupFile(fileContent)).toThrow();
        });
    });

    describe('Edge cases', () => {
        it('should handle very large plain-text backup', () => {
            const largeBackupData: BackupData = {
                tasks: Array.from({ length: 10000 }, (_, i) => ({
                    id: i + 1,
                    name: `Task ${i + 1}`,
                    project: `Project ${i % 100}`,
                    start: '2023-01-01T10:00:00Z',
                    end: '2023-01-01T11:00:00Z',
                    completed: i % 2 === 0,
                    cancelled: false,
                    createdOn: '2023-01-01T10:00:00Z',
                })),
                todos: Array.from({ length: 5000 }, (_, i) => ({
                    id: i + 1,
                    name: `Todo ${i + 1}`,
                    project: `Project ${i % 50}`,
                    completed: i % 3 === 0,
                    createdOn: '2023-01-01T10:00:00Z',
                })),
                settings: Array.from({ length: 100 }, (_, i) => ({
                    id: `setting${i}`,
                    value: `value${i}`,
                })),
            };

            const plainBackup = JSON.stringify(largeBackupData);
            const result = detectAndValidateBackupFile(plainBackup);

            expect(result.type).toBe('plain');
            expect(result.data).toEqual(largeBackupData);
        });

        it('should handle backup with special characters in data', () => {
            const specialData: BackupData = {
                tasks: [
                    {
                        id: 1,
                        name: 'Task with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?',
                        project: 'Project with émojis 🚀 and unicode ñáéíóú',
                        start: '2023-01-01T10:00:00Z',
                        end: '2023-01-01T11:00:00Z',
                    },
                ],
                todos: [
                    {
                        id: 1,
                        name: 'Todo with quotes "double" and \'single\' and backslash \\',
                        project: 'Project with newlines\nand tabs\t',
                        createdOn: '2023-01-01T10:00:00Z',
                    },
                ],
                settings: [
                    {
                        id: 'specialSetting',
                        value: 'Value with HTML <script>alert("test")</script>',
                    },
                ],
            };

            const plainBackup = JSON.stringify(specialData);
            const result = detectAndValidateBackupFile(plainBackup);

            expect(result.type).toBe('plain');
            expect(result.data).toEqual(specialData);
        });
    });
});
