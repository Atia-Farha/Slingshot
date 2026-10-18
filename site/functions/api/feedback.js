const MAX_LENGTHS = { name: 100, email: 254, message: 2000 };
const MAX_BODY_SIZE = 4096;
const MAX_BODY_BUFFER = MAX_BODY_SIZE + 1024;
const VALID_TYPES = ['bug', 'feature', 'feedback', 'question'];
const ALLOWED_TABLES = new Set(['bugs', 'features', 'feedback', 'questions']);
const DEFAULT_ALLOWED_ORIGIN = 'https://sling-shot.pages.dev';

const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const ipBuckets = new Map();
let lastBucketSweep = Date.now();

const CORS_BASE = {
	'Access-Control-Allow-Methods': 'POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type',
	'Access-Control-Max-Age': '86400',
	Vary: 'Origin',
};

const SECURITY_HEADERS = {
	'X-Content-Type-Options': 'nosniff',
	'X-Frame-Options': 'DENY',
	'Referrer-Policy': 'no-referrer',
	'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
	'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
	'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
};

const DISPOSABLE_DOMAINS = new Set(['tempmail.com', 'throwaway.email', 'guerrillamail.com', 'mailinator.com', 'yopmail.com', 'trashmail.com', 'fakeinbox.com', '10minutemail.com', 'guerrillamailblock.com', 'grr.la', 'dispostable.com', 'sharklasers.com', 'spam4.me', 'bccto.me', 'chacuo.net', 'tempinbox.com', 'tempail.com', 'tempomail.fr', 'temporaryemail.net', 'temporaryforwarding.com', 'throwawayemailaddress.com']);

const TYPE_LABELS = {
	bug: 'Bug Report',
	feature: 'Feature Request',
	feedback: 'General Feedback',
	question: 'Question',
};

const TYPE_TO_TABLE = {
	bug: 'bugs',
	feature: 'features',
	feedback: 'feedback',
	question: 'questions',
};

function jsonResponse(data, status = 200, extraHeaders = {}) {
	return new Response(JSON.stringify(data), {
		status,
		headers: {
			'Content-Type': 'application/json',
			...SECURITY_HEADERS,
			...extraHeaders,
		},
	});
}

function corsHeadersFor(allowedOrigin) {
	return {
		...CORS_BASE,
		'Access-Control-Allow-Origin': allowedOrigin,
	};
}

const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };

function escapeHtml(str) {
	return String(str).replace(/[&<>"']/g, (c) => HTML_ESCAPES[c]);
}

function logEvent(event, fields) {
	try {
		console.log(JSON.stringify({ event, ts: Date.now(), ...fields }));
	} catch {
		// Field values may not be serializable; safe to drop the log entry.
	}
}

function sweepRateLimit(now) {
	if (now - lastBucketSweep < 60_000) return;
	lastBucketSweep = now;
	for (const [ip, bucket] of ipBuckets) {
		if (bucket.resetAt <= now) ipBuckets.delete(ip);
	}
}

function checkRateLimit(ip) {
	if (!ip) return true;
	const now = Date.now();
	sweepRateLimit(now);
	const bucket = ipBuckets.get(ip);
	if (!bucket || bucket.resetAt <= now) {
		ipBuckets.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
		return true;
	}
	if (bucket.count >= RATE_LIMIT_MAX) return false;
	bucket.count += 1;
	return true;
}

function getRemoteIp(request) {
	const cf = request.headers.get('CF-Connecting-IP');
	if (cf) return cf.trim();
	const fwd = request.headers.get('X-Forwarded-For');
	if (fwd) return fwd.split(',')[0]?.trim() || undefined;
	return undefined;
}

function resolveAllowedOrigin(env) {
	const raw = (env && env.ALLOWED_ORIGIN) || DEFAULT_ALLOWED_ORIGIN;
	const list = String(raw)
		.split(',')
		.map((s) => s.trim())
		.filter(Boolean);
	return list;
}

function pickAllowedOrigin(request, allowList) {
	const origin = request.headers.get('Origin');
	if (!origin) return null;
	return allowList.includes(origin) ? origin : null;
}

function validateName(name) {
	if (!name || typeof name !== 'string') return 'Name is required.';
	const trimmed = name.trim();
	if (trimmed.length === 0) return 'Name is required.';
	if (trimmed.length > MAX_LENGTHS.name) return `Name must be ${MAX_LENGTHS.name} characters or less.`;
	if (/[<>{}]/.test(trimmed)) return 'Name contains invalid characters.';
	// eslint-disable-next-line no-control-regex -- intentional: reject control chars in user-supplied name
	if (/[\x00-\x1f\x7f]/.test(trimmed)) return 'Name contains control characters.';
	return null;
}

function validateEmail(email) {
	if (!email || typeof email !== 'string') return 'Email is required.';
	const trimmed = email.trim();
	if (trimmed.length === 0) return 'Email is required.';
	if (trimmed.length > MAX_LENGTHS.email) return `Email must be ${MAX_LENGTHS.email} characters or less.`;
	const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
	if (!re.test(trimmed)) return 'Please enter a valid email address.';
	const domain = trimmed.split('@')[1]?.toLowerCase();
	if (DISPOSABLE_DOMAINS.has(domain)) return 'Please use a permanent email address.';
	return null;
}

function validateType(type) {
	if (!type || typeof type !== 'string') return 'Type is required.';
	if (!VALID_TYPES.includes(type)) return 'Invalid feedback type.';
	return null;
}

function validateMessage(message) {
	if (!message || typeof message !== 'string') return 'Message is required.';
	const trimmed = message.trim();
	if (trimmed.length === 0) return 'Message is required.';
	if (trimmed.length > MAX_LENGTHS.message) return `Message must be ${MAX_LENGTHS.message} characters or less.`;
	const spamPatterns = [/(.)\1{10,}/i, /<script/i, /javascript:/i, /data:text\/html/i, /on\w+\s*=/i];
	if (spamPatterns.some((p) => p.test(trimmed))) return 'Message contains disallowed content.';
	return null;
}

function normalizeEmail(email) {
	return email.trim().toLowerCase();
}

async function verifyTurnstile(token, secret, remoteIp) {
	const body = new URLSearchParams();
	body.append('secret', secret);
	body.append('response', token);
	if (remoteIp) body.append('remoteip', remoteIp);

	const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: body.toString(),
	});
	if (!res.ok) return { ok: false, reason: `http_${res.status}` };
	const result = await res.json();
	return { ok: result.success === true, reason: result['error-codes']?.join(',') || 'unsuccessful' };
}

function renderEmail({ typeLabel, name, email, message, receivedAt }) {
	const safe = {
		name: escapeHtml(name),
		email: escapeHtml(email),
		message: escapeHtml(message),
		type: escapeHtml(typeLabel),
		time: escapeHtml(receivedAt),
	};

	return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 10px;margin:0;background-color:#050505;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
	<tr>
		<td align="center">
			<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
				<tr>
					<td style="background-color:#0a0a0b;border:1px solid rgba(255,255,255,0.06);border-radius:12px;overflow:hidden;">
						<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
							<tr><td style="height:1px;background:linear-gradient(90deg,transparent,rgba(20,216,212,0.5),transparent);"></td></tr>
						</table>
						<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
							<tr>
								<td style="padding:46px 24px 0;text-align:center;">
									<div style="display:inline-block;background:rgba(20,216,212,0.1);border:1px solid rgba(20,216,212,0.2);border-radius:999px;padding:6px 16px;margin-bottom:16px;">
										<span style="font-size:12px;font-weight:600;letter-spacing:0.05em;color:#14D8D4;text-transform:uppercase;">SLINGSHOT</span>
									</div>
									<h1 style="margin:0;font-size:24px;font-weight:700;color:#f0f0f2;">New ${safe.type}</h1>
								</td>
							</tr>
						</table>
						<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
							<tr><td style="padding:32px;"><div style="height:1px;background:linear-gradient(90deg,transparent,rgba(20,216,212,0.3),transparent);"></div></td></tr>
						</table>
						<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
							<tr><td style="padding:0 24px;">
								<p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#76767a;text-transform:uppercase;letter-spacing:0.05em;">Name</p>
								<p style="margin:0;font-size:15px;color:#f0f0f2;">${safe.name}</p>
							</td></tr>
						</table>
						<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
							<tr><td style="padding:20px 24px 0;">
								<p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#76767a;text-transform:uppercase;letter-spacing:0.05em;">Email</p>
								<p style="margin:0;font-size:15px;color:#a0a0a8;">${safe.email}</p>
							</td></tr>
						</table>
						<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
							<tr><td style="padding:20px 24px 0;">
								<p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#76767a;text-transform:uppercase;letter-spacing:0.05em;">Message</p>
								<p style="margin:0;font-size:15px;color:#f0f0f2;line-height:1.6;">${safe.message}</p>
							</td></tr>
						</table>
						<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
							<tr><td style="padding:32px 32px 0;"><div style="height:1px;background:linear-gradient(90deg,transparent,rgba(20,216,212,0.3),transparent);"></div></td></tr>
						</table>
						<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
							<tr><td style="padding:20px 24px;text-align:center;">
								<p style="margin:0;font-size:12px;color:#76767a;">${safe.time}</p>
							</td></tr>
						</table>
						<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
							<tr><td style="height:1px;background:linear-gradient(90deg,transparent,rgba(20,216,212,0.5),transparent);"></td></tr>
						</table>
					</td>
				</tr>
			</table>
		</td>
	</tr>
</table>`;
}

async function readJsonBody(request) {
	const buf = await request.arrayBuffer();
	if (buf.byteLength > MAX_BODY_BUFFER) {
		return { error: 'too_large' };
	}

	let text;
	try {
		text = new TextDecoder('utf-8', { fatal: true }).decode(new Uint8Array(buf));
	} catch {
		return { error: 'bad_encoding' };
	}
	if (text.length > MAX_BODY_SIZE) {
		return { error: 'too_large' };
	}
	let parsed;
	try {
		parsed = JSON.parse(text);
	} catch {
		return { error: 'bad_json' };
	}
	if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
		return { error: 'bad_shape' };
	}
	return { body: parsed };
}

async function handlePost(context) {
	const { env, request } = context;
	const allowList = resolveAllowedOrigin(env);

	const allowedOrigin = pickAllowedOrigin(request, allowList);
	if (!allowedOrigin) {
		logEvent('origin_rejected', { ua: request.headers.get('User-Agent') || '' });
		return jsonResponse({ error: 'Origin not allowed.' }, 403);
	}
	const cors = corsHeadersFor(allowedOrigin);

	const remoteIp = getRemoteIp(request);
	if (!checkRateLimit(remoteIp)) {
		logEvent('rate_limited', { ip: remoteIp });
		return jsonResponse({ error: 'Too many requests. Please try again later.' }, 429, cors);
	}

	if (!env.DB) {
		console.error('D1 database not bound');
		return jsonResponse({ error: 'Service temporarily unavailable. Please try again later.' }, 503, cors);
	}
	if (!env.TURNSTILE_SECRET) {
		console.error('TURNSTILE_SECRET not bound');
		return jsonResponse({ error: 'Service temporarily unavailable. Please try again later.' }, 503, cors);
	}

	const contentType = request.headers.get('content-type') || '';
	if (!contentType.toLowerCase().includes('application/json')) {
		return jsonResponse({ error: 'Invalid content type.' }, 415, cors);
	}

	const parsed = await readJsonBody(request);
	if (parsed.error === 'too_large') {
		return jsonResponse({ error: 'Request too large.' }, 413, cors);
	}
	if (parsed.error) {
		return jsonResponse({ error: 'Invalid request body.' }, 400, cors);
	}
	const body = parsed.body;
	const { name, email, type, message, turnstileToken } = body;

	if (!turnstileToken || typeof turnstileToken !== 'string') {
		return jsonResponse({ error: 'Please complete the verification.' }, 400, cors);
	}
	if (turnstileToken.length > 4096) {
		return jsonResponse({ error: 'Invalid verification token.' }, 400, cors);
	}

	const turnstile = await verifyTurnstile(turnstileToken, env.TURNSTILE_SECRET, remoteIp).catch((err) => {
		logEvent('turnstile_error', { ip: remoteIp, err: err?.message || String(err) });
		return { ok: false, reason: 'exception' };
	});
	if (!turnstile.ok) {
		logEvent('turnstile_failed', { ip: remoteIp, reason: turnstile.reason });
		return jsonResponse({ error: 'Verification failed. Please try again.' }, 403, cors);
	}

	const errors = {};
	const nameErr = validateName(name);
	const emailErr = validateEmail(email);
	const typeErr = validateType(type);
	const messageErr = validateMessage(message);
	if (nameErr) errors.name = nameErr;
	if (emailErr) errors.email = emailErr;
	if (typeErr) errors.type = typeErr;
	if (messageErr) errors.message = messageErr;
	if (Object.keys(errors).length > 0) {
		const summary = `Please correct ${Object.keys(errors).length} field${Object.keys(errors).length === 1 ? '' : 's'} and try again.`;
		return jsonResponse({ error: summary, errors }, 422, cors);
	}

	const cleanName = name.trim();
	const cleanEmail = normalizeEmail(email);
	const cleanMessage = message.trim();

	const table = TYPE_TO_TABLE[type];
	if (!table || !ALLOWED_TABLES.has(table)) {
		return jsonResponse({ error: 'Invalid feedback type.' }, 422, cors);
	}

	try {
		await env.DB.prepare(`INSERT INTO ${table} (name, email, message) VALUES (?, ?, ?)`).bind(cleanName, cleanEmail, cleanMessage).run();
	} catch (err) {
		logEvent('d1_insert_failed', { table, err: err?.message || String(err) });
		return jsonResponse({ error: 'Something went wrong. Please try again later.' }, 500, cors);
	}

	if (env.RESEND_API_KEY && env.RESEND_TO_EMAIL) {
		try {
			const typeLabel = TYPE_LABELS[type] || type;
			const receivedAt = new Date().toLocaleString('en-US', {
				weekday: 'long',
				year: 'numeric',
				month: 'long',
				day: 'numeric',
				hour: 'numeric',
				minute: '2-digit',
				timeZone: 'Asia/Dhaka',
				timeZoneName: 'short',
			});
			const html = renderEmail({ typeLabel, name: cleanName, email: cleanEmail, message: cleanMessage, receivedAt });

			const resendRes = await fetch('https://api.resend.com/emails', {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${env.RESEND_API_KEY}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					from: 'Slingshot Feedback <onboarding@resend.dev>',
					to: env.RESEND_TO_EMAIL,
					subject: `[Slingshot] ${typeLabel}`,
					html,
				}),
			});
			if (!resendRes.ok) {
				const resendErr = await resendRes.text();
				logEvent('resend_failed', { status: resendRes.status, body: resendErr.slice(0, 200) });
			}
		} catch (err) {
			logEvent('resend_exception', { err: err?.message || String(err) });
		}
	} else {
		logEvent('resend_skipped', { reason: 'env_missing' });
	}

	return jsonResponse({ success: true }, 200, cors);
}

export async function onRequest(context) {
	const method = context.request.method;
	const allowList = resolveAllowedOrigin(context.env);
	const allowedOrigin = pickAllowedOrigin(context.request, allowList);

	if (method !== 'POST' && method !== 'OPTIONS') {
		return jsonResponse({ error: 'Method not allowed.' }, 405, {
			Allow: 'POST, OPTIONS',
			...(allowedOrigin ? corsHeadersFor(allowedOrigin) : {}),
		});
	}

	if (method === 'OPTIONS') {
		if (!allowedOrigin) {
			return new Response(null, { status: 403, headers: { ...SECURITY_HEADERS } });
		}
		return new Response(null, { status: 204, headers: { ...SECURITY_HEADERS, ...corsHeadersFor(allowedOrigin) } });
	}

	if (context.request.headers.get('X-Forwarded-Proto') && context.request.headers.get('X-Forwarded-Proto') !== 'https') {
		return jsonResponse({ error: 'HTTPS required.' }, 403, allowedOrigin ? corsHeadersFor(allowedOrigin) : {});
	}
	return handlePost(context);
}
