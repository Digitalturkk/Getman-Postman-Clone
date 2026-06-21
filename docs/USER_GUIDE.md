# Getman User Guide

This guide explains how to use Getman as an offline-first API testing client.

## Workspace Overview

The main screen has three working areas:

- Left sidebar: collections and request history
- Center panel: request builder
- Right panel: response viewer

The top bar contains:

- Active environment selector
- Theme selector
- Developer tools button

## Request Builder

The request builder lets you configure an HTTP request before sending it.

### Supported Methods

Getman supports:

- `GET`
- `POST`
- `PUT`
- `PATCH`
- `DELETE`
- `HEAD`
- `OPTIONS`

### URL Input

You can enter a full URL:

```text
https://api.example.com/users
```

You can also omit the protocol:

```text
api.example.com/users
```

Getman will automatically convert it to:

```text
https://api.example.com/users
```

For local development, Getman uses `http://`:

```text
localhost:3000/users
```

becomes:

```text
http://localhost:3000/users
```

### Query Parameters

Use the `Query Params` tab to add URL parameters.

Example:

| Key | Value |
| --- | --- |
| page | 1 |
| limit | 20 |

For:

```text
https://api.example.com/users
```

Getman sends:

```text
https://api.example.com/users?page=1&limit=20
```

Use the checkbox beside each row to enable or disable it.

### Headers

Use the `Headers` tab to add request headers.

Common examples:

| Key | Value |
| --- | --- |
| Accept | application/json |
| Authorization | Bearer `{{TOKEN}}` |
| Content-Type | application/json |

### Body

Use the `Body` tab for request payloads.

Supported body types:

- JSON
- Raw text
- Form data
- `x-www-form-urlencoded`

JSON bodies are validated before sending for methods that send a body. If the JSON is invalid, Getman shows an error.

GET and HEAD requests ignore the body, so body validation does not block those requests.

## Response Viewer

After sending a request, the response panel shows:

- HTTP status code
- Status text
- Response time
- Response size
- Body
- Headers
- Cookies

### Body Tab

JSON responses are rendered in a readable format with collapsible nodes.

Text responses are shown as plain text.

### Headers Tab

The `Headers` tab lists response headers as key/value rows.

### Cookies Tab

The `Cookies` tab lists cookies returned by the response. If no cookies are returned, the panel shows an empty state.

## Collections

Collections help organize reusable requests.

Getman currently supports this structure:

```text
Collection
└── Folder
    ├── Request
    └── Request
```

You can:

- Create collections
- Rename collections
- Delete collections
- Save the active request
- Duplicate saved requests
- Delete saved requests
- Open a saved request into the builder

Saved requests are stored locally.

## Request History

Getman stores the last 100 requests.

Each history entry includes:

- Method
- URL
- Timestamp
- Full request configuration

Click a history item to load it back into the request builder.

## Environments

Environments let you swap variables without editing every request.

Default environments:

- Local
- Development
- Production

Variables use double braces:

```text
{{BASE_URL}}/users/{{USER_ID}}
```

If the active environment has:

```text
BASE_URL = https://api.example.com
USER_ID = 42
```

Getman sends:

```text
https://api.example.com/users/42
```

You can edit environment variables from the top bar environment menu.

## Code Generation

The `Code` tab can generate snippets for:

- cURL
- Python `requests`
- JavaScript `fetch`
- Java `HttpClient`

Use `Copy cURL` to copy a ready-to-run cURL command.

## Developer Tools

Click the tools button in the top bar to open developer utilities.

### JWT Decoder

Paste a JWT token to decode:

- Header
- Payload
- Expiration

Decoding happens locally. No external service is called.

### UUID Generator

Generate UUID v4 values and copy them.

### Base64 Tool

Encode or decode Base64 text locally.

### JSON Formatter

Paste JSON and choose:

- Format
- Minify
- Validate

Invalid JSON shows an error.

## Themes

Use the theme selector in the top bar.

Available themes:

- Postman
- Dark
- Light
- Sydney Sweeney

The selected theme is saved locally.

## Privacy Expectations

Getman does not require:

- Account login
- Cloud storage
- Synchronization
- Telemetry
- Analytics
- Subscription

The only network activity is the API request you explicitly send.
