import { describe, expect, it } from 'vitest';
import { isLoopbackUrl, normalizeLaunchUrl, validateLaunchUrl } from './launchValidation';

describe('launch URL validation', () => {
	it('normalizes and accepts HTTP(S) URLs', () => {
		const url = normalizeLaunchUrl('  https://example.com/app  ');

		expect(url).toBe('https://example.com/app');
		expect(validateLaunchUrl(url)).toBe('');
		expect(validateLaunchUrl('http://localhost:5173')).toBe('');
	});

	it('allows an empty URL so an action can be removed', () => {
		expect(validateLaunchUrl('')).toBe('');
	});

	it('rejects unsupported and incomplete URLs', () => {
		expect(validateLaunchUrl('file:///tmp/project')).toContain('Only http:// and https://');
		expect(validateLaunchUrl('example.com')).toContain('complete URL');
	});

	it('rejects credentials embedded in a URL', () => {
		expect(validateLaunchUrl('https://user:secret@example.com')).toContain('credentials');
	});

	it('rejects URLs longer than 2048 characters', () => {
		const longPath = 'a'.repeat(2050);
		expect(validateLaunchUrl(`https://example.com/${longPath}`)).toBe('URL must be 2048 characters or fewer.');
	});
});

describe('isLoopbackUrl', () => {
	it('returns true for localhost and loopback hosts', () => {
		expect(isLoopbackUrl('http://localhost:5173')).toBe(true);
		expect(isLoopbackUrl('http://app.localhost')).toBe(true);
		expect(isLoopbackUrl('http://0.0.0.0:8080')).toBe(true);
		expect(isLoopbackUrl('http://[::1]')).toBe(true);
	});

	it('returns false for public hosts and malformed input', () => {
		expect(isLoopbackUrl('https://example.com')).toBe(false);
		expect(isLoopbackUrl('')).toBe(false);
		expect(isLoopbackUrl('not a url')).toBe(false);
	});
});
