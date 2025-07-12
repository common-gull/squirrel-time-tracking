import type { BackupData, EncryptionResult, DecryptionOptions } from './types';

const ENCRYPTION_CONFIG = {
    algorithm: 'AES-256-GCM',
    keyDerivation: {
        algorithm: 'PBKDF2',
        iterations: 100000,
        hash: 'SHA-256',
        saltLength: 32,
        keyLength: 32,
    },
    ivLength: 12, // 96 bits for GCM
} as const;

function generateSalt(): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(ENCRYPTION_CONFIG.keyDerivation.saltLength));
}

function generateIV(): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(ENCRYPTION_CONFIG.ivLength));
}

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);

    const baseKey = await crypto.subtle.importKey('raw', passwordBuffer, 'PBKDF2', false, [
        'deriveBits',
    ]);

    const keyMaterial = await crypto.subtle.deriveBits(
        {
            name: 'PBKDF2',
            salt,
            iterations: ENCRYPTION_CONFIG.keyDerivation.iterations,
            hash: ENCRYPTION_CONFIG.keyDerivation.hash,
        },
        baseKey,
        ENCRYPTION_CONFIG.keyDerivation.keyLength * 8,
    );

    return crypto.subtle.importKey('raw', keyMaterial, { name: 'AES-GCM' }, false, [
        'encrypt',
        'decrypt',
    ]);
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

export async function encryptBackupData(
    data: BackupData,
    password: string,
): Promise<EncryptionResult> {
    try {
        const salt = generateSalt();
        const iv = generateIV();

        const key = await deriveKey(password, salt);

        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(JSON.stringify(data));

        const encryptedBuffer = await crypto.subtle.encrypt(
            {
                name: 'AES-GCM',
                iv,
            },
            key,
            dataBuffer,
        );

        // Extract the encrypted data and auth tag
        // In AES-GCM, the auth tag is appended to the encrypted data
        const encryptedArray = new Uint8Array(encryptedBuffer);
        const authTagLength = 16; // 128 bits
        const encryptedData = encryptedArray.slice(0, -authTagLength);
        const authTag = encryptedArray.slice(-authTagLength);

        return {
            encryptedData: arrayBufferToBase64(encryptedData),
            salt: arrayBufferToBase64(salt),
            iv: arrayBufferToBase64(iv),
            authTag: arrayBufferToBase64(authTag),
        };
    } catch {
        throw new Error('Encryption failed');
    }
}

export async function decryptBackupData(options: DecryptionOptions): Promise<BackupData> {
    try {
        const salt = new Uint8Array(base64ToArrayBuffer(options.salt));
        const iv = new Uint8Array(base64ToArrayBuffer(options.iv));
        const encryptedData = new Uint8Array(base64ToArrayBuffer(options.encryptedData));
        const authTag = new Uint8Array(base64ToArrayBuffer(options.authTag));

        const key = await deriveKey(options.password, salt);

        const combinedBuffer = new Uint8Array(encryptedData.length + authTag.length);
        combinedBuffer.set(encryptedData);
        combinedBuffer.set(authTag, encryptedData.length);

        const decryptedBuffer = await crypto.subtle.decrypt(
            {
                name: 'AES-GCM',
                iv,
            },
            key,
            combinedBuffer,
        );

        const decoder = new TextDecoder();
        const jsonString = decoder.decode(decryptedBuffer);

        return JSON.parse(jsonString) as BackupData;
    } catch {
        throw new Error('Decryption failed');
    }
}

function getAppVersion(): string {
    return '1.0.0';
}

export function createEncryptedBackupFormat(encryptionResult: EncryptionResult): object {
    return {
        format: 'squirrel-encrypted-backup',
        version: '1.0',
        metadata: {
            created: new Date().toISOString(),
            appVersion: getAppVersion(),
            encryption: {
                algorithm: ENCRYPTION_CONFIG.algorithm,
                keyDerivation: {
                    algorithm: ENCRYPTION_CONFIG.keyDerivation.algorithm,
                    iterations: ENCRYPTION_CONFIG.keyDerivation.iterations,
                    hash: ENCRYPTION_CONFIG.keyDerivation.hash,
                    saltLength: ENCRYPTION_CONFIG.keyDerivation.saltLength,
                    keyLength: ENCRYPTION_CONFIG.keyDerivation.keyLength,
                },
            },
        },
        crypto: {
            salt: encryptionResult.salt,
            iv: encryptionResult.iv,
            authTag: encryptionResult.authTag,
        },
        data: encryptionResult.encryptedData,
    };
}
