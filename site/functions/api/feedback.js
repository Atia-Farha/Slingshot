const MAX_LENGTHS = { name: 100, email: 254, message: 2000 };
const MAX_BODY_SIZE = 4096;
const VALID_TYPES = ["bug", "feature", "feedback", "question"];
const ALLOWED_TABLES = new Set(["bugs", "features", "feedback", "questions"]);

const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "https://sling-shot.pages.dev",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
};

const DISPOSABLE_DOMAINS = new Set([
    "tempmail.com",
    "throwaway.email",
    "guerrillamail.com",
    "mailinator.com",
    "yopmail.com",
    "trashmail.com",
    "fakeinbox.com",
    "10minutemail.com",
    "guerrillamailblock.com",
    "grr.la",
    "dispostable.com",
    "sharklasers.com",
    "spam4.me",
    "bccto.me",
    "chacuo.net",
    "disposableemailaddresses.emailmiser.com",
    "tempinbox.com",
    "tempail.com",
    "tempomail.fr",
    "temporaryemail.net",
    "temporaryforwarding.com",
    "throwawayemailaddress.com",
]);

function jsonResponse(data, status = 200, extraHeaders = {}) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            "Content-Type": "application/json",
            "X-Content-Type-Options": "nosniff",
            ...extraHeaders,
        },
    });
}

function sanitizeString(str) {
    return str.replace(/[<>]/g, "").trim();
}

function escapeHtml(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function validateName(name) {
    if (!name || typeof name !== "string") return "Name is required.";
    const trimmed = name.trim();
    if (trimmed.length === 0) return "Name is required.";
    if (trimmed.length > MAX_LENGTHS.name)
        return `Name must be ${MAX_LENGTHS.name} characters or less.`;
    if (/[<>{}]/.test(trimmed)) return "Name contains invalid characters.";
    return null;
}

function validateEmail(email) {
    if (!email || typeof email !== "string") return "Email is required.";
    const trimmed = email.trim();
    if (trimmed.length === 0) return "Email is required.";
    if (trimmed.length > MAX_LENGTHS.email)
        return `Email must be ${MAX_LENGTHS.email} characters or less.`;
    const re =
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!re.test(trimmed)) return "Please enter a valid email address.";
    const domain = trimmed.split("@")[1]?.toLowerCase();
    if (DISPOSABLE_DOMAINS.has(domain))
        return "Please use a permanent email address.";
    return null;
}

function validateType(type) {
    if (!type || typeof type !== "string") return "Type is required.";
    if (!VALID_TYPES.includes(type)) return "Invalid feedback type.";
    return null;
}

function validateMessage(message) {
    if (!message || typeof message !== "string") return "Message is required.";
    const trimmed = message.trim();
    if (trimmed.length === 0) return "Message is required.";
    if (trimmed.length > MAX_LENGTHS.message)
        return `Message must be ${MAX_LENGTHS.message} characters or less.`;
    const spamPatterns = [
        /(.)\1{10,}/i,
        /<script/i,
        /javascript:/i,
        /on\w+\s*=/i,
    ];
    if (spamPatterns.some((p) => p.test(trimmed)))
        return "Message contains disallowed content.";
    return null;
}

async function verifyTurnstile(token, secret) {
    const body = new URLSearchParams();
    body.append("secret", secret);
    body.append("response", token);

    const res = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: body.toString(),
        },
    );

    if (!res.ok) return false;
    const result = await res.json();
    return result.success === true;
}

async function handlePost(context) {
    const { env, request } = context;

    // --- 0. Check required bindings ---
    if (!env.DB) {
        console.error("D1 database not bound");
        return jsonResponse(
            {
                error: "Service temporarily unavailable. Please try again later.",
            },
            503,
            CORS_HEADERS,
        );
    }

    if (!env.TURNSTILE_SECRET) {
        console.error("TURNSTILE_SECRET not bound");
        return jsonResponse(
            {
                error: "Service temporarily unavailable. Please try again later.",
            },
            503,
            CORS_HEADERS,
        );
    }

    // --- 1. Content-Type check ---
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
        return jsonResponse(
            { error: "Invalid content type." },
            415,
            CORS_HEADERS,
        );
    }

    // --- 2. Body size check ---
    const contentLength = parseInt(
        request.headers.get("content-length") || "0",
        10,
    );
    if (contentLength > MAX_BODY_SIZE) {
        return jsonResponse({ error: "Request too large." }, 413, CORS_HEADERS);
    }

    // --- 2. Parse body ---
    let body;
    try {
        body = await request.json();
    } catch {
        return jsonResponse(
            { error: "Invalid request body." },
            400,
            CORS_HEADERS,
        );
    }

    if (!body || typeof body !== "object") {
        return jsonResponse(
            { error: "Invalid request body." },
            400,
            CORS_HEADERS,
        );
    }

    const { name, email, type, message, turnstileToken } = body;

    // --- 3. Verify Turnstile ---
    if (!turnstileToken || typeof turnstileToken !== "string") {
        return jsonResponse(
            { error: "Please complete the verification." },
            400,
            CORS_HEADERS,
        );
    }

    let turnstileValid = false;
    try {
        turnstileValid = await verifyTurnstile(
            turnstileToken,
            env.TURNSTILE_SECRET,
        );
    } catch (err) {
        console.error("Turnstile verification error:", err.message);
    }

    if (!turnstileValid) {
        return jsonResponse(
            { error: "Verification failed. Please try again." },
            403,
            CORS_HEADERS,
        );
    }

    // --- 5. Server-side validation ---
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
        return jsonResponse(
            { error: "Validation failed.", errors },
            422,
            CORS_HEADERS,
        );
    }

    // --- 5. Sanitize and store in D1 ---
    const cleanName = sanitizeString(name);
    const cleanEmail = sanitizeString(email);
    const cleanMessage = sanitizeString(message);

    const TYPE_TO_TABLE = {
        bug: "bugs",
        feature: "features",
        feedback: "feedback",
        question: "questions",
    };
    const table = TYPE_TO_TABLE[type];
    if (!table || !ALLOWED_TABLES.has(table)) {
        return jsonResponse(
            { error: "Invalid feedback type." },
            422,
            CORS_HEADERS,
        );
    }

    try {
        await env.DB.prepare(
            `INSERT INTO ${table} (name, email, message) VALUES (?, ?, ?)`,
        )
            .bind(cleanName, cleanEmail, cleanMessage)
            .run();
    } catch (err) {
        console.error("D1 insert failed:", err.message);
        return jsonResponse(
            { error: "Something went wrong. Please try again later." },
            500,
            CORS_HEADERS,
        );
    }

    // --- 6. Send email via Resend ---
    if (!env.RESEND_API_KEY || !env.RESEND_TO_EMAIL) {
        console.error(
            "Email skipped: RESEND_API_KEY or RESEND_TO_EMAIL not bound",
        );
    } else {
        try {
            const safeName = escapeHtml(cleanName);
            const safeEmail = escapeHtml(cleanEmail);
            const safeType = escapeHtml(type);
            const safeMessage = escapeHtml(cleanMessage);

            const resendRes = await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${env.RESEND_API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    from: "Slingshot Feedback <onboarding@resend.dev>",
                    to: env.RESEND_TO_EMAIL,
                    subject: `[Slingshot] ${safeType}: ${safeName}`,
                    html: `
                        <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
                            <h2 style="color:#14D8D4;">New ${safeType}</h2>
                            <table style="width:100%;border-collapse:collapse;">
                                <tr><td style="padding:8px 0;font-weight:600;">Name:</td><td>${safeName}</td></tr>
                                <tr><td style="padding:8px 0;font-weight:600;">Email:</td><td>${safeEmail}</td></tr>
                                <tr><td style="padding:8px 0;font-weight:600;vertical-align:top;">Message:</td><td style="white-space:pre-wrap;">${safeMessage}</td></tr>
                            </table>
                            <hr style="margin:20px 0;border-color:#333;" />
                            <p style="color:#888;font-size:12px;">Received at ${new Date().toISOString()}</p>
                        </div>
                    `,
                }),
            });

            if (!resendRes.ok) {
                const resendErr = await resendRes.text();
                console.error("Resend API error:", resendRes.status, resendErr);
            }
        } catch (err) {
            console.error("Resend email failed:", err.message);
        }
    }

    return jsonResponse({ success: true }, 200, CORS_HEADERS);
}

export async function onRequest(context) {
    const method = context.request.method;

    if (method === "OPTIONS") {
        return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (method === "POST") {
        return handlePost(context);
    }

    return jsonResponse({ error: "Method not allowed." }, 405, CORS_HEADERS);
}
