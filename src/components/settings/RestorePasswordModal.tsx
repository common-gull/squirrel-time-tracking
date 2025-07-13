import { useState } from 'react';
import { Modal, TextInput, Button, Text, Group, Stack, Alert } from '@mantine/core';
import { IconLock, IconAlertCircle } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

interface RestorePasswordModalProps {
    opened: boolean;
    onClose: () => void;
    onConfirm: (password: string) => void;
    loading?: boolean;
    error?: string;
}

export const RestorePasswordModal = ({
    opened,
    onClose,
    onConfirm,
    loading = false,
    error,
}: RestorePasswordModalProps) => {
    const { t } = useTranslation();
    const [password, setPassword] = useState('');

    const handleSubmit = () => {
        if (password.trim()) {
            onConfirm(password);
        }
    };

    const handleClose = () => {
        setPassword('');
        onClose();
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' && password.trim()) {
            handleSubmit();
        }
    };

    return (
        <Modal
            opened={opened}
            onClose={handleClose}
            title={t('pages.settings.backup.encrypted.restoreModal.title')}
            centered
            closeOnClickOutside={!loading}
            closeOnEscape={!loading}
            size="md"
        >
            <Stack gap="md">
                <Alert icon={<IconLock size={16} />} color="blue" variant="light">
                    {t('pages.settings.backup.encrypted.restoreModal.description')}
                </Alert>

                <TextInput
                    label={t('pages.settings.backup.encrypted.restoreModal.passwordLabel')}
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.currentTarget.value)}
                    onKeyDown={handleKeyDown}
                    error={error}
                    disabled={loading}
                    data-autofocus
                    aria-describedby="password-help"
                    leftSection={<IconLock size={16} />}
                />

                {error && (
                    <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
                        {error}
                    </Alert>
                )}

                {loading && (
                    <Alert color="blue" variant="light">
                        <Text size="sm">
                            {t('pages.settings.backup.encrypted.restoreModal.decryptingData')}
                        </Text>
                    </Alert>
                )}

                <Group justify="flex-end" gap="sm">
                    <Button variant="subtle" onClick={handleClose} disabled={loading}>
                        {t('common.cancel')}
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!password.trim() || loading}
                        loading={loading}
                        leftSection={loading ? undefined : <IconLock size={16} />}
                    >
                        {loading
                            ? t('pages.settings.backup.encrypted.restoreModal.decryptingData')
                            : t('pages.settings.backup.encrypted.restoreModal.restoreButton')}
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
};
