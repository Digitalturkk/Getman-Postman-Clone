import { Clipboard, KeyRound, Shuffle } from "lucide-react";
import { useMemo, useState } from "react";
import { parseJsonSafely } from "../lib/json";
import { base64Decode, base64Encode, decodeJwt, uuidV4 } from "../lib/tools";

async function copy(value: string) {
  await navigator.clipboard.writeText(value);
}

export function ToolsPanel() {
  const [jwt, setJwt] = useState("");
  const [uuid, setUuid] = useState(uuidV4());
  const [base64, setBase64] = useState("");
  const [json, setJson] = useState("{\n  \n}");
  const decodedJwt = useMemo(() => {
    if (!jwt.trim()) return null;
    try {
      return decodeJwt(jwt.trim());
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Invalid JWT" };
    }
  }, [jwt]);
  const parsedJson = useMemo(() => parseJsonSafely(json), [json]);

  return (
    <div className="h-[calc(100vh-3rem)] overflow-auto p-4 thin-scrollbar">
      <section className="mb-5 rounded border border-ink-200 p-3 dark:border-white/10">
        <div className="mb-2 flex items-center gap-2 font-semibold"><KeyRound size={15} /> JWT Decoder</div>
        <textarea className="min-h-24 w-full rounded border border-ink-200 bg-white p-2 font-mono text-sm dark:border-white/10 dark:bg-ink-950" value={jwt} onChange={(event) => setJwt(event.target.value)} placeholder="Paste JWT" />
        {decodedJwt && "error" in decodedJwt && <div className="mt-2 text-sm text-rose-500">{decodedJwt.error}</div>}
        {decodedJwt && !("error" in decodedJwt) && (
          <div className="mt-3 space-y-2">
            <pre className="rounded bg-ink-950 p-2 text-xs text-white">Header: {JSON.stringify(decodedJwt.header, null, 2)}</pre>
            <pre className="rounded bg-ink-950 p-2 text-xs text-white">Payload: {JSON.stringify(decodedJwt.payload, null, 2)}</pre>
            <div className="text-sm text-ink-500">Expiration: {decodedJwt.expiration}</div>
          </div>
        )}
      </section>

      <section className="mb-5 rounded border border-ink-200 p-3 dark:border-white/10">
        <div className="mb-2 flex items-center gap-2 font-semibold"><Shuffle size={15} /> UUID v4</div>
        <div className="flex gap-2">
          <input className="min-w-0 flex-1 rounded border border-ink-200 bg-white px-2 py-2 font-mono text-sm dark:border-white/10 dark:bg-ink-950" value={uuid} readOnly />
          <button className="rounded border border-ink-200 p-2 dark:border-white/10" onClick={() => copy(uuid)} title="Copy UUID"><Clipboard size={15} /></button>
          <button className="rounded bg-sky-500 px-3 py-2 text-sm font-semibold text-white" onClick={() => setUuid(uuidV4())}>Generate</button>
        </div>
      </section>

      <section className="mb-5 rounded border border-ink-200 p-3 dark:border-white/10">
        <div className="mb-2 font-semibold">Base64</div>
        <textarea className="min-h-20 w-full rounded border border-ink-200 bg-white p-2 font-mono text-sm dark:border-white/10 dark:bg-ink-950" value={base64} onChange={(event) => setBase64(event.target.value)} />
        <div className="mt-2 flex gap-2">
          <button className="rounded border border-ink-200 px-3 py-2 text-sm dark:border-white/10" onClick={() => setBase64(base64Encode(base64))}>Encode</button>
          <button className="rounded border border-ink-200 px-3 py-2 text-sm dark:border-white/10" onClick={() => setBase64(base64Decode(base64))}>Decode</button>
          <button className="rounded border border-ink-200 px-3 py-2 text-sm dark:border-white/10" onClick={() => copy(base64)}>Copy</button>
        </div>
      </section>

      <section className="rounded border border-ink-200 p-3 dark:border-white/10">
        <div className="mb-2 font-semibold">JSON Formatter</div>
        <textarea className="min-h-36 w-full rounded border border-ink-200 bg-white p-2 font-mono text-sm dark:border-white/10 dark:bg-ink-950" value={json} onChange={(event) => setJson(event.target.value)} />
        {parsedJson.error && <div className="mt-2 text-sm text-rose-500">JSON error: {parsedJson.error}</div>}
        <div className="mt-2 flex gap-2">
          <button className="rounded border border-ink-200 px-3 py-2 text-sm dark:border-white/10" disabled={Boolean(parsedJson.error)} onClick={() => setJson(JSON.stringify(parsedJson.value, null, 2))}>Format</button>
          <button className="rounded border border-ink-200 px-3 py-2 text-sm dark:border-white/10" disabled={Boolean(parsedJson.error)} onClick={() => setJson(JSON.stringify(parsedJson.value))}>Minify</button>
          <button className="rounded border border-ink-200 px-3 py-2 text-sm dark:border-white/10" onClick={() => copy(json)}>Copy</button>
        </div>
      </section>
    </div>
  );
}
