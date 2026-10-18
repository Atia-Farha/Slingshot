export async function onRequest(context) {
	const url = new URL(context.request.url);

	if (url.pathname.startsWith('/api/')) {
		return context.next();
	}

	const nonce = crypto.randomUUID().replace(/-/g, '');

	const response = await context.next();

	const contentType = response.headers.get('content-type') || '';
	if (!contentType.includes('text/html')) return response;

	let html = await response.text();

	html = html.replace(/<script(?=[\s>])(?!.*nonce)/g, `<script nonce="${nonce}"`);

	html = html.replace(/<style(?=[\s>])(?!.*nonce)/g, `<style nonce="${nonce}"`);

	const csp = response.headers.get('content-security-policy') || '';
	const newHeaders = new Headers(response.headers);
	newHeaders.set('content-security-policy', csp.replace(/\{NONCE\}/g, nonce));

	return new Response(html, {
		status: response.status,
		statusText: response.statusText,
		headers: newHeaders,
	});
}
