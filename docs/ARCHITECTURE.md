# Getman Architecture

Getman is organized around a small clean architecture: UI components, business logic, HTTP execution, storage, and desktop integration are separated.

## Goals

- Keep the UI responsive and easy to change
- Avoid giant components
- Keep request preparation separate from rendering
- Store everything locally
- Use TypeScript for frontend safety
- Use Tauri commands for desktop-only capabilities
- Avoid a database

## Layers

```text
UI Components
    ↓
Zustand Workspace Store
    ↓
Business Logic Modules
    ↓
Storage Layer / HTTP Layer
    ↓
Tauri Commands or Browser Dev Fallbacks
```

## UI Layer

Location:

```text
src/components
```

Main components:

- `CollectionsSidebar.tsx`: collections and request history
- `EnvironmentBar.tsx`: environment selection and variable editing
- `RequestBuilder.tsx`: method, URL, params, headers, body, and code generation
- `ResponseViewer.tsx`: response status, body, headers, and cookies
- `ToolsPanel.tsx`: JWT, UUID, Base64, and JSON tools
- `KeyValueEditor.tsx`: reusable editor for key/value rows

The app shell is in:

```text
src/App.tsx
```

The entry point is:

```text
src/main.tsx
```

## State Layer

Location:

```text
src/store/workspace.ts
```

The Zustand store owns:

- Active request
- Theme
- Active environment
- Environments
- Collections
- History
- Hydration state

The store exposes actions for:

- Updating active requests
- Updating headers/query params/body fields
- Saving requests to collections
- Creating, renaming, deleting collections
- Duplicating and deleting saved requests
- Updating environment variables
- Adding request history
- Persisting the workspace

History is capped at 100 entries.

## Types

Location:

```text
src/types/api.ts
```

Important types:

- `HttpMethod`
- `BodyType`
- `KeyValueRow`
- `ApiRequest`
- `ResponseRecord`
- `Collection`
- `CollectionFolder`
- `HistoryEntry`
- `Environment`
- `Workspace`

## Business Logic

Location:

```text
src/lib
```

Modules:

- `factory.ts`: creates initial workspace, requests, environments, and rows
- `variables.ts`: replaces `{{VARIABLE}}` syntax
- `json.tsx`: JSON validation, byte formatting, collapsible JSON rendering
- `exporters.ts`: cURL and code snippet generation
- `tools.ts`: JWT decode, UUID, Base64 helpers
- `http.ts`: request preparation, URL normalization, and request execution
- `storage.ts`: workspace loading/saving through Tauri or browser fallback

## HTTP Flow

The HTTP flow starts in:

```text
src/lib/http.ts
```

High-level process:

1. Resolve environment variables.
2. Normalize the URL.
3. Add query parameters.
4. Build headers.
5. Serialize the request body.
6. Choose the execution path.
7. Convert the response into `ResponseRecord`.

### URL Normalization

Getman adds a protocol when the URL does not include one.

Rules:

- `localhost`, `127.0.0.1`, `0.0.0.0`, and `[::1]` use `http://`
- All other bare URLs use `https://`
- URLs that already include a protocol are unchanged

### Desktop Request Path

In Tauri, the frontend calls:

```text
send_http_request
```

That command is implemented in:

```text
src-tauri/src/lib.rs
```

It uses `reqwest` to send the request outside the browser sandbox. This avoids browser CORS limitations in the desktop app.

### Browser Development Path

In Vite development mode, browser preview requests go through:

```text
/__getman_proxy__
```

The dev proxy is defined in:

```text
vite.config.ts
```

This makes the browser preview usable while developing.

### Browser Fallback

If neither Tauri nor the dev proxy is available, Getman falls back to Axios. In a normal browser production page, Axios is subject to browser CORS rules.

## Storage Flow

Storage is handled in:

```text
src/lib/storage.ts
```

### Tauri Desktop

The frontend calls:

```text
load_workspace
save_workspace
```

These commands are implemented in:

```text
src-tauri/src/lib.rs
```

The desktop app writes:

```text
workspace.json
```

inside the app data directory.

### Browser Development

In browser development mode, storage falls back to:

```text
localStorage
```

Key:

```text
getman.workspace
```

## Tauri Layer

Location:

```text
src-tauri
```

Important files:

- `tauri.conf.json`: app metadata, window settings, icon, build hooks
- `Cargo.toml`: Rust dependencies
- `src/lib.rs`: Tauri commands and app builder
- `src/main.rs`: Tauri entry point
- `icons/icon.png`: app icon

Commands:

- `load_workspace`
- `save_workspace`
- `send_http_request`

## Theme System

Themes are implemented with CSS variables in:

```text
src/styles.css
```

The selected theme is stored in the workspace as:

```ts
theme: "dark" | "light" | "postman" | "sydney"
```

`App.tsx` applies the theme to:

```text
document.documentElement.dataset.theme
```

This keeps theme colors centralized and avoids duplicating component logic.

## Data Persistence Shape

The workspace shape is:

```ts
type Workspace = {
  theme: "dark" | "light" | "postman" | "sydney";
  activeEnvironmentId: string;
  environments: Environment[];
  collections: Collection[];
  history: HistoryEntry[];
  activeRequest: ApiRequest;
};
```

No database migrations are needed yet because the project stores a single JSON document.

## Current Limitations

- Collection move/reorder behavior is not fully implemented yet.
- Folder creation and folder move controls can be expanded.
- Syntax highlighting is currently lightweight; a full editor such as Monaco or CodeMirror could improve the body editor.
- Desktop packaging depends on platform-specific Tauri prerequisites.
- Browser preview is a development target, not the privacy/security model for production distribution.

## Suggested Next Steps

- Add drag-and-drop for collection/folder/request movement
- Add import/export workspace JSON
- Add request tabs
- Add keyboard shortcuts
- Add test runner support for assertions
- Add Monaco or CodeMirror for richer syntax highlighting
- Add platform-specific generated icons through the Tauri icon pipeline
