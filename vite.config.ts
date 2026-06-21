import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "getman-dev-proxy",
      configureServer(server) {
        server.middlewares.use("/__getman_proxy__", async (req, res) => {
          if (req.method !== "POST") {
            res.statusCode = 405;
            res.end("Method not allowed");
            return;
          }

          try {
            const chunks: Buffer[] = [];
            for await (const chunk of req) chunks.push(Buffer.from(chunk));
            const payload = JSON.parse(Buffer.concat(chunks).toString("utf8"));
            const startedAt = performance.now();
            const upstream = await fetch(payload.url, {
              method: payload.method,
              headers: payload.headers,
              body: ["GET", "HEAD"].includes(payload.method) ? undefined : payload.body
            });
            const rawBody = await upstream.text();
            const headers = Object.fromEntries(upstream.headers.entries());
            const isJson = upstream.headers.get("content-type")?.includes("json");
            const body = isJson ? JSON.parse(rawBody) : rawBody;
            const sizeBytes = Buffer.byteLength(rawBody) + Buffer.byteLength(JSON.stringify(headers));

            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({
                status: upstream.status,
                statusText: upstream.statusText,
                timeMs: Math.round(performance.now() - startedAt),
                sizeBytes,
                headers,
                cookies: upstream.headers.getSetCookie?.() ?? [],
                body,
                rawBody: isJson ? JSON.stringify(body, null, 2) : rawBody
              })
            );
          } catch (error) {
            res.statusCode = 502;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ message: error instanceof Error ? error.message : "Request failed" }));
          }
        });
      }
    }
  ],
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true
  },
  envPrefix: ["VITE_", "TAURI_"],
  build: {
    target: process.env.TAURI_PLATFORM === "windows" ? "chrome105" : "safari13",
    minify: !process.env.TAURI_DEBUG,
    sourcemap: Boolean(process.env.TAURI_DEBUG)
  }
});
