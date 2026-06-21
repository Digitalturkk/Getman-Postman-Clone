import { Clipboard, Code, Save, Send } from "lucide-react";
import { useMemo, useState } from "react";
import { generateSnippet, toCurl } from "../lib/exporters";
import { methods } from "../lib/factory";
import { normalizeUrl, sendApiRequest } from "../lib/http";
import { parseJsonSafely } from "../lib/json";
import { useWorkspaceStore } from "../store/workspace";
import type { BodyType, ResponseRecord } from "../types/api";
import { KeyValueEditor } from "./KeyValueEditor";

type Props = {
  onResponse: (response: ResponseRecord | null) => void;
};

export function RequestBuilder({ onResponse }: Props) {
  const store = useWorkspaceStore();
  const [tab, setTab] = useState<"params" | "headers" | "body" | "code">("params");
  const [language, setLanguage] = useState<"curl" | "python" | "javascript" | "java">("curl");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const request = store.activeRequest;
  const activeEnvironment = store.environments.find((env) => env.id === store.activeEnvironmentId);
  const bodyWillBeSent = !["GET", "HEAD"].includes(request.method);
  const jsonValidation = useMemo(() => (bodyWillBeSent && request.body.type === "json" && request.body.content.trim() ? parseJsonSafely(request.body.content) : { error: "" }), [bodyWillBeSent, request.body.content, request.body.type]);

  function normalizeVisibleUrl() {
    if (!request.url.trim() || request.url.includes("{{")) return;
    try {
      store.updateActiveRequest({ url: normalizeUrl(request.url) });
    } catch {
      return;
    }
  }

  async function send() {
    setSending(true);
    setError("");
    onResponse(null);
    try {
      const response = await sendApiRequest(request, activeEnvironment);
      store.addHistory({ method: request.method, url: request.url, request });
      onResponse(response);
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "Request failed");
    } finally {
      setSending(false);
    }
  }

  async function copyCurl() {
    await navigator.clipboard.writeText(toCurl(request, activeEnvironment));
  }

  const snippet = useMemo(() => {
    try {
      return generateSnippet(language, request, activeEnvironment);
    } catch (snippetError) {
      return snippetError instanceof Error ? snippetError.message : "Unable to generate snippet";
    }
  }, [activeEnvironment, language, request]);

  return (
    <div className="p-5">
      <div className="mb-4 flex items-center gap-2">
        <input className="min-w-0 flex-1 rounded border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-lg font-semibold outline-none focus:shadow-focus" value={request.name} onChange={(event) => store.updateActiveRequest({ name: event.target.value })} />
        <button className="soft-button inline-flex items-center gap-2 rounded border border-[var(--border)] px-3 py-2 text-sm" onClick={store.saveActiveToCollection}>
          <Save size={15} />
          Save
        </button>
      </div>

      <div className="request-url-bar flex gap-2 rounded p-2">
        <select className="w-32 rounded border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-mono text-sm font-semibold text-[var(--accent)] outline-none" value={request.method} onChange={(event) => store.updateActiveRequest({ method: event.target.value as typeof request.method })}>
          {methods.map((method) => (
            <option key={method} value={method}>
              {method}
            </option>
          ))}
        </select>
        <input className="min-w-0 flex-1 rounded border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-mono text-sm outline-none focus:shadow-focus" placeholder="example.com/api or {{BASE_URL}}/users" value={request.url} onBlur={normalizeVisibleUrl} onChange={(event) => store.updateActiveRequest({ url: event.target.value })} />
        <button className="primary-button inline-flex items-center gap-2 rounded px-4 py-2 text-sm font-semibold disabled:opacity-60" disabled={sending || Boolean(jsonValidation.error)} onClick={send}>
          <Send size={15} />
          {sending ? "Sending" : "Send"}
        </button>
      </div>
      {error && <div className="mt-3 rounded border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">{error}</div>}

      <div className="mt-5 flex gap-1 border-b border-[var(--border)]">
        {(["params", "headers", "body", "code"] as const).map((item) => (
          <button key={item} className={tab === item ? "border-b-2 border-[var(--accent)] px-3 py-2 text-sm font-semibold text-[var(--accent)]" : "px-3 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--text)]"} onClick={() => setTab(item)}>
            {item === "params" ? "Query Params" : item[0].toUpperCase() + item.slice(1)}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {tab === "params" && <KeyValueEditor rows={request.queryParams} onAdd={store.addQueryParam} onChange={store.updateQueryParam} />}
        {tab === "headers" && <KeyValueEditor rows={request.headers} onAdd={store.addHeader} onChange={store.updateHeader} />}
        {tab === "body" && (
          <div className="space-y-4">
            <div className="flex gap-2">
              {(["json", "raw", "form-data", "urlencoded"] as BodyType[]).map((type) => (
                <button key={type} className={request.body.type === type ? "segmented-active rounded px-3 py-1.5 text-sm font-medium" : "rounded border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--text-muted)]"} onClick={() => store.updateActiveRequest({ body: { ...request.body, type } })}>
                  {type}
                </button>
              ))}
            </div>
            {request.body.type === "form-data" || request.body.type === "urlencoded" ? (
              <KeyValueEditor rows={request.body.fields} onAdd={store.addBodyField} onChange={store.updateBodyField} />
            ) : (
              <>
                <textarea className="editor min-h-72 w-full rounded border border-[var(--border)] bg-[var(--surface)] p-3 font-mono text-sm leading-6 outline-none focus:shadow-focus" spellCheck={false} value={request.body.content} onChange={(event) => store.updateActiveRequest({ body: { ...request.body, content: event.target.value } })} />
                {jsonValidation.error && <div className="rounded border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">JSON error: {jsonValidation.error}</div>}
              </>
            )}
          </div>
        )}
        {tab === "code" && (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <select className="rounded border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm" value={language} onChange={(event) => setLanguage(event.target.value as typeof language)}>
                <option value="curl">cURL</option>
                <option value="python">Python requests</option>
                <option value="javascript">JavaScript fetch</option>
                <option value="java">Java HttpClient</option>
              </select>
              <button className="soft-button inline-flex items-center gap-2 rounded border border-[var(--border)] px-3 py-2 text-sm" onClick={copyCurl}>
                <Clipboard size={14} />
                Copy cURL
              </button>
            </div>
            <pre className="code-surface max-h-96 overflow-auto rounded border border-[var(--border)] p-4 text-sm thin-scrollbar"><code><Code size={14} className="mb-2 inline" />{"\n"}{snippet}</code></pre>
          </div>
        )}
      </div>
    </div>
  );
}
