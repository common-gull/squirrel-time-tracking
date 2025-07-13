import {
    Button,
    Card,
    Container,
    FileButton,
    Switch,
    Text,
    Title,
    Radio,
    Stack,
    Group,
    Badge,
    Alert,
} from '@mantine/core';
import { IconShield, IconFile, IconInfoCircle } from '@tabler/icons-react';
import { db } from '../../database/database.ts';
import { notifications } from '@mantine/notifications';
import { useLiveQuery } from 'dexie-react-hooks';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { createBackup } from '../../services/backup/backup.service';
import { BackupPasswordModal } from '../../components/settings/BackupPasswordModal';
import { RestorePasswordModal } from '../../components/settings/RestorePasswordModal';
import { detectAndValidateBackupFile } from '../../services/backup/encryption/file-detector';
import { decryptBackupData } from '../../services/backup/encryption/crypto.service';
import { restoreBackupData } from '../../services/backup/backup.service';
import {
    BackupData,
    BackupType,
    EncryptedBackupFormat,
} from '../../services/backup/encryption/types';

export default function Settings() {
    const { t } = useTranslation();
    const backupOnCloseSetting = useLiveQuery(() => db.settings.get('backupOnClose'));

    const [backupType, setBackupType] = useState<BackupType>('plain');
    const [passwordModalOpened, setPasswordModalOpened] = useState(false);
    const [restorePasswordModalOpened, setRestorePasswordModalOpened] = useState(false);
    const [pendingFileContent, setPendingFileContent] = useState<string | null>(null);
    const [backupLoading, setBackupLoading] = useState(false);
    const [restoreLoading, setRestoreLoading] = useState(false);
    const [restoreError, setRestoreError] = useState<string | null>(null);

    async function toggleBackupOnClose(checked: boolean) {
        await db.settings.put({ id: 'backupOnClose', value: checked });
        notifications.show({
            message: checked ? t('notifications.backupEnabled') : t('notifications.backupDisabled'),
        });
    }

    const handleBackupClick = () => {
        if (backupType === 'encrypted') {
            setPasswordModalOpened(true);
        } else {
            handleCreateBackup('plain');
        }
    };

    const handleCreateBackup = async (type: BackupType, password?: string) => {
        setBackupLoading(true);
        try {
            await createBackup(type, password);
            setPasswordModalOpened(false);
            notifications.show({
                message: t('notifications.backupCreated'),
            });
        } catch {
            notifications.show({
                message: t('pages.settings.backup.encrypted.errors.encryptionFailed'),
                color: 'red',
            });
        } finally {
            setBackupLoading(false);
        }
    };

    const handleFileSelect = (file: File | null) => {
        if (!file) {
            return;
        }
        const reader = new FileReader();
        reader.readAsText(file);
        reader.onload = async function (e) {
            if (typeof e.target?.result !== 'string') {
                return;
            }

            try {
                const fileContent = e.target.result;
                const { type, data } = detectAndValidateBackupFile(fileContent);

                if (type === 'encrypted') {
                    setPendingFileContent(fileContent);
                    setRestorePasswordModalOpened(true);
                    setRestoreError(null);
                } else {
                    await restoreBackupData(data as BackupData);
                    notifications.show({
                        message: t('notifications.dataRestored'),
                    });
                }
            } catch {
                notifications.show({
                    message: t('pages.settings.backup.encrypted.errors.invalidFormat'),
                    color: 'red',
                });
            }
        };
    };

    const handleRestoreWithPassword = async (password: string) => {
        if (!pendingFileContent) return;

        setRestoreLoading(true);
        setRestoreError(null);

        try {
            const { data } = detectAndValidateBackupFile(pendingFileContent);
            const encryptedBackup = data as EncryptedBackupFormat;

            const decryptedData = await decryptBackupData({
                encryptedData: encryptedBackup.data,
                salt: encryptedBackup.crypto.salt,
                iv: encryptedBackup.crypto.iv,
                authTag: encryptedBackup.crypto.authTag,
                password,
            });

            await restoreBackupData(decryptedData);

            setRestorePasswordModalOpened(false);
            setPendingFileContent(null);
            notifications.show({
                message: t('notifications.dataRestored'),
            });
        } catch {
            setRestoreError(t('pages.settings.backup.encrypted.errors.decryptionFailed'));
        } finally {
            setRestoreLoading(false);
        }
    };

    const handleRestoreModalClose = () => {
        setRestorePasswordModalOpened(false);
        setPendingFileContent(null);
        setRestoreError(null);
    };

    async function clearDb() {
        await db.tasks.clear();
        await db.todos.clear();
        await db.settings.clear();
    }

    async function deleteAllData() {
        await clearDb();
        notifications.show({
            message: t('notifications.dataDeleted'),
        });
    }

    return (
        <Container>
            <Card mb={'sm'}>
                <Title order={2}>{t('pages.settings.backup.title')}</Title>
                <Text>{t('pages.settings.backup.description')}</Text>

                <Stack gap="md" mb="md">
                    <Radio.Group
                        value={backupType}
                        onChange={(value) => setBackupType(value as BackupType)}
                        label="Backup Type"
                        aria-describedby="backup-type-description"
                    >
                        <Stack gap="sm">
                            <Radio
                                value="plain"
                                label={
                                    <Group gap="xs">
                                        <IconFile size={16} />
                                        <Text>{t('pages.settings.backup.type.plain')}</Text>
                                        <Badge variant="light" color="blue" size="xs">
                                            {t('pages.settings.backup.type.badges.standard')}
                                        </Badge>
                                    </Group>
                                }
                            />
                            <Radio
                                value="encrypted"
                                label={
                                    <Group gap="xs">
                                        <IconShield size={16} />
                                        <Text>{t('pages.settings.backup.type.encrypted')}</Text>
                                        <Badge variant="light" color="green" size="xs">
                                            {t('pages.settings.backup.type.badges.secure')}
                                        </Badge>
                                    </Group>
                                }
                            />
                        </Stack>
                    </Radio.Group>

                    <Alert
                        icon={<IconInfoCircle size={16} />}
                        color="blue"
                        variant="light"
                        id="backup-type-description"
                    >
                        {backupType === 'encrypted'
                            ? t('pages.settings.backup.type.descriptions.encrypted')
                            : t('pages.settings.backup.type.descriptions.plain')}
                    </Alert>

                    <Button
                        onClick={handleBackupClick}
                        loading={backupLoading}
                        disabled={backupLoading}
                        leftSection={
                            backupType === 'encrypted' ? (
                                <IconShield size={16} />
                            ) : (
                                <IconFile size={16} />
                            )
                        }
                    >
                        {backupLoading
                            ? t('pages.settings.backup.creatingBackup')
                            : t('pages.settings.backup.button')}
                    </Button>
                </Stack>

                <Switch
                    label={t('pages.settings.backup.askBeforeClosing')}
                    checked={backupOnCloseSetting?.value === true}
                    onChange={(event) => toggleBackupOnClose(event.currentTarget.checked)}
                    mb="md"
                />
                <Text size="sm" c="dimmed">
                    {t('pages.settings.backup.askBeforeClosingDescription')}
                </Text>
            </Card>

            <Card mb={'sm'}>
                <Title order={2}>{t('pages.settings.restore.title')}</Title>
                <Text>{t('pages.settings.restore.description')}</Text>
                <FileButton onChange={handleFileSelect} accept="application/json">
                    {(props) => <Button {...props}>{t('pages.settings.restore.button')}</Button>}
                </FileButton>
            </Card>

            <Card mb={'sm'}>
                <Title order={2}>{t('pages.settings.deleteData.title')}</Title>
                <Text>{t('pages.settings.deleteData.description')}</Text>
                <Button onClick={deleteAllData}>{t('pages.settings.deleteData.button')}</Button>
            </Card>

            <BackupPasswordModal
                opened={passwordModalOpened}
                onClose={() => setPasswordModalOpened(false)}
                onConfirm={(password) => handleCreateBackup('encrypted', password)}
                loading={backupLoading}
            />

            <RestorePasswordModal
                opened={restorePasswordModalOpened}
                onClose={handleRestoreModalClose}
                onConfirm={handleRestoreWithPassword}
                loading={restoreLoading}
                error={restoreError || undefined}
            />
        </Container>
    );
}
