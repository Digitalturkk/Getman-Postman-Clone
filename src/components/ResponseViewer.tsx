import { CircleDot, Timer } from "lucide-react";
import { useMemo, useState } from "react";
import { CollapsibleJson, formatBytes } from "../lib/json";
import type { ResponseRecord } from "../types/api";

type Props = {
  response: ResponseRecord | null;
};

export function ResponseViewer({ response }: Props) {
  const [tab, setTab] = useState<"body" | "headers" | "cookies">("body");
  const isJson = useMemo(() => {
    if (!response) return false;
    return typeof response.body === "object" || response.headers["content-type"]?.includes("json");
  }, [response]);

  if (!response) {
    return (
      <div className="grid h-full place-items-center p-8 text-center text-[var(--text-muted)]">
        <div>
          <CircleDot className="mx-auto mb-3 text-[var(--accent)]" size={28} />
          <div className="font-medium text-[var(--text)]">Send a request to inspect the response.</div>
          <div className="mt-1 text-sm">Body, headers, cookies, status, size, and timing stay local.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-[var(--border)] p-4">
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="rounded px-2 py-1 font-semibold text-white" style={{ background: "var(--success)" }}>{response.status} {response.statusText}</span>
          <span className="inline-flex items-center gap-1 rounded bg-[var(--muted)] px-2 py-1"><Timer size={13} /> {response.timeMs} ms</span>
          <span className="rounded bg-[var(--muted)] px-2 py-1">{formatBytes(response.sizeBytes)}</span>
        </div>
        <div className="mt-4 flex gap-1">
          {(["body", "headers", "cookies"] as const).map((item) => (
            <button key={item} className={tab === item ? "segmented-active rounded px-3 py-1.5 text-sm font-medium" : "rounded px-3 py-1.5 text-sm text-[var(--text-muted)] hover:bg-[var(--muted)]"} onClick={() => setTab(item)}>
              {item[0].toUpperCase() + item.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-4 thin-scrollbar">
        {tab === "body" && (
          <pre className="whitespace-pre-wrap break-words rounded border border-[var(--border)] bg-[var(--surface-subtle)] p-4 font-mono text-sm leading-6">
            {isJson ? <CollapsibleJson data={response.body} /> : response.rawBody}
          </pre>
        )}
        {tab === "headers" && (
          <div className="space-y-2">
            {Object.entries(response.headers).map(([key, value]) => (
              <div className="grid grid-cols-[170px_1fr] gap-3 rounded border border-[var(--border)] p-2 text-sm" key={key}>
                <div className="font-mono text-[var(--accent)]">{key}</div>
                <div className="break-words font-mono text-[var(--text)]">{String(value)}</div>
              </div>
            ))}
          </div>
        )}
        {tab === "cookies" && (
          <div className="space-y-2">
            {response.cookies.length === 0 && <div className="rounded border border-dashed border-[var(--border)] p-4 text-sm text-[var(--text-muted)]">No cookies returned.</div>}
            {response.cookies.map((cookie) => (
              <div className="rounded border border-[var(--border)] p-2 font-mono text-sm" key={cookie}>{cookie}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
