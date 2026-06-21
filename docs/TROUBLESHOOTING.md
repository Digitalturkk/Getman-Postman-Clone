# ApiForge Troubleshooting

This document covers common problems while running, developing, or packaging ApiForge.

## Network Error

### Symptom

The app shows:

```text
Network Error
```

or the request fails even though the URL looks correct.

### Why It Happens

In a normal browser, requests can be blocked by CORS. Axios reports many of those failures as `Network Error`, which is not very helpful.

### What ApiForge Does

ApiForge has two safer request paths:

- Browser development mode uses the local Vite proxy at `/__apiforge_proxy__`
- Desktop mode uses the Tauri `send_http_request` command with native Rust HTTP

The desktop app is the intended production target and avoids browser CORS restrictions.

### What To Check

Confirm the dev server is running:

```bash
npm run dev
```

Confirm the app URL:

```text
http://localhost:1420
```

Try a known public API:

```text
jsonplaceholder.typicode.com/todos/1
```

ApiForge should normalize it to:

```text
https://jsonplaceholder.typicode.com/todos/1
```

## URL Does Not Work Without https://

ApiForge normalizes URLs before sending.

Examples:

```text
example.com/api
```

becomes:

```text
https://example.com/api
```

Localhost examples:

```text
localhost:3000/api
127.0.0.1:8000/users
```

become:

```text
http://localhost:3000/api
http://127.0.0.1:8000/users
```

If a variable is used at the beginning of the URL, normalization happens after variables are resolved.

## Send Button Is Disabled

The most common reason is invalid JSON in the body editor.

Fix the JSON or switch to another body type.

GET and HEAD requests do not send a body, so JSON validation should not block those methods.

## npm Install Permission Error

### Symptom

```text
Your cache folder contains root-owned files
```

or:

```text
EPERM
```

### Fix

Use a workspace-local npm cache:

```bash
npm install --cache ./work/npm-cache
```

This avoids changing global npm permissions.

## Cargo Permission Error

### Symptom

Cargo fails while downloading or opening crates under:

```text
~/.cargo
```

### Fix

Use a workspace-local Cargo cache:

```bash
cd src-tauri
CARGO_HOME=../work/cargo-home cargo check
```

## Tauri Info Says Xcode Is Missing

### Symptom

On macOS:

```text
Xcode: not installed
```

### Meaning

Xcode Command Line Tools may be installed, but full macOS app bundling can require Xcode.

### Fix

Install Xcode from the App Store or Apple Developer downloads, then rerun:

```bash
npm run tauri:build
```

## Rust Or Cargo Missing

### Symptom

```text
rustc: not installed
Cargo: not installed
```

### Fix

Install Rust with rustup:

```text
https://rustup.rs
```

Then verify:

```bash
rustc --version
cargo --version
```

## Frontend Build Fails

Run:

```bash
npm run build
```

If dependencies are missing:

```bash
npm install --cache ./work/npm-cache
```

If TypeScript reports an error, fix the referenced file and rerun the build.

## Tauri Rust Check

Use:

```bash
cd src-tauri
CARGO_HOME=../work/cargo-home cargo check
```

This validates the Rust commands without creating a full app bundle.

## App Icon Does Not Appear

The icon source is:

```text
src-tauri/icons/icon.png
public/icon.png
```

The Tauri config points at:

```json
"icon": ["icons/icon.png"]
```

If platform-specific icons are required, generate them through Tauri's icon tooling and update `tauri.conf.json`.

## Workspace Data Location

### Desktop

Tauri stores:

```text
workspace.json
```

in the app data directory.

The exact directory depends on the operating system.

### Browser Development

Browser preview stores data in:

```text
localStorage
```

under:

```text
apiforge.workspace
```

Clear browser storage if you want to reset the browser preview workspace.

## Reset The Workspace In Browser Preview

Open the browser developer console and run:

```js
localStorage.removeItem("apiforge.workspace");
location.reload();
```

This only affects browser preview data.

## Port Already In Use

The Vite dev server defaults to:

```text
1420
```

If the port is busy, stop the existing process or run Vite on another port:

```bash
npm run dev -- --port 1421
```

Remember that Tauri config expects `1420` unless you update `src-tauri/tauri.conf.json`.

## Production Browser Build And CORS

ApiForge is a desktop app. The browser build is useful for development and UI previews.

If you host the browser build as a website, requests will be subject to normal browser CORS rules unless you provide your own backend proxy.
