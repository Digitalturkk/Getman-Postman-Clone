# Getman

![User Guide](src-tauri/icons/icon.png)
Getman is an offline-first desktop API testing tool inspired by Postman and Insomnia. It is built for backend developers, students, QA engineers, and DevOps engineers who want a fast local client without accounts, sync, telemetry, subscriptions, analytics, or a database.

Getman stores everything locally. In the Tauri desktop app, workspace data is saved as a JSON file in the app data directory. In browser development mode, it falls back to `localStorage`.

## Highlights

- Offline-first API testing with no account requirement
- Request builder for `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, and `OPTIONS`
- Headers, query parameters, JSON body, raw text body, form data, and `x-www-form-urlencoded`
- Automatic URL normalization: `example.com/api` becomes `https://example.com/api`
- Localhost-friendly URLs: `localhost:3000/api` becomes `http://localhost:3000/api`
- Environment variables such as `{{BASE_URL}}`, `{{TOKEN}}`, and `{{USER_ID}}`
- Response viewer with status, timing, size, body, headers, and cookies
- Pretty JSON rendering with collapsible nodes
- Collections, folders, saved requests, duplication, deletion, and local history
- Last 100 requests stored in history
- cURL export and code snippets for Java, Python, JavaScript, and cURL
- Developer tools for JWT decoding, UUID v4, Base64, and JSON formatting
- Themes: Postman, Dark, Light, and Sydney Sweeney
- Tauri-native HTTP path to avoid browser CORS limits in the desktop app
- Local dev proxy for browser preview testing

## Tech Stack

| Area | Technology |
| --- | --- |
| Frontend | React, TypeScript, Vite |
| Styling | TailwindCSS and CSS theme variables |
| State | Zustand |
| Desktop | Tauri v2 |
| Storage | Local JSON file through Tauri commands |
| HTTP | Axios in browser fallback, Tauri-native request command for desktop |
| Utilities | Browser-native crypto and encoding APIs |

## Project Structure

```text
.
├── docs/
│   ├── ARCHITECTURE.md
│   ├── TROUBLESHOOTING.md
│   └── USER_GUIDE.md
├── public/
│   └── icon.png
├── src/
│   ├── components/
│   ├── lib/
│   ├── store/
│   ├── types/
│   ├── App.tsx
│   ├── main.tsx
│   └── styles.css
├── src-tauri/
│   ├── icons/
│   ├── src/
│   ├── Cargo.toml
│   └── tauri.conf.json
├── package.json
└── vite.config.ts
```

## Documentation

- [User Guide](docs/USER_GUIDE.md) explains how to use requests, responses, environments, collections, history, themes, and tools.
- [Architecture](docs/ARCHITECTURE.md) explains the frontend, state, HTTP, storage, and Tauri layers.
- [Troubleshooting](docs/TROUBLESHOOTING.md) covers network errors, CORS, dependency caches, Rust/Tauri setup, and build issues.

## Requirements

For browser development:

- Node.js
- npm

For desktop development:

- Rust and Cargo
- Tauri prerequisites for your platform
- macOS app bundling requires Xcode, not only Xcode Command Line Tools

## Install

```bash
npm install
```

If your global npm cache has permission problems, use a workspace-local cache:

```bash
npm install --cache ./work/npm-cache
```

## Run Browser Preview

```bash
npm run dev
```

The Vite app runs at:

```text
http://localhost:1420
```

In browser preview mode, ApiForge uses a local Vite proxy for requests so normal testing is not blocked by browser CORS. This proxy is a development convenience only; the production desktop app uses Tauri-native HTTP.

## Run Desktop App

```bash
npm run tauri:dev
```

This starts the Vite frontend and launches the Tauri desktop shell.

## Build

Build the frontend:

```bash
npm run build
```

Build the desktop app:

```bash
npm run tauri:build
```

Platform bundling may require extra native tooling. On macOS, install Xcode for full app bundle generation.

## Verify

Useful checks:

```bash
npm run build
cd src-tauri
CARGO_HOME=../work/cargo-home cargo check
```

The local Cargo cache command is helpful when the system Cargo cache is not writable.

## Core Workflows

### Send A Request

1. Select a method such as `GET` or `POST`.
2. Enter a URL.
3. Add query parameters, headers, or body data.
4. Click `Send`.
5. Read the response status, time, size, body, headers, and cookies.

Getman automatically adds a protocol when the URL is missing one:

```text
jsonplaceholder.typicode.com/todos/1
```

becomes:

```text
https://jsonplaceholder.typicode.com/todos/1
```

Local URLs are treated as HTTP:

```text
localhost:3000/api/users
```

becomes:

```text
http://localhost:3000/api/users
```

### Use Environment Variables

Variables are written with double braces:

```text
{{BASE_URL}}/users/{{USER_ID}}
```

If the active environment contains:

```text
BASE_URL = https://api.example.com
USER_ID = 42
```

Getman sends:

```text
https://api.example.com/users/42
```

### Export cURL

Open the `Code` tab and choose `cURL`, or use `Copy cURL` for a one-click copy.

### Generate Code

ApiForge can generate snippets for:

- cURL
- Python `requests`
- JavaScript `fetch`
- Java `HttpClient`

## Themes

ApiForge includes four themes:

- `Postman`: dark, orange-accented, dense workbench
- `Dark`: dark blue/black developer theme
- `Light`: bright neutral interface
- `Sydney Sweeney`: blue/orange space-inspired palette based on the supplied app icon

Themes are stored in the workspace and persist locally.

## App Icon

The app icon is stored in:

```text
src-tauri/icons/icon.png
public/icon.png
```

`src-tauri/tauri.conf.json` points the app bundle at the Tauri icon file.

## Offline And Privacy Model

ApiForge is designed to be private by default:

- No user accounts
- No cloud synchronization
- No telemetry
- No analytics
- No subscriptions
- No database
- No remote config

Requests are sent only when the user clicks `Send`. Developer utilities such as JWT decode, UUID generation, Base64, and JSON formatting run locally.

## Current Notes

- Browser preview is useful for development, but the intended production target is the Tauri desktop app.
- The Tauri app uses native HTTP so it can avoid browser CORS restrictions.
- Workspaces are persisted locally as JSON.
- This is an early `0.1.0` implementation and is structured for continued feature work.
