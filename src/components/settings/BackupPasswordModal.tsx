import { useState, useMemo } from 'react';
import {
    Modal,
    TextInput,
    Button,
    Text,
    Group,
    Stack,
    Progress,
    List,
    ThemeIcon,
    Alert,
} from '@mantine/core';
import { IconCheck, IconX, IconInfoCircle } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import {
    calculatePasswordStrength,
    getPasswordStrengthColor,
} from '../../services/backup/encryption/password-strength';

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
    const [showRequirements, setShowRequirements] = useState(false);

    const passwordStrength = useMemo(() => calculatePasswordStrength(password), [password]);

    const validatePassword = (pwd: string): string | undefined => {
        if (pwd.length < 8) {
            return t('pages.settings.backup.encrypted.passwordModal.passwordTooShort');
        }
        const currentStrength = calculatePasswordStrength(pwd);
        if (currentStrength.score < 2) {
            return t('pages.settings.backup.encrypted.errors.passwordTooWeak');
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

        if (value.length > 0 && !showRequirements) {
            setShowRequirements(true);
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
        setShowRequirements(false);
        onClose();
    };

    const isValid = useMemo(() => {
        const currentStrength = calculatePasswordStrength(password);
        return password.length >= 8 && password === confirmPassword && currentStrength.score >= 2;
    }, [password, confirmPassword]);

    return (
        <Modal
            opened={opened}
            onClose={handleClose}
            title={t('pages.settings.backup.encrypted.passwordModal.title')}
            centered
            closeOnClickOutside={!loading}
            closeOnEscape={!loading}
            size="lg"
        >
            <Stack gap="md">
                <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light">
                    {t('pages.settings.backup.encrypted.passwordModal.warning')}
                </Alert>

                <TextInput
                    label={t('pages.settings.backup.encrypted.passwordModal.passwordLabel')}
                    type="password"
                    value={password}
                    onChange={(e) => handlePasswordChange(e.currentTarget.value)}
                    error={errors.password}
                    disabled={loading}
                    data-autofocus
                    aria-describedby="password-requirements"
                />

                {password.length > 0 && (
                    <Stack gap="xs">
                        <Group justify="space-between" align="center">
                            <Text size="sm" fw={500}>
                                {t(
                                    'pages.settings.backup.encrypted.passwordModal.passwordStrength.label',
                                )}
                            </Text>
                            <Text size="sm" c={getPasswordStrengthColor(passwordStrength.label)}>
                                {t(
                                    `pages.settings.backup.encrypted.passwordModal.passwordStrength.${passwordStrength.label}`,
                                )}
                            </Text>
                        </Group>
                        <Progress
                            value={(passwordStrength.score / 4) * 100}
                            color={getPasswordStrengthColor(passwordStrength.label)}
                            size="sm"
                            aria-label={`Password strength: ${passwordStrength.label}`}
                        />
                    </Stack>
                )}

                {showRequirements && (
                    <Stack gap="xs">
                        <Text size="sm" fw={500}>
                            {t('pages.settings.backup.encrypted.passwordModal.requirements.title')}
                        </Text>
                        <List size="sm" spacing="xs" id="password-requirements">
                            <List.Item
                                icon={
                                    <ThemeIcon
                                        size={16}
                                        radius="xl"
                                        color={
                                            passwordStrength.requirements.length ? 'green' : 'gray'
                                        }
                                        variant="light"
                                    >
                                        {passwordStrength.requirements.length ? (
                                            <IconCheck size={12} />
                                        ) : (
                                            <IconX size={12} />
                                        )}
                                    </ThemeIcon>
                                }
                            >
                                {t(
                                    'pages.settings.backup.encrypted.passwordModal.requirements.length',
                                )}
                            </List.Item>
                            <List.Item
                                icon={
                                    <ThemeIcon
                                        size={16}
                                        radius="xl"
                                        color={
                                            passwordStrength.requirements.uppercase
                                                ? 'green'
                                                : 'gray'
                                        }
                                        variant="light"
                                    >
                                        {passwordStrength.requirements.uppercase ? (
                                            <IconCheck size={12} />
                                        ) : (
                                            <IconX size={12} />
                                        )}
                                    </ThemeIcon>
                                }
                            >
                                {t(
                                    'pages.settings.backup.encrypted.passwordModal.requirements.uppercase',
                                )}
                            </List.Item>
                            <List.Item
                                icon={
                                    <ThemeIcon
                                        size={16}
                                        radius="xl"
                                        color={
                                            passwordStrength.requirements.lowercase
                                                ? 'green'
                                                : 'gray'
                                        }
                                        variant="light"
                                    >
                                        {passwordStrength.requirements.lowercase ? (
                                            <IconCheck size={12} />
                                        ) : (
                                            <IconX size={12} />
                                        )}
                                    </ThemeIcon>
                                }
                            >
                                {t(
                                    'pages.settings.backup.encrypted.passwordModal.requirements.lowercase',
                                )}
                            </List.Item>
                            <List.Item
                                icon={
                                    <ThemeIcon
                                        size={16}
                                        radius="xl"
                                        color={
                                            passwordStrength.requirements.number ? 'green' : 'gray'
                                        }
                                        variant="light"
                                    >
                                        {passwordStrength.requirements.number ? (
                                            <IconCheck size={12} />
                                        ) : (
                                            <IconX size={12} />
                                        )}
                                    </ThemeIcon>
                                }
                            >
                                {t(
                                    'pages.settings.backup.encrypted.passwordModal.requirements.number',
                                )}
                            </List.Item>
                            <List.Item
                                icon={
                                    <ThemeIcon
                                        size={16}
                                        radius="xl"
                                        color={
                                            passwordStrength.requirements.special ? 'green' : 'gray'
                                        }
                                        variant="light"
                                    >
                                        {passwordStrength.requirements.special ? (
                                            <IconCheck size={12} />
                                        ) : (
                                            <IconX size={12} />
                                        )}
                                    </ThemeIcon>
                                }
                            >
                                {t(
                                    'pages.settings.backup.encrypted.passwordModal.requirements.special',
                                )}
                            </List.Item>
                        </List>
                    </Stack>
                )}

                <TextInput
                    label={t('pages.settings.backup.encrypted.passwordModal.confirmLabel')}
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => handleConfirmPasswordChange(e.currentTarget.value)}
                    error={errors.confirm}
                    disabled={loading}
                    aria-describedby="confirm-password-help"
                />

                {loading && (
                    <Alert color="blue" variant="light">
                        <Text size="sm">
                            {t('pages.settings.backup.encrypted.passwordModal.creatingBackup')}
                        </Text>
                    </Alert>
                )}

                <Group justify="flex-end" gap="sm">
                    <Button variant="subtle" onClick={handleClose} disabled={loading}>
                        {t('common.cancel')}
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!isValid || loading}
                        loading={loading}
                        leftSection={loading ? undefined : <IconCheck size={16} />}
                    >
                        {loading
                            ? t('pages.settings.backup.encrypted.passwordModal.creatingBackup')
                            : t('pages.settings.backup.encrypted.passwordModal.createButton')}
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
};
