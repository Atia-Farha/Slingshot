---
title: Privacy Policy
description: How Slingshot handles your data across the desktop application and website.
lastUpdated: "July 17, 2026"
---

**In short:** The Slingshot desktop application runs entirely on your machine and sends zero data to any server. The only data we collect is what you voluntarily enter in the Website's feedback form (name, email, message, and feedback type). You can verify all of this by reading the [open source code](https://github.com/Atia-Farha/Slingshot).

---

## Introduction and scope

This Privacy Policy explains how Slingshot ("we", "us", or "our") collects, uses, stores, and protects information when you use the Slingshot desktop application ("the Application"), the Slingshot website at [sling-shot.pages.dev](/) ("the Website"), and any related services (collectively, "Slingshot"). This policy applies to all platforms where Slingshot is available, including Windows, macOS, and Linux.

By using Slingshot, you agree to the practices described in this policy. If you do not agree, please discontinue use of Slingshot. This policy should be read alongside our [Terms of Service](/terms) and the [AGPL v3 License](https://github.com/Atia-Farha/Slingshot/blob/main/LICENSE).

The Application and the Website operate independently. The Desktop Application does not communicate with the Website or any external server operated by us. Data handling practices differ between the two and are described separately below.

<!-- SECTION: Part A — Desktop Application -->

## The Desktop Application sends nothing

The Desktop Application is **fully offline**. It does **not** make any network requests. No data is sent to our servers, any third-party server, or any analytics endpoint. This is architecturally enforced by the Tauri framework and verifiable in the [open source code](https://github.com/Atia-Farha/Slingshot). Specifically, the Application does not collect analytics or telemetry, use cookies or local storage, access your camera or microphone, include advertising or tracking SDKs, or read files beyond what you explicitly select through the native folder picker.

## Data stored locally on your device

All Application data is stored in a local SQLite database file (`slingshot.db`) on your device. This database never leaves your machine. The data stored includes:

- **Project names and descriptions** — labels you assign to your projects.
- **Folder paths** — local filesystem paths to your project directories, selected by you via the native OS folder picker.
- **Favorite status** — whether you have marked a project as a favorite.
- **Last opened timestamp** — the date and time you last launched a project.
- **Launch actions** — the URLs, terminal commands, application paths, and folder shortcuts you configure for each project, including optional labels and execution order.
- **Creation timestamps** — when projects were added.

**Important:** You are solely responsible for the content you store in the Application. We strongly recommend against storing passwords, API tokens, access keys, or other secrets in launch actions or project notes. The Application is not designed as a secrets manager and does not encrypt stored data beyond what your operating system provides for files at rest.

## Operating system capabilities

The Application interacts with your operating system in the following ways, all initiated exclusively by your explicit actions:

- **Process execution** — When you click "Launch" on a project, the Application spawns the processes you configured (e.g., opening Visual Studio Code at a specific folder, running terminal commands). Commands are executed as argument arrays, never as string-concatenated shell strings, preventing command injection.
- **Visual Studio Code detection** — The Application checks well-known filesystem locations for the VS Code executable (e.g., `/usr/bin/code`, `/Applications/Visual Studio Code.app`, `%LOCALAPPDATA%\Programs\Microsoft VS Code\Code.exe`) and reads your system PATH environment variable to locate it.
- **Shell resolution** — The Application reads the `SHELL` (Linux/macOS) or `COMSPEC` (Windows) environment variable to identify your default shell, falling back to known shell paths if not set.
- **Folder picker** — Uses the operating system's native dialog to let you browse and select directories. No file contents are read or transmitted; only the selected path is stored.
- **Embedded terminal** — The optional embedded terminal (powered by portable-pty) spawns a shell process in your chosen working directory. Terminal I/O stays local between the PTY and the WebView.
- **URL opening** — When you launch a URL action, the Application delegates the URL to your operating system's default browser. The URL is not transmitted to us.

Environment variables accessed: `PATH`, `HOME`, `LOCALAPPDATA`, `ProgramFiles`, `ProgramFiles(x86)`, `SHELL`, `COMSPEC`, `SystemRoot`. These are standard OS variables used to resolve executable paths. The Application also sets `TERM` and `COLORTERM` within spawned terminal sessions for correct display rendering. No other environment variables are read or transmitted.

## Tauri permissions (least-privilege model)

The Application's OS-level capabilities are governed by Tauri's permission system. Only the following permissions are declared in the application manifest:

- **core:default** — Standard window management and IPC between the WebView and the Rust backend.
- **sql:default, sql:allow-execute** — Read and write access to the local SQLite database only.
- **dialog:allow-open** — Access to the native folder picker dialog.
- **opener:allow-open-url** — Ability to open HTTP/HTTPS URLs in the default browser, restricted to `http://*` and `https://*` URL schemes.

No blanket filesystem, network, or shell permissions are granted. Each plugin is scoped to the minimum capability required for its function.

## Deleting your Application data

Since all Application data is stored locally on your device, you have full control. To delete all Application data:

1. Close the Application.
2. Delete the `slingshot.db` file from the Application's data directory:
    - **Linux:** `~/.local/share/com.atia-farha.slingshot/`
    - **macOS:** `~/Library/Application Support/com.atia-farha.slingshot/`
    - **Windows:** `%APPDATA%\com.atia-farha.slingshot\`
3. Optionally uninstall the Application through your OS's standard uninstall process.

No data is retained by us after local deletion because no data was ever transmitted to us.

<!-- SECTION: Part B — Website -->

## What the Website collects

The Website collects the minimum data necessary to operate.

**We collect (only when you submit the feedback form):**

- **Name** — to address you in any response.
- **Email** — to follow up on your submission if needed.
- **Message** — the content of your feedback.
- **Feedback type** — bug report, feature request, general feedback, or question.

**We do not collect:**

- IP addresses (not logged or stored by us; Cloudflare may process them transiently for DDoS mitigation as part of their infrastructure).
- Browsing behavior, page views, click events, or scroll depth.
- Device information, screen resolution, or browser type.
- Referral sources or search queries.
- Any third-party analytics or advertising data.

## Cookies and similar technologies

We do not use first-party cookies on the Website. No localStorage, sessionStorage, or indexedDB is used for tracking.

Cloudflare's infrastructure may set strictly necessary technical cookies for DDoS mitigation and security purposes. These cookies are essential for the Website to function and do not track you across sites. Because they are strictly necessary, they do not require consent under the ePrivacy Directive (2002/58/EC) or equivalent local regulations. Cloudflare Turnstile, used for bot protection on the feedback form, operates without cookies.

## How we use your data

Data collected through the Website is used solely to respond to your feedback, improve Slingshot, and maintain the Website. We do not use your data for profiling, automated decision-making, or targeted advertising.

## Legal basis for processing (GDPR)

If you are located in the European Economic Area (EEA), United Kingdom, or Switzerland, we process your data under the following legal bases:

- **Consent** — You voluntarily submit the feedback form, providing explicit consent for us to process your name, email, and message for the purpose of responding to your feedback.
- **Legitimate interest** — Maintaining and improving Slingshot based on aggregated, anonymized feedback patterns.

You may withdraw your consent at any time by submitting a request through our [feedback form](/feedback). Withdrawing consent does not affect the lawfulness of processing carried out before withdrawal.

## Data retention

- **Desktop Application:** Data is retained locally on your device for as long as you choose to keep it. You may delete it at any time (see Deleting your Application data above).
- **Website feedback:** Feedback submissions are retained for the lifetime of the project to track recurring issues and feature requests. We do not automatically delete individual submissions.

## Data sharing and disclosure

We do not sell or rent your personal data. We share information only in the following limited circumstances:

- **Service providers** — We use third-party services to operate the Website (see Third-party services below). These providers process data on our behalf under contractual obligations that restrict their use of your data.
- **Legal requirements** — We may disclose information if required by law, regulation, legal process, or governmental request, or to protect the rights, property, or safety of Slingshot, our users, or the public.
- **Aggregated data** — We may publish aggregated, anonymized feedback statistics internally (e.g., "we received 50 feature requests about terminal tabs") that cannot identify you individually. This data is not shared with third parties.

## Third-party services

The following third-party services process data on our behalf in connection with the Website:

- **Cloudflare Pages** — Website hosting. Cloudflare's infrastructure may transiently process IP addresses for DDoS mitigation and content delivery. Data may be processed in Cloudflare data centers in the United States and other countries where Cloudflare operates. See [Cloudflare's Privacy Policy](https://www.cloudflare.com/privacypolicy/).
- **Cloudflare D1** — Server-side database for storing feedback form submissions. Data is encrypted at rest within Cloudflare's infrastructure.
- **Cloudflare Turnstile** — Bot protection for the feedback form. Turnstile does not use cookies, does not track users across sites, and collects a minimal signal to distinguish humans from bots. See [Turnstile documentation](https://developers.cloudflare.com/turnstile/).
- **Resend** — Transactional email delivery for feedback notification emails. Your email address is sent to Resend solely for the purpose of delivering the notification. See [Resend's Privacy Policy](https://resend.com/legal/privacy-policy).

The Desktop Application uses none of these services — it makes no network requests.

## International data transfers

The Website is hosted on Cloudflare's global network, which operates data centers in the United States, Europe, Asia, and other regions. If you submit feedback from outside the country where your data is processed, your data may be transferred to and processed in other countries. By submitting feedback, you consent to such transfers.

We rely on Cloudflare's Data Processing Addendum, which incorporates Standard Contractual Clauses (SCCs) approved by the European Commission, as the legal mechanism for international data transfers. You can review [Cloudflare's DPA](https://www.cloudflare.com/cloudflare-customer-dpa/).

No international data transfer occurs for Application data, since it never leaves your device.

## Security measures

- **Desktop Application** — Data never leaves your device, so the primary security boundary is your operating system.
- **Website** — Data in transit is encrypted via TLS (HTTPS). The Website enforces strict security headers, including Content-Security-Policy, Strict-Transport-Security, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, and a comprehensive Permissions-Policy that denies access to camera, microphone, geolocation, and other sensitive APIs.

No system is completely secure. While we take commercially reasonable precautions, we cannot guarantee absolute security of data transmitted to or stored by third-party services.

## Data breach notification

In the event of a personal data breach affecting Website feedback data, we commit to:

- Notify the relevant supervisory authority within 72 hours of becoming aware of the breach, as required by GDPR Article 33.
- Notify affected individuals without undue delay when the breach is likely to result in a high risk to their rights and freedoms, as required by GDPR Article 34.
- Document the breach, its effects, and the remedial actions taken.

<!-- SECTION: Part C — Your rights -->

## Your privacy rights

Your rights depend on where you live. We honor all of the following regardless of jurisdiction:

### All users

- **Access** — Request a copy of the personal data we hold about you.
- **Deletion** — Request deletion of your personal data.
- **Correction** — Request correction of inaccurate data.
- **Contact** — Exercise any right by submitting a request through our [feedback form](/feedback). Please do not submit privacy requests through public GitHub issues — GitHub issues are public by default, and submitting personal data through them would compromise your privacy.

### California residents (CCPA/CPRA)

The California Consumer Privacy Act, as amended by CPRA, additionally grants you:

- **Right to know** the categories and specific pieces of personal information collected.
- **Right to opt out of the sale or sharing of personal information** — we do not sell or share personal information, so there is nothing to opt out of.
- **Right to non-discrimination** — we will not discriminate against you for exercising your rights.

We will respond to verified requests within 45 days.

### Virginia residents (VCDPA)

You have the right to access, correct, delete, and obtain a copy of your personal data, and to opt out of targeted advertising and the sale of personal data. We do not sell personal data or engage in targeted advertising.

### Other U.S. states

Residents of states with comprehensive privacy laws (Colorado, Connecticut, Utah, Texas, Oregon, Montana, Iowa, Indiana, Tennessee, Ohio, Delaware, and others) have similar rights. We honor applicable requests from all U.S. residents regardless of state.

### UK, EEA, and Switzerland residents (GDPR)

You have rights under the UK GDPR and/or EU GDPR, including:

- **Access** — Request a copy of your personal data.
- **Rectification** — Request correction of inaccurate data.
- **Erasure** — Request deletion of your data.
- **Restriction** — Request restriction of processing in certain circumstances.
- **Portability** — Request your data in a structured, machine-readable format.
- **Objection** — Object to processing based on legitimate interests.
- **Complaint** — Lodge a complaint with your local data protection authority.

### Children

Slingshot is not directed at children under 13 (or the applicable age of digital consent in your jurisdiction, which may be up to 16 in some EU member states). We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please submit a request through our [feedback form](/feedback) and we will delete it promptly.

<!-- SECTION: Part D — General provisions -->

## Open source transparency

Slingshot is open source software. You can verify every claim in this Privacy Policy by reading the source code at [GitHub repository](https://github.com/Atia-Farha/Slingshot). We believe transparency is the strongest privacy guarantee.

## Changes to this policy

We may update this Privacy Policy from time to time. When we make material changes, we will:

1. Update the "Last updated" date at the top of this page.
2. Post a notice in our [GitHub repository](https://github.com/Atia-Farha/Slingshot).

Your continued use of Slingshot after changes are posted constitutes acceptance of the updated policy.

## If Slingshot is discontinued

If the Slingshot project is archived, abandoned, or otherwise discontinued:

- **Desktop Application data** remains on your device. Since no data was ever transmitted to us, there is nothing for us to delete or transfer.
- **Website feedback data** will be deleted within 90 days of the project discontinuation announcement, unless we are legally required to retain it longer.
- **This Privacy Policy** will remain available at its current URL for at least one year after discontinuation so you can review what data was collected during the project's lifetime.

## Contact

For privacy-related questions, data access requests, deletion requests, or any concerns about this policy, submit a request through our [feedback form](/feedback) or email us at [slingshot.dev@proton.me](mailto:slingshot.dev@proton.me).
