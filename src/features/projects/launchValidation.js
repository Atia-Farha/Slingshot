export function normalizeLaunchUrl(value) {
	return value.trim();
}

export function isLoopbackUrl(value) {
	if (!value) return false;
	try {
		const host = new URL(value).hostname.toLowerCase();
		return host === 'localhost' || host.endsWith('.localhost') || host === '0.0.0.0' || host === '::1' || host === '[::1]';
	} catch {
		return false;
	}
}

export function validateLaunchUrl(value) {
	if (!value) {
		return '';
	}

	if (value.length > 2048) {
		return 'URL must be 2048 characters or fewer.';
	}

	let url;

	try {
		url = new URL(value);
	} catch {
		return 'Enter a complete URL beginning with http:// or https://.';
	}

	if (!['http:', 'https:'].includes(url.protocol)) {
		return 'Only http:// and https:// URLs are allowed.';
	}

	if (url.username || url.password) {
		return 'URLs containing credentials cannot be stored.';
	}

	return '';
}
