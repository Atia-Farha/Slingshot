# Security Policy

Slingshot takes security seriously. This document covers how to report vulnerabilities, what's in scope, our security architecture, and what to expect during the disclosure process.

> **tl;dr:** Found a vulnerability? Report it through [GitHub Security Advisories](https://github.com/Atia-Farha/Slingshot/security/advisories/new) or email [slingshot.dev@proton.me](mailto:slingshot.dev@proton.me). Do **not** open a public issue.

---

## Table of Contents

- [Reporting a Vulnerability](#reporting-a-vulnerability)
- [Safe Harbor](#safe-harbor)
- [Scope](#scope)
- [Out of Scope](#out-of-scope)
- [Security Architecture](#security-architecture)
    - [Desktop Application](#desktop-application)
    - [Website](#website)
    - [Build and Release Process](#build-and-release-process)
- [Dependency Security](#dependency-security)
- [Supported Versions](#supported-versions)
- [Security Release Process](#security-release-process)
- [Contact](#contact)

---

## Reporting a Vulnerability

### How to report

| Method                                                                                                    | When to use                                                       |
| --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| [GitHub Security Advisories](https://github.com/Atia-Farha/Slingshot/security/advisories/new) (preferred) | Any security vulnerability — private, encrypted, tracked          |
| [Email](mailto:slingshot.dev@proton.me)                                                                   | If you prefer email over GitHub; use PGP if possible              |
| [Feedback form](https://sling-shot.pages.dev/feedback)                                                    | General security questions (not for active vulnerability reports) |

**Do not open a public GitHub issue for security vulnerabilities.** Public disclosure of vulnerabilities before a fix is available puts all users at risk.

### What to include

A good report includes:

1. **Description** — What the vulnerability is and why it matters
2. **Reproduction steps** — Exact steps to trigger the issue
3. **Affected version** — The version of Slingshot (check the title bar or `tauri.conf.json`)
4. **Environment** — OS, OS version, and any relevant configuration
5. **Severity** — Your assessment: Low / Medium / High / Critical
6. **Impact** — What an attacker could achieve (data access, code execution, denial of service, etc.)
7. **Proof of concept** — Code, screenshots, or logs that demonstrate the issue (if applicable)

### What to expect

| Step                   | What happens                                                               |
| ---------------------- | -------------------------------------------------------------------------- |
| Acknowledgment         | We confirm receipt of your report                                          |
| Assessment             | We investigate, confirm the issue, and assign a severity                   |
| Fix development        | We develop and test a fix                                                  |
| Coordinated disclosure | We work with you on timing; we will not disclose until a fix is available  |
| Credit                 | With your permission, we credit you by name or handle in the release notes |

We will keep you updated throughout the process. If you do not hear back, please follow up — your initial message may have been missed.

---

## Safe Harbor

We support responsible security research. If you follow this policy:

- **We will not pursue legal action** against you for good-faith security research
- **We will not report you** to law enforcement for incidental access to non-public data during research
- **We will work with you** to understand and resolve the issue

### Your responsibilities

- Make a good-faith effort to avoid privacy violations, data destruction, and service disruption
- Only interact with accounts you own or have explicit permission to test
- Stop testing and report immediately once you have confirmed a vulnerability
- Do not access, modify, or delete data belonging to other users
- Do not exploit a vulnerability beyond what is necessary to demonstrate it
- Do not perform denial-of-service testing against production infrastructure

### What we ask

- Give us reasonable time to fix the issue before public disclosure
- Do not publicly disclose details until we have released a fix and coordinated with you
- Do not exploit the vulnerability for any purpose other than demonstrating it to us

---

## Scope

### Desktop Application (Tauri)

| Area                   | Examples                                                                            |
| ---------------------- | ----------------------------------------------------------------------------------- |
| **Process execution**  | Command injection via launch actions, arbitrary code execution through the terminal |
| **File system access** | Unauthorized reads/writes beyond the user-selected project folders                  |
| **SQLite database**    | Injection attacks, unauthorized access to project data                              |
| **Tauri permissions**  | Over-permissive capability grants, privilege escalation                             |
| **Auto-updater**       | Signature verification bypass, malicious update delivery                            |
| **IPC bridge**         | WebView-to-Rust communication vulnerabilities                                       |
| **Supply chain**       | Tampered binaries, compromised build dependencies                                   |

### Website (Cloudflare Pages)

| Area                        | Examples                                            |
| --------------------------- | --------------------------------------------------- |
| **Feedback form**           | Injection, spam bypass, Turnstile circumvention     |
| **API endpoints**           | Authentication bypass, data exposure, rate limiting |
| **Cloudflare D1**           | SQL injection, unauthorized data access             |
| **Content Security Policy** | CSP bypass, nonce leakage                           |
| **Static site**             | XSS via Markdown rendering, open redirects          |

### Build and Release Process

| Area                 | Examples                                                    |
| -------------------- | ----------------------------------------------------------- |
| **CI/CD pipeline**   | Secret leakage in GitHub Actions, tampered build artifacts  |
| **Code signing**     | Certificate misuse, unsigned binaries distributed as signed |
| **Dependency chain** | Malicious packages, typosquatting, compromised maintainers  |

---

## Out of Scope

The following are generally **not** considered security vulnerabilities in Slingshot:

| Category                                                                                | Reason                                                                                       |
| --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Issues in third-party apps launched by the user (VS Code, terminal emulators, browsers) | These are not part of Slingshot's codebase                                                   |
| Theoretical attacks requiring physical access to the user's device                      | Physical access defeats most software security models                                        |
| Social engineering attacks                                                              | Cannot be mitigated through code changes                                                     |
| Vulnerabilities requiring the user to have already executed arbitrary malicious code    | If the attacker has code execution, the game is already over                                 |
| Issues in outdated or unsupported operating systems                                     | We support currently maintained OS versions                                                  |
| Vulnerabilities in third-party dependencies                                             | Report these to the respective maintainers (see [Dependency Security](#dependency-security)) |
| Denial of service against the desktop application                                       | Local-only application, DoS is a local concern                                               |
| Cosmetic issues, UI bugs, or feature requests                                           | Not security vulnerabilities                                                                 |

---

## Security Architecture

### Desktop Application

Slingshot is a Tauri 2.0 application. The security model relies on the following principles:

#### Data stays local

- **All data is stored locally** in a SQLite database (`slingshot.db`) on the user's device
- **No network requests** are made by the desktop application — it is fully offline
- **No telemetry, analytics, or tracking** is collected
- **No cloud sync** — data never leaves the device

#### Least-privilege permissions

The application declares only the minimum Tauri capabilities required:

| Capability                         | Purpose                    | What it allows                |
| ---------------------------------- | -------------------------- | ----------------------------- |
| `core:default`                     | Standard window management | WebView ↔ Rust IPC            |
| `sql:default`, `sql:allow-execute` | Local SQLite access        | Read/write the local database |
| `dialog:allow-open`                | Native folder picker       | Browse and select directories |
| `opener:allow-open-url`            | Open URLs in browser       | HTTP/HTTPS links only         |

No blanket filesystem, network, or shell permissions are granted.

#### Process execution

- Commands are built as **argument arrays**, never string-concatenated shell commands — preventing injection
- The application resolves **full executable paths** rather than relying on shell PATH inheritance
- Spawned processes run with the same privileges as the user who launched Slingshot

#### Auto-updater security

- Updates are verified via **cryptographic signatures** — signature verification is never disabled, including in development builds
- Only updates from the official GitHub repository are accepted

#### Secrets handling

- **Never store credentials, tokens, or passwords** in the SQLite database
- The `notes` field is for reminders only (e.g., "password in 1Password"), never the secret itself
- If secret storage is ever required, use the OS keychain via the `keyring` crate

### Website

The website runs on Cloudflare Pages with serverless functions.

#### Security headers

| Header                         | Value                                                      | Purpose                      |
| ------------------------------ | ---------------------------------------------------------- | ---------------------------- |
| `Strict-Transport-Security`    | `max-age=63072000; includeSubDomains; preload`             | Force HTTPS for 2 years      |
| `X-Content-Type-Options`       | `nosniff`                                                  | Prevent MIME type sniffing   |
| `X-Frame-Options`              | `DENY`                                                     | Prevent clickjacking         |
| `Referrer-Policy`              | `strict-origin-when-cross-origin`                          | Limit referrer leakage       |
| `Permissions-Policy`           | Denies camera, microphone, geolocation, payment, USB, etc. | Block sensitive browser APIs |
| `Cross-Origin-Opener-Policy`   | `same-origin`                                              | Isolate browsing context     |
| `Cross-Origin-Resource-Policy` | `same-origin`                                              | Prevent cross-origin reads   |
| `Content-Security-Policy`      | Nonce-based CSP (per-request)                              | Prevent XSS                  |

#### Content Security Policy

```
default-src 'self';
script-src 'self' 'nonce-{NONCE}' https://challenges.cloudflare.com;
style-src 'self' 'nonce-{NONCE}';
font-src 'self';
img-src 'self' data: https:;
connect-src 'self' https://api.github.com;
frame-src https://challenges.cloudflare.com;
base-uri 'self';
form-action 'self';
frame-ancestors 'none';
upgrade-insecure-requests
```

The `{NONCE}` is replaced per-request by a cryptographically random value generated in `functions/_middleware.js`. No `'unsafe-inline'` or `'unsafe-eval'` is used in production.

#### Feedback form protections

- **Cloudflare Turnstile** — Bot detection without CAPTCHAs; token verified server-side
- **Server-side validation** — All inputs validated and sanitized independently of client-side checks
- **Disposable email blocking** — 20+ known throwaway email domains rejected
- **Input sanitization** — `<` and `>` stripped from all string inputs
- **Body size limit** — 4096 bytes maximum
- **CORS** — Only `https://sling-shot.pages.dev` is allowed
- **Rate limiting** — Inherited from Cloudflare's infrastructure

#### Data handling

- Feedback submissions are stored in Cloudflare D1 (encrypted at rest)
- No IP addresses are logged or stored by us
- No cookies, localStorage, or tracking are used
- Email addresses are sent to Resend solely for notification delivery

### Build and Release Process

#### Code integrity

- Release binaries are built via GitHub Actions using `tauri-action`
- Binaries are signed where possible (code signing certificates are not yet purchased)
- The auto-updater verifies signatures before applying updates

#### CI/CD security

- Dependencies are audited before merge: `cargo audit` (Rust) and `pnpm audit` (JavaScript)
- High-severity findings are not silently ignored
- Build commands use argument arrays, not shell string concatenation

---

## Dependency Security

We use automated tools to check for known vulnerabilities in dependencies:

| Tool          | Scope                                         | Command            |
| ------------- | --------------------------------------------- | ------------------ |
| `cargo audit` | Rust dependencies (`src-tauri/Cargo.lock`)    | `pnpm cargo:audit` |
| `pnpm audit`  | JavaScript dependencies (`site/package.json`) | `pnpm audit`       |

### If you find a vulnerability in a dependency

1. **Check if it affects Slingshot** — Does the vulnerable code path get executed?
2. **Report it to us** through the [reporting process](#reporting-a-vulnerability) if it affects Slingshot
3. **Report it to the upstream maintainer** as well — they need to know

We will:

- Assess whether Slingshot is affected
- Update the dependency if a fix is available
- If no fix exists, evaluate whether the vulnerable code path is reachable and add mitigations

---

## Supported Versions

| Version           | Supported |
| ----------------- | --------- |
| Latest release    | Yes       |
| Previous releases | No        |

We do not provide backported security patches for older versions. Security fixes are applied to the latest release only.

### How to check your version

- **Desktop:** Check the application title bar or `tauri.conf.json` → `version`
- **Website:** The website is always the latest version (statically generated on each deploy)

---

## Security Release Process

When a security vulnerability is fixed:

1. **Fix is developed** on a private branch (not in a public PR)
2. **New release is published** on [GitHub Releases](https://github.com/Atia-Farha/Slingshot/releases) with a detailed changelog
3. **Advisory is published** on [GitHub Security Advisories](https://github.com/Atia-Farha/Slingshot/security/advisories) with the CVE (if assigned) or GHSA ID
4. **Reporter is credited** in the release notes (with permission)
5. **Website is updated** if the vulnerability affects the website

### How to stay informed

- **Watch** the [GitHub repository](https://github.com/Atia-Farha/Slingshot) for release notifications
- **Subscribe** to [GitHub Security Advisories](https://github.com/Atia-Farha/Slingshot/security/advisories) for direct notifications
- **Check** the [releases page](https://github.com/Atia-Farha/Slingshot/releases) periodically

---

## Contact

| Purpose                              | Channel                                                                                                                                              |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Security vulnerability reports**   | [GitHub Security Advisories](https://github.com/Atia-Farha/Slingshot/security/advisories/new) (preferred) or [email](mailto:slingshot.dev@proton.me) |
| **General security questions**       | [Feedback form](https://sling-shot.pages.dev/feedback) or [email](mailto:slingshot.dev@proton.me)                                                    |
| **Dependency vulnerability reports** | Same as security reports above                                                                                                                       |
| **Press and media inquiries**        | [Email](mailto:slingshot.dev@proton.me)                                                                                                              |
