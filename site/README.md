# Slingshot Website

The official website for [Slingshot](https://sling-shot.pages.dev) — a free, open-source, cross-platform desktop app that launches your full dev environment (editor, terminals, browser tabs, dev servers) with one click.

> **Live site:** [sling-shot.pages.dev](https://sling-shot.pages.dev)
> **License:** [AGPL v3](https://github.com/Atia-Farha/Slingshot/blob/main/LICENSE)
> **Contributing:** See [CONTRIBUTING.md](../CONTRIBUTING.md)

## Quick Reference

| Task                       | Command                                                     |
| -------------------------- | ----------------------------------------------------------- |
| Install dependencies       | `pnpm install`                                              |
| Start dev server           | `pnpm dev` → `http://localhost:3000`                        |
| Build for production       | `pnpm build`                                                |
| Preview production build   | `pnpm preview`                                              |
| Generate static site       | `pnpm generate`                                             |
| Deploy to Cloudflare Pages | `pnpm generate && npx wrangler pages deploy .output/public` |

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Architecture](#architecture)
- [API (Cloudflare Functions)](#api-cloudflare-functions)
- [Testing](#testing)
- [Deployment](#deployment)
- [CI/CD Pipeline](#cicd-pipeline)
- [SEO & Metadata](#seo--metadata)
- [Accessibility](#accessibility)
- [Performance](#performance)
- [Design System](#design-system)
- [Troubleshooting](#troubleshooting)

## Overview

The Slingshot website is the marketing site, download hub, and feedback portal for the Slingshot desktop application. It is a statically-generated **Nuxt 4** application deployed to **Cloudflare Pages** with serverless API endpoints for the feedback form.

### What the site does

- **Landing page** — Hero section, feature showcase, before/after comparison, setup walkthrough, and call-to-action
- **Download page** — Platform-specific installer links (Windows, macOS, Linux)
- **About page** — Project story, core values, creator profile, contributors teaser
- **Feedback form** — Validated form with Cloudflare Turnstile bot protection, stored in Cloudflare D1, with optional email notifications via Resend
- **Contributors page** — Live GitHub API integration showing top 100 contributors with search and pagination
- **Legal pages** — Privacy Policy, Terms of Service, License (AGPL v3), Security Policy, Code of Conduct — all rendered from Markdown

### How it works

```
User → Cloudflare CDN → Static HTML/CSS/JS (pre-rendered by Nuxt)
                    ↓
            /api/feedback → Cloudflare Pages Function → D1 + Resend
```

The site is fully static except for the feedback API. Nuxt generates HTML at build time, Cloudflare Pages serves it globally with low latency, and the feedback endpoint runs as a serverless function.

## Tech Stack

| Layer          | Technology                                                           | Purpose                                          |
| -------------- | -------------------------------------------------------------------- | ------------------------------------------------ |
| Framework      | [Nuxt 4](https://nuxt.com)                                           | Vue 3 meta-framework with static generation      |
| UI             | Vue 3 Composition API (JavaScript)                                   | Component system and reactivity                  |
| Styling        | [Tailwind CSS 4.3](https://tailwindcss.com)                          | Utility-first CSS via Vite plugin                |
| Markdown       | [markdown-it](https://github.com/markdown-it/markdown-it)            | Legal page content rendering                     |
| Sitemap        | [@nuxtjs/sitemap](https://nuxt.com/modules/sitemap)                  | Auto-generated `/sitemap.xml`                    |
| Hosting        | [Cloudflare Pages](https://pages.cloudflare.com)                     | Global CDN, static hosting, serverless functions |
| API            | Cloudflare Pages Functions                                           | Serverless backend for feedback form             |
| Database       | [Cloudflare D1](https://developers.cloudflare.com/d1/)               | SQLite-compatible database for feedback storage  |
| Bot Protection | [Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/) | CAPTCHA-free bot detection on feedback form      |
| Email          | [Resend](https://resend.com)                                         | Transactional email for feedback notifications   |
| Fonts          | Inter, Anton, JetBrains Mono                                         | Self-hosted woff2 (no external requests)         |

## Project Structure

```
site/
├── app/                          # Nuxt 4 app directory
│   ├── app.vue                   # Root component (NuxtLayout + NuxtPage)
│   ├── error.vue                 # Custom 404 error page
│   ├── assets/
│   │   └── css/
│   │       └── main.css          # Global styles, Tailwind theme, animations
│   ├── components/
│   │   ├── AppNav.vue            # Fixed navbar with mobile menu
│   │   ├── AppFooter.vue         # Site footer with links and watermark
│   │   ├── HeroSection.vue       # Landing page hero
│   │   ├── FeaturesSection.vue   # Feature cards grid
│   │   ├── HowItWorksSection.vue # Before/after comparison
│   │   ├── SetupSection.vue      # 3-step setup walkthrough
│   │   ├── CtaSection.vue        # Final call-to-action
│   │   └── ToastRegion.vue       # Toast notification system
│   ├── composables/
│   │   ├── useMarkdown.js        # Markdown-to-HTML parser with frontmatter
│   │   └── useToast.js           # Toast notification state management
│   ├── layouts/
│   │   └── default.vue           # Default layout (nav, main, footer, toasts)
│   ├── legal/                    # Legal content as Markdown files
│   │   ├── code-of-conduct.md
│   │   ├── license.md
│   │   ├── privacy.md
│   │   ├── security.md
│   │   └── terms.md
│   └── pages/                    # File-based routing (Nuxt convention)
│       ├── index.vue             # Homepage
│       ├── about.vue             # About page
│       ├── download.vue          # Download page
│       ├── feedback.vue          # Feedback form
│       ├── contributors.vue      # Contributors listing
│       ├── privacy.vue           # Privacy policy
│       ├── terms.vue             # Terms of service
│       ├── license.vue           # License (AGPL v3)
│       ├── security.vue          # Security policy
│       └── code-of-conduct.vue   # Code of conduct
├── functions/                    # Cloudflare Pages Functions
│   ├── _middleware.js            # CSP nonce injection middleware
│   ├── api/
│   │   └── feedback.js          # POST /api/feedback handler
│   └── schemas/
│       └── 001_feedback.sql     # D1 database schema
├── public/                       # Static assets (served at /)
│   ├── favicons/                 # Favicon set (ico, png, svg)
│   ├── fonts/                    # Self-hosted woff2 fonts
│   ├── logo.png                  # Slingshot logo (raster)
│   ├── logo.svg                  # Slingshot logo (vector)
│   ├── og-image.png              # Open Graph share image (1200x630)
│   └── robots.txt                # Search engine directives
├── nuxt.config.ts                # Nuxt configuration
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript references (auto-generated)
├── .env.example                  # Environment variable template
└── .gitignore
```

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **pnpm**

### Installation

```bash
# From the repo root
cd site
pnpm install
```

### Environment Variables

Copy the template and fill in your values:

```bash
cp .env.example .env
```

| Variable                         | Where to get it                                                 | Required   | Description                                           |
| -------------------------------- | --------------------------------------------------------------- | ---------- | ----------------------------------------------------- |
| `NUXT_PUBLIC_TURNSTILE_SITE_KEY` | [Cloudflare Dashboard → Turnstile](https://dash.cloudflare.com) | Yes        | Public site key for the feedback form widget          |
| `TURNSTILE_SECRET`               | [Cloudflare Dashboard → Turnstile](https://dash.cloudflare.com) | Yes        | Secret key for server-side verification               |
| `RESEND_API_KEY`                 | [resend.com → API Keys](https://resend.com/api-keys)            | No         | API key for sending feedback notification emails      |
| `RESEND_TO_EMAIL`                | Your email address                                              | No         | Recipient address for feedback notifications          |
| `ALLOWED_ORIGIN`                 | Your prod domain                                                | Yes (prod) | CORS allowlist for the feedback API (comma-separated) |

> **Note:** The site runs without `RESEND_*` variables — feedback is still stored in D1, but no email notification is sent.
> `ALLOWED_ORIGIN` is only consumed by `functions/api/feedback.js` and must be set in the Pages dashboard (not in `.env`). Default if unset: `https://sling-shot.pages.dev`.

### Development

```bash
pnpm dev
```

Starts the Nuxt dev server at [http://localhost:3000](http://localhost:3000).

The dev server supports:

- Hot Module Replacement (HMR) for instant UI updates
- API functions proxied through Nitro's dev server
- Tailwind CSS with the Vite plugin (no separate build step)

### Production Build

```bash
# Build the production bundle
pnpm build

# Preview the production build locally (serves at http://localhost:3000)
pnpm preview

# Generate a fully static site (output in .output/public/)
pnpm generate
```

## Architecture

### Request Flow

```
Browser request
    ↓
Cloudflare CDN (edge caching, security headers)
    ↓
_nuxt/ static assets (immutable, cached 1 year)
fonts/ static assets (immutable, cached 1 year)
    ↓
HTML page (pre-rendered by Nuxt at build time)
    ↓
Middleware (_middleware.js)
    → Generates CSP nonce
    → Injects nonce into <script> and <style> tags
    → Replaces {NONCE} in Content-Security-Policy header
    ↓
API routes (/api/*)
    → Skipped by middleware
    → feedback.js handles POST requests
    → Verifies Turnstile token
    → Validates and sanitizes input
    → Stores in D1 database
    → Sends email via Resend (if configured)
```

### Nuxt Configuration

`nuxt.config.ts` controls:

| Setting                           | Value          | Why                                 |
| --------------------------------- | -------------- | ----------------------------------- |
| `nitro.preset`                    | `"static"`     | Generates static HTML at build time |
| `compatibilityDate`               | `"2025-07-15"` | Nuxt 4 compatibility flag           |
| `devtools.enabled`                | `false`        | Disabled in production              |
| `telemetry`                       | `false`        | No usage telemetry                  |
| `experimental.renderJsonPayloads` | `false`        | Smaller page payloads               |
| `future.compatibilityVersion`     | `4`            | Nuxt 4 mode                         |

### App Entry

`app/app.vue` — minimal root:

```vue
<template>
	<NuxtLayout>
		<NuxtPage />
	</NuxtLayout>
</template>
```

### Layouts

**`layouts/default.vue`** wraps every page with:

1. **Skip-to-content link** — Visible on keyboard focus for accessibility
2. **`<AppNav />`** — Fixed top navigation bar
3. **`<main id="main-content">`** — Page content slot
4. **`<AppFooter />`** — Site footer
5. **`<ToastRegion />`** — Toast notification overlay (fixed bottom-right)

### Pages

| Route              | File                  | Description                                         | Structured Data                               |
| ------------------ | --------------------- | --------------------------------------------------- | --------------------------------------------- |
| `/`                | `index.vue`           | Homepage — Hero, Features, How It Works, Setup, CTA | `WebSite`, `Organization`                     |
| `/about`           | `about.vue`           | Story, values, creator profile, contributors teaser | `AboutPage`, `Organization`, `BreadcrumbList` |
| `/download`        | `download.vue`        | Platform cards (Windows, macOS, Linux)              | `SoftwareApplication`, `BreadcrumbList`       |
| `/feedback`        | `feedback.vue`        | Feedback form with Turnstile validation             | `ContactPage`, `BreadcrumbList`               |
| `/contributors`    | `contributors.vue`    | Live GitHub contributors grid with search           | `BreadcrumbList`                              |
| `/privacy`         | `privacy.vue`         | Privacy policy (rendered from Markdown)             | `WebPage`                                     |
| `/terms`           | `terms.vue`           | Terms of service (rendered from Markdown)           | `WebPage`                                     |
| `/license`         | `license.vue`         | AGPL v3 license summary (rendered from Markdown)    | `WebPage`                                     |
| `/security`        | `security.vue`        | Security policy (rendered from Markdown)            | `WebPage`                                     |
| `/code-of-conduct` | `code-of-conduct.vue` | Code of conduct (rendered from Markdown)            | `WebPage`                                     |

Each page sets its own `useSeoMeta()` tags and `useHead()` with JSON-LD structured data. See [SEO & Metadata](#seo--metadata) for details.

### Components

| Component           | File                               | Description                                                                                                                                                                                    |
| ------------------- | ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AppNav`            | `components/AppNav.vue`            | Fixed top navbar. Desktop: brand + nav links + Download CTA. Mobile: hamburger menu with focus trap (Escape to close, Tab cycling). `aria-label="Main navigation"`, `aria-expanded` on toggle. |
| `AppFooter`         | `components/AppFooter.vue`         | Three-column footer (Product, Community, Legal links), social icons (GitHub, email), copyright, decorative "SLINGSHOT" watermark.                                                              |
| `HeroSection`       | `components/HeroSection.vue`       | Full-screen hero with animated dome glow, "Free & Open Source" badge, headline, description, two CTA buttons.                                                                                  |
| `FeaturesSection`   | `components/FeaturesSection.vue`   | 6 feature cards in a responsive grid. Supports `wide` (2-col) and `tall` (2-row) span variants.                                                                                                |
| `HowItWorksSection` | `components/HowItWorksSection.vue` | Side-by-side comparison: "Before" (red, 10+ min setup grind) vs "After" (teal, 1 click).                                                                                                       |
| `SetupSection`      | `components/SetupSection.vue`      | 3-step numbered walkthrough with connecting lines (desktop) and animated arrows (mobile).                                                                                                      |
| `CtaSection`        | `components/CtaSection.vue`        | Final call-to-action with gradient backgrounds and Download button.                                                                                                                            |
| `ToastRegion`       | `components/ToastRegion.vue`       | Fixed bottom-right toast stack with enter/leave transitions. Success (teal) and error (red) variants.                                                                                          |

### Composables

#### `useMarkdown.js`

Parses Markdown files with YAML frontmatter into HTML:

```js
import rawMd from '~/legal/privacy.md?raw';
import { useMarkdown } from '~/composables/useMarkdown';

const { html, frontmatter } = useMarkdown(rawMd, { date: 'July 17, 2026' });
```

**Features:**

- Extracts YAML frontmatter (`---` delimited)
- Replaces `{{DATE}}` tokens in the body
- Adds `target="_blank" rel="noopener noreferrer"` to external links
- Converts `<!-- SECTION: ... -->` comments into styled divider elements
- Uses `markdown-it` with HTML enabled and linkify

#### `useToast.js`

Global toast notification system:

```js
const { success, error, remove, toasts } = useToast();

success('Saved successfully!'); // Auto-dismiss after 6s
error('Something went wrong.', 10000); // Custom duration
remove(toastId); // Manual dismiss
```

**API:**

| Method                          | Parameters                               | Description                     |
| ------------------------------- | ---------------------------------------- | ------------------------------- |
| `success(message, duration?)`   | `string`, `number` (default: 6000)       | Show a success toast            |
| `error(message, duration?)`     | `string`, `number` (default: 6000)       | Show an error toast             |
| `add(message, type, duration?)` | `string`, `"success"\|"error"`, `number` | Show a toast of any type        |
| `remove(id)`                    | `number`                                 | Dismiss a toast by ID           |
| `toasts`                        | `Ref<Array>`                             | Reactive array of active toasts |

State is shared via module-level `ref` (singleton across all components).

### Styling

`assets/css/main.css` defines the complete design system.

#### Design Tokens (Tailwind `@theme`)

| Token                    | Value                    | Usage                                 |
| ------------------------ | ------------------------ | ------------------------------------- |
| `--color-jet`            | `#050505`                | Page background                       |
| `--color-panel`          | `#0a0a0b`                | Card/panel background                 |
| `--color-surface`        | `#131316`                | Input backgrounds, code blocks        |
| `--color-primary`        | `#14D8D4`                | Accent color (teal) — brand identity  |
| `--color-primary-dim`    | `#14D8D420`              | Primary at 12% opacity (glows, tints) |
| `--color-danger`         | `#EF4444`                | Error states, destructive actions     |
| `--color-text-primary`   | `#F0F0F2`                | Headings, primary text                |
| `--color-text-secondary` | `#A0A0A8`                | Body text, descriptions               |
| `--color-text-muted`     | `#76767A`                | Labels, hints, timestamps             |
| `--color-border`         | `rgba(255,255,255,0.06)` | Default borders                       |
| `--color-border-hover`   | `rgba(255,255,255,0.12)` | Hover/active borders                  |

#### Fonts

| Font           | CSS Variable     | Weights            | Usage                      |
| -------------- | ---------------- | ------------------ | -------------------------- |
| Inter          | `--font-sans`    | 100–900 (variable) | Body text, UI elements     |
| Anton          | `--font-display` | 400                | Headlines, brand name      |
| JetBrains Mono | `--font-mono`    | 100–800 (variable) | Code snippets, inline code |

All fonts are self-hosted as woff2 in `/fonts/` — no external requests to Google Fonts or CDNs.

#### Component Classes

| Class                                               | Description                                                     |
| --------------------------------------------------- | --------------------------------------------------------------- |
| `.section-card`                                     | Panel background with subtle border and `0.75rem` border-radius |
| `.feature-card`                                     | Card with animated gradient border on hover                     |
| `.feature-icon`                                     | Icon container with primary tint background                     |
| `.app-input`                                        | Styled form input with focus/hover states                       |
| `.cta-glow`                                         | Teal glow shadow effect on call-to-action buttons               |
| `.nav-link`                                         | Navigation link with animated underline on hover                |
| `.hamburger`                                        | Animated hamburger/X toggle for mobile menu                     |
| `.grid-overlay`                                     | Subtle 60px grid pattern background                             |
| `.hero-dome`, `.hero-dome-ring`, `.hero-dome-inner` | Layered glow effects for the hero section                       |

#### Animations

| Animation    | Description                       | Trigger                            |
| ------------ | --------------------------------- | ---------------------------------- |
| `fade-in-up` | Fade in + slide up 20px           | Applied with `.animate-fade-in-up` |
| `flow-down`  | Dashed line scrolling downward    | Setup section arrows (mobile)      |
| `float-y`    | Gentle vertical oscillation (4px) | Setup section arrows (mobile)      |
| `spin`       | 360° rotation                     | Creator avatar ring on About page  |

All animations respect `prefers-reduced-motion: reduce` — they are disabled or reduced to 0.01ms.

### Legal Content System

Legal pages follow a Markdown-based content pipeline:

1. Content authored in `app/legal/*.md` with YAML frontmatter
2. Pages import raw Markdown via Vite's `?raw` suffix
3. `useMarkdown()` composable parses Markdown to HTML
4. HTML injected via `v-html` into a styled `<article>` container
5. Scoped `:deep()` CSS styles the rendered content

**Frontmatter format:**

```yaml
---
title: Privacy Policy
description: How Slingshot handles your data...
lastUpdated: 'July 17, 2026'
---
```

**Section dividers** in Markdown:

```markdown
<!-- SECTION: Part A — Desktop Application -->
```

Renders as a styled horizontal rule with uppercase label.

**To edit a legal page:** Edit the `.md` file in `app/legal/`. The corresponding `.vue` page does not need to change unless you modify the `lastUpdated` date or SEO meta.

## API (Cloudflare Functions)

### Feedback Endpoint

```
POST /api/feedback
```

#### Request Pipeline

1. **CORS** — Only `https://sling-shot.pages.dev` allowed
2. **Content-Type** — Must be `application/json`
3. **Body size** — Max 4096 bytes
4. **Turnstile verification** — Server-side token validation with Cloudflare
5. **Server-side validation** — Name, email, type, message (duplicates client checks)
6. **Disposable email blocking** — 20+ known throwaway domains rejected
7. **Sanitization** — `<` and `>` stripped from all string inputs
8. **D1 storage** — Inserted into the appropriate table by type
9. **Email notification** — HTML email sent via Resend (if configured)

#### Request

```bash
curl -X POST https://sling-shot.pages.dev/api/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Developer",
    "email": "jane@example.com",
    "type": "bug",
    "message": "The terminal tab crashes when opening a third instance.",
    "turnstileToken": "YOUR_TURNSTILE_TOKEN"
  }'
```

#### Response (success — `200`)

```json
{
	"success": true
}
```

#### Response (validation error — `422`)

```json
{
	"error": "Validation failed.",
	"errors": {
		"email": "Please use a permanent email address.",
		"message": "Message contains disallowed content."
	}
}
```

#### Response (verification failed — `403`)

```json
{
	"error": "Verification failed. Please try again."
}
```

#### Response (missing binding — `503`)

```json
{
	"error": "Service temporarily unavailable. Please try again later."
}
```

#### All Error Codes

| Status | Meaning                                                   |
| ------ | --------------------------------------------------------- |
| `200`  | Success                                                   |
| `400`  | Invalid request body or missing Turnstile token           |
| `403`  | Turnstile verification failed                             |
| `405`  | Method not allowed (only POST and OPTIONS accepted)       |
| `413`  | Request body too large (> 4096 bytes)                     |
| `415`  | Invalid Content-Type (must be `application/json`)         |
| `422`  | Validation failed (field-level errors in `errors` object) |
| `500`  | D1 insert failed or unexpected server error               |
| `503`  | Required binding missing (D1 or Turnstile secret)         |

#### Feedback Types → Tables

| `type` value | D1 Table    |
| ------------ | ----------- |
| `bug`        | `bugs`      |
| `feature`    | `features`  |
| `feedback`   | `feedback`  |
| `question`   | `questions` |

### Middleware

`functions/_middleware.js` runs on every HTML response (skips `/api/*` routes):

1. Generates a cryptographically random nonce per request (`crypto.randomUUID()`)
2. Injects `nonce` attribute into all `<script>` and `<style>` tags in the HTML
3. Replaces the `{NONCE}` placeholder in the `Content-Security-Policy` header
4. Returns the modified response

This enables a strict CSP without `'unsafe-inline'` — scripts and styles are only allowed if they carry the request-specific nonce.

### Database Schema

`functions/schemas/001_feedback.sql` defines four identical tables:

```sql
CREATE TABLE IF NOT EXISTS bugs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    status TEXT DEFAULT 'new' CHECK(status IN ('new', 'read', 'archived')),
    message TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_bugs_created ON bugs(created_at);
CREATE INDEX IF NOT EXISTS idx_bugs_status ON bugs(status);
```

Identical tables exist for `features`, `feedback`, and `questions`, each with indexes on `created_at` and `status`.

## Testing

### Local Development Testing

```bash
# Start the dev server
pnpm dev

# In another terminal, test the feedback API
curl -X POST http://localhost:3000/api/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "type": "feedback",
    "message": "Testing the feedback form.",
    "turnstileToken": "test-token"
  }'
```

> **Note:** Turnstile verification will fail in local development without valid keys. The D1 binding also requires Cloudflare's local emulation (`wrangler d1`).

### Testing the Feedback API End-to-End

To test the full feedback pipeline locally:

1. **Install Wrangler** (Cloudflare CLI):

    ```bash
    pnpm add -D wrangler
    ```

2. **Create a local D1 database:**

    ```bash
    npx wrangler d1 create slingshot-feedback
    ```

3. **Apply the schema:**

    ```bash
    npx wrangler d1 execute slingshot-feedback --file=functions/schemas/001_feedback.sql
    ```

4. **Run with Wrangler dev** (emulates Cloudflare Functions locally — discovers `functions/` automatically):
    ```bash
    npx wrangler pages dev .output/public --d1=DB=slingshot-feedback --compatibility-date=2025-07-15
    ```
    > `wrangler pages dev` reads Functions from the project root's `functions/` directory, not from the static output. The `.output/public` argument points it at the static assets to serve.

### Testing Legal Content

Legal pages render Markdown at build time. To verify changes:

```bash
# Build and preview
pnpm build && pnpm preview

# Visit each legal page and verify rendering
open http://localhost:3000/privacy
open http://localhost:3000/terms
open http://localhost:3000/license
open http://localhost:3000/security
open http://localhost:3000/code-of-conduct
```

### Testing SEO

After building, verify the sitemap and structured data:

```bash
# Build and preview
pnpm build && pnpm preview

# Check sitemap
curl http://localhost:3000/sitemap.xml

# Check robots.txt
curl http://localhost:3000/robots.txt

# Validate structured data
# Use Google's Rich Results Test: https://search.google.com/test/rich-results
```

## Deployment

### First-Time Cloudflare Pages Setup (runbook)

> Run these steps once per Cloudflare account / project. After the first successful deploy, subsequent deploys only need the `git push` (if connected) or `wrangler pages deploy`.

1. **Create the Pages project**

    ```bash
    npx wrangler pages project create sling-shot --production-branch=main
    ```

2. **Create the D1 database** (or reuse an existing one)

    ```bash
    npx wrangler d1 create slingshot-feedback
    # → copy the printed database_id
    ```

3. **Apply the schema to the remote D1**

    ```bash
    npx wrangler d1 execute slingshot-feedback \
        --file=functions/schemas/001_feedback.sql \
        --remote
    ```

4. **Set the Pages project build configuration** (in the Cloudflare Dashboard → Workers & Pages → sling-shot → Settings → Builds):
    - Build command: `pnpm generate`
    - Build output directory: `.output/public`
    - Root directory: `site` (if deploying from the monorepo root)
    - Compatibility date: `2025-07-15`
    - Environment variables: `NODE_VERSION=20`, `PNPM_VERSION=9`

5. **Bind D1 and set env vars** (Settings → Bindings):
    - **D1 binding** → Variable name: `DB`, D1 database: `slingshot-feedback`
    - **Environment variable** → `NUXT_PUBLIC_TURNSTILE_SITE_KEY` (public)
    - **Environment variable (encrypted)** → `TURNSTILE_SECRET`
    - **Environment variable (encrypted)** → `RESEND_API_KEY`
    - **Environment variable** → `RESEND_TO_EMAIL`
    - **Environment variable** → `ALLOWED_ORIGIN` (e.g. `https://sling-shot.pages.dev`)

6. **Connect Git** (optional but recommended) for automatic deploys on push to `main`.

7. **Add a custom domain** (optional) in Settings → Custom domains.

### Cloudflare Pages

The site deploys to Cloudflare Pages. The build output is a static site served from Cloudflare's global CDN.

```bash
# Generate static output and deploy to Pages
pnpm generate                # writes .output/public/ (Nuxt 4 output dir)
npx wrangler pages deploy .output/public --project-name=sling-shot
```

> **Note:** Nuxt 4 emits static output to `.output/public/`. The repo also has a `dist/` symlink pointing there for backwards compatibility with older tooling — both paths resolve to the same content.

#### Required Cloudflare Bindings

| Binding            | Type                 | Purpose                            |
| ------------------ | -------------------- | ---------------------------------- |
| `DB`               | D1 Database          | Stores feedback submissions        |
| `TURNSTILE_SECRET` | Environment variable | Server-side Turnstile verification |
| `RESEND_API_KEY`   | Environment variable | Email delivery for notifications   |
| `RESEND_TO_EMAIL`  | Environment variable | Recipient for notification emails  |

#### Setting Bindings

In the Cloudflare Dashboard:

1. Go to **Workers & Pages → Slingshot → Settings → Bindings**
2. Add the D1 database binding (name: `DB`)
3. Add environment variables for `TURNSTILE_SECRET`, `RESEND_API_KEY`, `RESEND_TO_EMAIL`, `ALLOWED_ORIGIN`, and `NUXT_PUBLIC_TURNSTILE_SITE_KEY`

Or via `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "slingshot-feedback"
database_id = "your-database-id"

[vars]
TURNSTILE_SECRET = "your-secret"
RESEND_API_KEY = "your-key"
RESEND_TO_EMAIL = "your-email"
```

### Functions Routing (`_routes.json`)

`public/_routes.json` restricts the Pages Functions runtime to `/api/*` only, so static asset requests (`/_nuxt/*`, `/fonts/*`, `/favicons/*`, `/og-image.png`, `/robots.txt`, `/sitemap.xml`, `/llms*.txt`, `/slingshot.txt`, `/.well-known/*`) are served directly from the CDN and never invoke a Worker. This keeps the site inside the **Cloudflare Pages free tier** (100,000 Function requests/day) by preventing every page view from counting against the quota.

```json
{
	"version": 1,
	"include": ["/api/*"],
	"exclude": ["/_nuxt/*", "/fonts/*", "/favicons/*", "/og-image.png", "/robots.txt", "/sitemap.xml", "/llms.txt", "/llms-full.txt", "/slingshot.txt", "/.well-known/*"]
}
```

**Add a new static path?** If you add a new top-level static asset (e.g. `/foo.png`), either (a) add it to `exclude`, or (b) rely on the `include` allowlist. The middleware in `functions/_middleware.js` already short-circuits for `/api/*` paths, but `_routes.json` prevents the Worker from being invoked at all on the CDN edge.

### Security Headers

Applied globally via `nitro.routeRules["/**"]` in `nuxt.config.ts`:

| Header                         | Value                                                      | Purpose                    |
| ------------------------------ | ---------------------------------------------------------- | -------------------------- |
| `Strict-Transport-Security`    | `max-age=63072000; includeSubDomains; preload`             | Force HTTPS for 2 years    |
| `X-Content-Type-Options`       | `nosniff`                                                  | Prevent MIME type sniffing |
| `X-Frame-Options`              | `DENY`                                                     | Prevent clickjacking       |
| `Referrer-Policy`              | `strict-origin-when-cross-origin`                          | Limit referrer information |
| `Permissions-Policy`           | Denies camera, microphone, geolocation, payment, USB, etc. | Block sensitive APIs       |
| `Cross-Origin-Opener-Policy`   | `same-origin`                                              | Isolate browsing context   |
| `Cross-Origin-Resource-Policy` | `same-origin`                                              | Prevent cross-origin reads |
| `Content-Security-Policy`      | Nonce-based (see below)                                    | Prevent XSS                |

**Content-Security-Policy (production):**

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

The `{NONCE}` placeholder is replaced per-request by the middleware with a unique random value.

### Caching Strategy

| Asset Pattern   | Cache-Control                                          | Rationale                                             |
| --------------- | ------------------------------------------------------ | ----------------------------------------------------- |
| `/fonts/**`     | `public, max-age=31536000, immutable`                  | Font files never change (content-hashed filenames)    |
| `/_nuxt/**`     | `public, max-age=31536000, immutable`                  | Nuxt bundles are content-hashed                       |
| `/favicons/**`  | `public, max-age=31536000, immutable`                  | Favicons change rarely                                |
| `/og-image.png` | `public, max-age=604800, stale-while-revalidate=86400` | 7-day cache with 1-day stale-while-revalidate         |
| HTML pages      | No explicit cache header                               | Served from Cloudflare edge (fast, but revalidatable) |

## CI/CD Pipeline

### Build Pipeline

The site uses `pnpm` scripts defined in `package.json`:

```
pnpm dev       → nuxt dev          (local development server)
pnpm build     → nuxt build        (production build)
pnpm generate  → nuxt generate     (static site generation)
pnpm preview   → nuxt preview      (preview production build)
pnpm postinstall → nuxt prepare    (generates TypeScript types)
```

### Deployment Trigger

Deployment to Cloudflare Pages is triggered by:

1. **Manual deploy:**

    ```bash
    pnpm build && npx wrangler pages deploy .output/public
    ```

2. **Git-based deploy** (if connected to Cloudflare Pages in the dashboard):
    - Push to `main` branch triggers automatic deployment
    - Preview deployments are created for pull requests

### Deploy Preview

When connected to a Git repository, Cloudflare Pages automatically creates preview deployments for:

- Every pull request
- Every branch push

Preview URLs follow the pattern: `https://<hash>.slingshot.pages.dev`

## SEO & Metadata

### Per-Page Meta Tags

Every page sets:

| Tag              | Example                                                |
| ---------------- | ------------------------------------------------------ |
| `title`          | `"Slingshot                                            | One-Click Dev Environments"` |
| `description`    | `"Open your editor, terminals, browser tabs..."`       |
| `og:title`       | `"Slingshot — One-Click Dev Environments"`             |
| `og:description` | `"Open your editor, terminals, browser tabs..."`       |
| `og:url`         | `"https://sling-shot.pages.dev/about"`                 |
| `og:image`       | `"https://sling-shot.pages.dev/og-image.png"` (shared) |
| `twitter:card`   | `"summary_large_image"` (shared image)                 |
| `canonical`      | Per-page canonical URL                                 |
| `robots`         | `noindex, nofollow` on 404 page only                   |

### Structured Data (JSON-LD)

| Page         | Schema Types                                  |
| ------------ | --------------------------------------------- |
| Homepage     | `WebSite`, `Organization`                     |
| About        | `AboutPage`, `Organization`, `BreadcrumbList` |
| Download     | `SoftwareApplication`, `BreadcrumbList`       |
| Feedback     | `ContactPage`, `BreadcrumbList`               |
| Contributors | `BreadcrumbList`                              |
| Legal pages  | `WebPage` with `isPartOf` → `WebSite`         |

### Sitemap

Auto-generated at `/sitemap.xml` via `@nuxtjs/sitemap`:

- Change frequency: `weekly`
- Priority: `0.7`
- Last mod: current date (regenerated each build)

### Robots.txt

`public/robots.txt` — allows all crawlers except Bytespider:

```
User-Agent: *
Allow: /

User-Agent: GPTBot
Allow: /

User-Agent: ClaudeBot
Allow: /

User-Agent: Bytespider
Disallow: /

Sitemap: https://sling-shot.pages.dev/sitemap.xml
```

## Accessibility

| Feature             | Implementation                                                                      |
| ------------------- | ----------------------------------------------------------------------------------- |
| Skip to content     | `<a href="#main-content" class="sr-only focus:not-sr-only ...">` in layout          |
| ARIA labels         | `aria-label` on nav, footer, sections, form, buttons                                |
| ARIA live regions   | Toast notifications use `role="log"` and `aria-live="polite"`                       |
| Keyboard navigation | Mobile menu traps Tab focus; Escape closes menu                                     |
| Focus visible       | `outline: 2px solid var(--color-primary)` on all interactive elements               |
| Reduced motion      | All animations disabled when `prefers-reduced-motion: reduce`                       |
| Semantic HTML       | Proper heading hierarchy, `<main>`, `<nav>`, `<footer>`, `<article>`, `role="list"` |
| Screen reader text  | `.sr-only` class for visually hidden content                                        |
| Color contrast      | Text colors meet WCAG AA against `#050505` background                               |

## Performance

### Targets

| Metric                   | Target  | Strategy                                   |
| ------------------------ | ------- | ------------------------------------------ |
| First Contentful Paint   | < 1s    | Static HTML from Cloudflare edge           |
| Largest Contentful Paint | < 2s    | Self-hosted fonts, no external requests    |
| Total Blocking Time      | < 100ms | Minimal JavaScript (Vue + Tailwind only)   |
| Cumulative Layout Shift  | < 0.1   | Preloaded fonts, explicit image dimensions |
| Lighthouse score         | 95+     | All of the above                           |

### Optimizations

- **Self-hosted fonts** — No requests to Google Fonts; woff2 files served with `immutable` cache headers
- **Static generation** — HTML pre-rendered at build time, served from Cloudflare's global CDN
- **Minimal JS** — Only Vue 3 runtime + Tailwind CSS; no analytics, no tracking scripts
- **No external dependencies at runtime** — All assets bundled at build time
- **Image optimization** — `loading="lazy"` on below-fold images; explicit `width`/`height` to prevent CLS
- **Font loading** — `font-display: swap` prevents invisible text during font load
- **CSS** — Tailwind CSS purges unused styles; single CSS file with Vite
- **Security headers** — Applied at the CDN level (no per-request overhead)

### Bundle Size Budget

| Asset                   | Expected Size                             |
| ----------------------- | ----------------------------------------- |
| HTML (per page)         | 5–15 KB                                   |
| CSS                     | 10–20 KB (Tailwind purged)                |
| JavaScript              | 50–80 KB (Vue runtime + minimal app code) |
| Fonts (total)           | ~150 KB (3 woff2 files)                   |
| **Total per page load** | **~250 KB** (before browser caching)      |

## Design System

### Color Palette

| Color          | Hex       | Role                            |
| -------------- | --------- | ------------------------------- |
| Jet Black      | `#050505` | Page background                 |
| Panel          | `#0a0a0b` | Card backgrounds                |
| Surface        | `#131316` | Input backgrounds               |
| Primary        | `#14D8D4` | Accent, CTAs, links, highlights |
| Danger         | `#EF4444` | Errors, destructive states      |
| Text Primary   | `#F0F0F2` | Headings, important text        |
| Text Secondary | `#A0A0A8` | Body text, descriptions         |
| Text Muted     | `#76767A` | Labels, hints, timestamps       |

### Visual Effects

- **Dome glow** — Layered radial gradients creating a semi-circle glow in the hero section
- **Grid overlay** — Subtle 60px grid pattern (`rgba(255,255,255,0.02)`)
- **Gradient borders** — Cards animate a gradient border on hover
- **Glow shadows** — CTA buttons and cards emit teal glow on hover
- **Edge glows** — Horizontal gradient lines at section boundaries

### Typography

| Element    | Font           | Weight  | Transform                 |
| ---------- | -------------- | ------- | ------------------------- |
| Headlines  | Anton          | 400     | uppercase                 |
| Body       | Inter          | 400–600 | none                      |
| Code       | JetBrains Mono | 400     | none                      |
| Labels     | Inter          | 500–600 | uppercase, letter-spacing |
| Navigation | Inter          | 500     | none                      |

### Responsive Breakpoints

| Breakpoint | Width   | Layout Changes                           |
| ---------- | ------- | ---------------------------------------- |
| Base       | 0–639px | Single column, stacked layouts           |
| `sm`       | 640px   | 2-column grids, side-by-side comparisons |
| `md`       | 768px   | 3-column grids, desktop nav visible      |
| `lg`       | 1024px  | Full-width feature cards with spans      |

## Troubleshooting

### Dev server won't start

```bash
# Clear Nuxt cache and restart
rm -rf .nuxt .output node_modules/.cache
pnpm install
pnpm dev
```

### Tailwind styles not loading

Ensure the Vite plugin is configured in `nuxt.config.ts`:

```ts
import tailwindcss from '@tailwindcss/vite';

export default defineNuxtConfig({
	vite: {
		plugins: [tailwindcss()],
	},
});
```

And the CSS file is imported:

```ts
css: ['~/assets/css/main.css'];
```

### API returns 503 "Service temporarily unavailable"

The D1 database or Turnstile secret is not bound. Check:

1. Cloudflare Dashboard → Workers & Pages → Settings → Bindings
2. Ensure `DB` (D1) binding exists
3. Ensure `TURNSTILE_SECRET` environment variable is set

### Feedback form says "Verification failed"

- Turnstile token expired (tokens last ~300 seconds)
- `NUXT_PUBLIC_TURNSTILE_SITE_KEY` doesn't match the `TURNSTILE_SECRET`
- Turnstile widget failed to load (check network, CSP, or browser extensions)

### Fonts look wrong or flash of unstyled text

- Ensure font files exist in `public/fonts/`
- Check that `@font-face` declarations in `main.css` match the file paths
- Font preloads in `nuxt.config.ts` should match the filenames

### Build fails with TypeScript errors

```bash
# Regenerate TypeScript types
npx nuxt prepare

# Retry build
pnpm build
```

### CSP errors in browser console

The middleware generates a new nonce per request. If you see CSP violations:

1. Check that the middleware is running (not bypassed in local dev)
2. Ensure no inline scripts/styles exist without the nonce attribute
3. The Cloudflare Turnstile script is allowed via `frame-src` in the CSP

### Sitemap is missing pages

The sitemap is auto-generated by `@nuxtjs/sitemap`. Ensure:

1. The module is listed in `nuxt.config.ts` modules array
2. The `site.url` is set correctly
3. Pages are not excluded via `robots: "noindex"`

### og-image.png not updating

The OG image is cached for 7 days (`max-age=604800`). To force an update:

1. Deploy a new build (Cloudflare edge cache invalidation happens automatically on deploy)
2. Use a query string: `?v=2` (not recommended for production)
3. Wait for the cache to expire
