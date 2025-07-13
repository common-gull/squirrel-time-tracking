import { describe, it, expect } from 'vitest';
import { calculatePasswordStrength, getPasswordStrengthColor } from './password-strength';

describe('calculatePasswordStrength', () => {
    it('should return weak score for empty password', () => {
        const result = calculatePasswordStrength('');
        expect(result.score).toBe(0);
        expect(result.label).toBe('weak');
        expect(result.requirements.length).toBe(false);
        expect(result.requirements.uppercase).toBe(false);
        expect(result.requirements.lowercase).toBe(false);
        expect(result.requirements.number).toBe(false);
        expect(result.requirements.special).toBe(false);
    });

    it('should return weak score for short password', () => {
        const result = calculatePasswordStrength('abc');
        expect(result.score).toBe(1);
        expect(result.label).toBe('weak');
        expect(result.requirements.length).toBe(false);
        expect(result.requirements.lowercase).toBe(true);
    });

    it('should return weak score for password with only 2 requirements', () => {
        const result = calculatePasswordStrength('password');
        expect(result.score).toBe(1);
        expect(result.label).toBe('weak');
        expect(result.requirements.length).toBe(true);
        expect(result.requirements.lowercase).toBe(true);
        expect(result.requirements.uppercase).toBe(false);
        expect(result.requirements.number).toBe(false);
        expect(result.requirements.special).toBe(false);
    });

    it('should return fair score for password with 3 requirements', () => {
        const result = calculatePasswordStrength('Password');
        expect(result.score).toBe(2);
        expect(result.label).toBe('fair');
        expect(result.requirements.length).toBe(true);
        expect(result.requirements.lowercase).toBe(true);
        expect(result.requirements.uppercase).toBe(true);
        expect(result.requirements.number).toBe(false);
        expect(result.requirements.special).toBe(false);
    });

    it('should return good score for password with 4 requirements', () => {
        const result = calculatePasswordStrength('Password1');
        expect(result.score).toBe(3);
        expect(result.label).toBe('good');
        expect(result.requirements.length).toBe(true);
        expect(result.requirements.lowercase).toBe(true);
        expect(result.requirements.uppercase).toBe(true);
        expect(result.requirements.number).toBe(true);
        expect(result.requirements.special).toBe(false);
    });

    it('should return strong score for password with all 5 requirements', () => {
        const result = calculatePasswordStrength('Password1!');
        expect(result.score).toBe(4);
        expect(result.label).toBe('strong');
        expect(result.requirements.length).toBe(true);
        expect(result.requirements.lowercase).toBe(true);
        expect(result.requirements.uppercase).toBe(true);
        expect(result.requirements.number).toBe(true);
        expect(result.requirements.special).toBe(true);
    });

    it('should detect various special characters', () => {
        const specialChars = [
            '!',
            '@',
            '#',
            '$',
            '%',
            '^',
            '&',
            '*',
            '(',
            ')',
            '_',
            '+',
            '-',
            '=',
            '[',
            ']',
            '{',
            '}',
            ';',
            ':',
            '"',
            '|',
            ',',
            '.',
            '<',
            '>',
            '/',
            '?',
        ];

        specialChars.forEach((char) => {
            const result = calculatePasswordStrength(`Password1${char}`);
            expect(result.requirements.special).toBe(true);
            expect(result.score).toBe(4);
            expect(result.label).toBe('strong');
        });
    });

    it('should handle complex passwords correctly', () => {
        const complexPassword = 'MyVerySecureP@ssw0rd!2023';
        const result = calculatePasswordStrength(complexPassword);
        expect(result.score).toBe(4);
        expect(result.label).toBe('strong');
        expect(result.requirements.length).toBe(true);
        expect(result.requirements.lowercase).toBe(true);
        expect(result.requirements.uppercase).toBe(true);
        expect(result.requirements.number).toBe(true);
        expect(result.requirements.special).toBe(true);
    });

    it('should handle edge cases with minimum requirements', () => {
        // Exactly 8 characters with minimum requirements for each category
        const result = calculatePasswordStrength('Aa1!bcde');
        expect(result.score).toBe(4);
        expect(result.label).toBe('strong');
        expect(result.requirements.length).toBe(true);
        expect(result.requirements.lowercase).toBe(true);
        expect(result.requirements.uppercase).toBe(true);
        expect(result.requirements.number).toBe(true);
        expect(result.requirements.special).toBe(true);
    });
});

describe('getPasswordStrengthColor', () => {
    it('should return correct colors for each strength level', () => {
        expect(getPasswordStrengthColor('weak')).toBe('red');
        expect(getPasswordStrengthColor('fair')).toBe('orange');
        expect(getPasswordStrengthColor('good')).toBe('yellow');
        expect(getPasswordStrengthColor('strong')).toBe('green');
    });

    it('should return gray for unknown strength level', () => {
        // @ts-expect-error - testing invalid input
        expect(getPasswordStrengthColor('invalid')).toBe('gray');
    });
});
