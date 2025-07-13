export interface PasswordStrengthResult {
    score: number; // 0-4 (weak to strong)
    label: 'weak' | 'fair' | 'good' | 'strong';
    requirements: {
        length: boolean;
        uppercase: boolean;
        lowercase: boolean;
        number: boolean;
        special: boolean;
    };
}

export const calculatePasswordStrength = (password: string): PasswordStrengthResult => {
    const requirements = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /\d/.test(password),
        special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
    };

    const metRequirements = Object.values(requirements).filter(Boolean).length;

    let score = 0;
    let label: 'weak' | 'fair' | 'good' | 'strong' = 'weak';

    if (password.length === 0) {
        score = 0;
        label = 'weak';
    } else if (metRequirements <= 2) {
        score = 1;
        label = 'weak';
    } else if (metRequirements === 3) {
        score = 2;
        label = 'fair';
    } else if (metRequirements === 4) {
        score = 3;
        label = 'good';
    } else if (metRequirements === 5) {
        score = 4;
        label = 'strong';
    }

    return {
        score,
        label,
        requirements,
    };
};

export const getPasswordStrengthColor = (label: 'weak' | 'fair' | 'good' | 'strong'): string => {
    switch (label) {
        case 'weak':
            return 'red';
        case 'fair':
            return 'orange';
        case 'good':
            return 'yellow';
        case 'strong':
            return 'green';
        default:
            return 'gray';
    }
};
