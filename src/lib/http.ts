import axios, { AxiosError } from "axios";
import { invoke } from "@tauri-apps/api/core";
import type { ApiRequest, Environment, KeyValueRow, ResponseRecord } from "../types/api";
import { resolveVariables } from "./variables";

function activeRows(rows: KeyValueRow[]) {
  return rows.filter((row) => row.enabled && row.key.trim());
}

function buildBody(request: ApiRequest, environment?: Environment) {
  if (["GET", "HEAD"].includes(request.method)) return undefined;
  if (request.body.type === "json") return request.body.content.trim() ? JSON.parse(resolveVariables(request.body.content, environment)) : undefined;
  if (request.body.type === "raw") return resolveVariables(request.body.content, environment);

  const params = new URLSearchParams();
  activeRows(request.body.fields).forEach((row) => params.append(row.key, resolveVariables(row.value, environment)));
  return params;
}

export function normalizeUrl(input: string) {
  const trimmed = input.trim();
  if (!trimmed) throw new Error("Enter a request URL.");
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)) return trimmed;
  if (/^(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])(?::\d+)?(?:\/|$)/i.test(trimmed)) {
    return `http://${trimmed}`;
  }
  return `https://${trimmed}`;
}

function isTauriRuntime() {
  return "__TAURI_INTERNALS__" in window;
}

function serializeBody(data: unknown) {
  if (data === undefined) return undefined;
  if (data instanceof URLSearchParams) return data.toString();
  if (typeof data === "string") return data;
  return JSON.stringify(data);
}

function parseBody(rawBody: string, contentType = "") {
  if (!contentType.toLowerCase().includes("json")) return rawBody;
  try {
    return JSON.parse(rawBody);
  } catch {
    return rawBody;
  }
}

export function prepareRequest(request: ApiRequest, environment?: Environment) {
  const url = new URL(normalizeUrl(resolveVariables(request.url, environment)));
  activeRows(request.queryParams).forEach((row) => url.searchParams.set(row.key, resolveVariables(row.value, environment)));

  const headers = Object.fromEntries(
    activeRows(request.headers).map((row) => [row.key, resolveVariables(row.value, environment)])
  );

  if (request.body.type === "urlencoded") headers["Content-Type"] = "application/x-www-form-urlencoded";
  if (request.body.type === "json" && !headers["Content-Type"]) headers["Content-Type"] = "application/json";

  return {
    url: url.toString(),
    headers,
    data: buildBody(request, environment)
  };
}

function responseSize(data: unknown, headers: Record<string, string>) {
  const headerBytes = new Blob([JSON.stringify(headers)]).size;
  const bodyBytes = typeof data === "string" ? new Blob([data]).size : new Blob([JSON.stringify(data ?? "")]).size;
  return headerBytes + bodyBytes;
}

export async function sendApiRequest(request: ApiRequest, environment?: Environment): Promise<ResponseRecord> {
  const start = performance.now();
  const prepared = prepareRequest(request, environment);
  const body = serializeBody(prepared.data);

  try {
    if (isTauriRuntime()) {
      const response = await invoke<ResponseRecord>("send_http_request", {
        request: {
          method: request.method,
          url: prepared.url,
          headers: prepared.headers,
          body
        }
      });
      return response;
    }

    if (import.meta.env.DEV) {
      const proxyResponse = await fetch("/__getman_proxy__", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: request.method,
          url: prepared.url,
          headers: prepared.headers,
          body
        })
      });

      if (proxyResponse.ok) {
        return (await proxyResponse.json()) as ResponseRecord;
      }
    }

    const response = await axios.request({
      method: request.method,
      url: prepared.url,
      headers: prepared.headers,
      data: prepared.data,
      validateStatus: () => true
    });
    const timeMs = Math.round(performance.now() - start);
    const headers = response.headers as Record<string, string>;

    return {
      status: response.status,
      statusText: response.statusText,
      timeMs,
      sizeBytes: responseSize(response.data, headers),
      headers,
      cookies: String(headers["set-cookie"] ?? "").split(",").filter(Boolean),
      body: response.data,
      rawBody: typeof response.data === "string" ? response.data : JSON.stringify(response.data, null, 2)
    };
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.message === "Network Error") {
      throw new Error("The browser preview could not reach this URL. In the desktop app Getman sends requests through Tauri to avoid browser CORS limits.");
    }
    throw new Error(axiosError.message);
  }
}
