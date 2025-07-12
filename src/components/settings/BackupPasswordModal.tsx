import { useState } from 'react';
import { Modal, TextInput, Button, Text, Group, Stack } from '@mantine/core';
import { useTranslation } from 'react-i18next';

interface BackupPasswordModalProps {
    opened: boolean;
    onClose: () => void;
    onConfirm: (password: string) => void;
    loading?: boolean;
}

export const BackupPasswordModal = ({
    opened,
    onClose,
    onConfirm,
    loading = false,
}: BackupPasswordModalProps) => {
    const { t } = useTranslation();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});

    const validatePassword = (pwd: string): string | undefined => {
        if (pwd.length < 8) {
            return t('pages.settings.backup.encrypted.passwordModal.passwordTooShort');
        }
        return undefined;
    };

    const validateConfirmPassword = (pwd: string, confirm: string): string | undefined => {
        if (pwd !== confirm) {
            return t('pages.settings.backup.encrypted.passwordModal.passwordMismatch');
        }
        return undefined;
    };

    const handlePasswordChange = (value: string) => {
        setPassword(value);
        const error = validatePassword(value);
        setErrors((prev) => ({ ...prev, password: error }));

        if (confirmPassword) {
            const confirmError = validateConfirmPassword(value, confirmPassword);
            setErrors((prev) => ({ ...prev, confirm: confirmError }));
        }
    };

    const handleConfirmPasswordChange = (value: string) => {
        setConfirmPassword(value);
        const error = validateConfirmPassword(password, value);
        setErrors((prev) => ({ ...prev, confirm: error }));
    };

    const handleSubmit = () => {
        const passwordError = validatePassword(password);
        const confirmError = validateConfirmPassword(password, confirmPassword);

        if (passwordError || confirmError) {
            setErrors({ password: passwordError, confirm: confirmError });
            return;
        }

        onConfirm(password);
    };

    const handleClose = () => {
        setPassword('');
        setConfirmPassword('');
        setErrors({});
        onClose();
    };

    const isValid = password.length >= 8 && password === confirmPassword;

    return (
        <Modal
            opened={opened}
            onClose={handleClose}
            title={t('pages.settings.backup.encrypted.passwordModal.title')}
            centered
            closeOnClickOutside={!loading}
            closeOnEscape={!loading}
        >
            <Stack gap="md">
                <Text size="sm" c="dimmed">
                    {t('pages.settings.backup.encrypted.passwordModal.warning')}
                </Text>

                <TextInput
                    label={t('pages.settings.backup.encrypted.passwordModal.passwordLabel')}
                    type="password"
                    value={password}
                    onChange={(e) => handlePasswordChange(e.currentTarget.value)}
                    error={errors.password}
                    disabled={loading}
                    data-autofocus
                />

                <TextInput
                    label={t('pages.settings.backup.encrypted.passwordModal.confirmLabel')}
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => handleConfirmPasswordChange(e.currentTarget.value)}
                    error={errors.confirm}
                    disabled={loading}
                />

                <Group justify="flex-end" gap="sm">
                    <Button variant="subtle" onClick={handleClose} disabled={loading}>
                        {t('common.cancel')}
                    </Button>
                    <Button onClick={handleSubmit} disabled={!isValid || loading} loading={loading}>
                        {t('pages.settings.backup.encrypted.passwordModal.createButton')}
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
};
