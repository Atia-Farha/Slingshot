---
title: Security Policy
description: How to report security vulnerabilities in Slingshot.
lastUpdated: "July 17, 2026"
---

**In short:** If you find a security vulnerability in Slingshot, please report it responsibly through [GitHub Security Advisories](https://github.com/Atia-Farha/Slingshot/security/advisories/new). Do not open a public issue. We will acknowledge your report and work with you to understand and address the issue.

---

## Reporting a vulnerability

If you discover a security vulnerability in Slingshot, please report it responsibly. **Do not open a public GitHub issue for security vulnerabilities.**

### How to report

Report vulnerabilities through [GitHub Security Advisories](https://github.com/Atia-Farha/Slingshot/security/advisories/new), which provides a private, encrypted channel for disclosure. Alternatively, you can email us at [slingshot.dev@proton.me](mailto:slingshot.dev@proton.me).

Include the following in your report:

- **Description** — A clear description of the vulnerability and its potential impact.
- **Reproduction steps** — Step-by-step instructions to reproduce the issue.
- **Affected version** — The version of Slingshot where you observed the vulnerability.
- **Environment** — Operating system, version, and any relevant configuration details.
- **Severity assessment** — Your assessment of the severity (low, medium, high, critical) and why.

### What to expect

- **Acknowledgment** — We will acknowledge receipt of your report.
- **Assessment** — We will investigate and assess the vulnerability, including whether the issue is confirmed and our planned response.
- **Resolution** — We will work on a fix and coordinate disclosure timing with you.
- **Disclosure** — We will not publicly disclose the vulnerability until a fix is available and you have had reasonable time to update.
- **Credit** — With your permission, we will credit you in the release notes for the fix. If you prefer to remain anonymous, we will respect that.

## Safe harbor

We consider security research conducted in accordance with this policy to be:

- **Authorized** — Exercising good-faith security research under applicable law.
- **Lawful** — Not subject to civil or criminal liability, to the extent permitted by applicable law, for incidental access to non-public data.
- **Good faith** — We will not pursue legal action against researchers who follow this policy.

We ask that you:

- Make a good-faith effort to avoid privacy violations, data destruction, and service disruption.
- Only interact with accounts you own or with explicit permission of the account holder.
- Stop testing and report immediately once you have confirmed a vulnerability.
- Do not access or modify data belonging to other users.

## Scope

The following are in scope for security reports:

- Slingshot (all platforms: Windows, macOS, Linux).
- The Slingshot website at [sling-shot.pages.dev](/).
- The feedback form and its backend infrastructure (Cloudflare Pages, D1, Turnstile, Resend).
- The build and release process (e.g., supply chain attacks, tampered binaries).
- Binary distribution and code signing integrity.

## Out of scope

The following are generally not considered security vulnerabilities:

- Issues in third-party applications launched by the user (e.g., VS Code, terminal emulators).
- Theoretical attacks that require physical access to the user's device.
- Social engineering attacks.
- Issues that require the user to have already executed arbitrary malicious code on their system.
- Vulnerabilities in outdated or unsupported operating systems.
- Issues in third-party dependencies and frameworks (report these to their respective maintainers).

## Supported versions

Security updates are applied to the latest release of Slingshot. We do not provide backported security patches for older versions. If you are using an older version, upgrade to the latest release.

You can verify which version you are running by checking the application title bar or the `version` field in `tauri.conf.json`.

## Dependency vulnerabilities

We use `cargo audit` (Rust) and `pnpm audit` (JavaScript) to check for known vulnerabilities in dependencies. If you discover a vulnerability in a dependency that affects Slingshot, please report it through the process described above.

## Release notifications

When a security fix is released, we will:

1. Publish a new release on [GitHub Releases](https://github.com/Atia-Farha/Slingshot/releases) with a detailed changelog.
2. Credit the reporter (with permission) in the release notes.

To stay informed about security updates, watch the [GitHub repository](https://github.com/Atia-Farha/Slingshot) for release notifications.

## Contact

- **Security reports:** [GitHub Security Advisories](https://github.com/Atia-Farha/Slingshot/security/advisories/new) (recommended), [Feedback Page](/feedback), or [slingshot.dev@proton.me](mailto:slingshot.dev@proton.me)
- **General questions:** [Feedback Page](/feedback) or [slingshot.dev@proton.me](mailto:slingshot.dev@proton.me)
