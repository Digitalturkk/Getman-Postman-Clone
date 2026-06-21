    # Getman

Getman is an offline-first desktop API testing tool built with React, TypeScript, Vite, TailwindCSS, Zustand, Axios, and Tauri v2. Make as a totaly free and ofline GUI clone of Postman.

## What is included

- Request builder for GET, POST, PUT, PATCH, DELETE, HEAD, and OPTIONS
- Headers, query parameters, JSON/raw/form/urlencoded bodies
- JSON validation and formatted response viewing
- Response status, time, size, headers, cookies, and collapsible JSON body
- Local collections, folders, request duplication, deletion, and history
- Environment variables with `{{BASE_URL}}` style substitution
- cURL export and snippets for Java, Python, JavaScript, and cURL
- Offline tools for JWT decoding, UUID v4, Base64, and JSON formatting
- Dark and light themes
- Tauri command storage backed by a local `workspace.json` file

## Run locally

```bash
npm install --cache ./work/npm-cache
npm run dev
```

## Run as a desktop app

```bash
npm run tauri:dev
```

## Build

```bash
npm run build
npm run tauri:build
```

The app does not require accounts, cloud sync, telemetry, analytics, subscriptions, or a database. In browser development mode it falls back to `localStorage`; in Tauri it stores the workspace as a local JSON file in the app data directory.
