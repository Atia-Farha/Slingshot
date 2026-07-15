# Slingshot

Desktop app for opening a project's development environment with one click.

[![Netlify Status](https://api.netlify.com/api/v1/badges/fccaf1c8-0e03-4bd5-b2e4-9d64873cd824/deploy-status)](https://app.netlify.com/projects/slingshot-go/deploys)

## Requirements

- Node.js 22 or newer- pnpm 10 or newer
- Stable Rust toolchain with `rustfmt` and `clippy`
- [Tauri system dependencies](https://v2.tauri.app/start/prerequisites/) for your OS

## Setup

```sh
pnpm install
pnpm tauri dev
```

## Quality checks

```sh
pnpm check
cd src-tauri
cargo fmt --check
cargo clippy --all-targets --all-features -- -D warnings
cargo test
```

Production desktop build:

```sh
pnpm tauri build
```
