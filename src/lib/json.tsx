import { ChevronRight } from "lucide-react";
import { useState } from "react";

export function parseJsonSafely(value: string) {
  try {
    return { value: JSON.parse(value), error: "" };
  } catch (error) {
    return { value: null, error: error instanceof Error ? error.message : "Invalid JSON" };
  }
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function CollapsibleJson({ data, depth = 0 }: { data: unknown; depth?: number }) {
  const [open, setOpen] = useState(depth < 2);

  if (data === null || typeof data !== "object") {
    return <span className="text-emerald-600 dark:text-emerald-300">{JSON.stringify(data)}</span>;
  }

  const entries = Array.isArray(data) ? data.map((value, index) => [index, value] as const) : Object.entries(data);
  const bracket = Array.isArray(data) ? ["[", "]"] : ["{", "}"];

  return (
    <span>
      <button className="mr-1 inline-flex align-middle text-ink-500" onClick={() => setOpen((value) => !value)}>
        <ChevronRight size={13} className={open ? "rotate-90 transition" : "transition"} />
      </button>
      <span className="text-sky-600 dark:text-sky-300">{bracket[0]}</span>
      {!open && <span className="text-ink-500"> {entries.length} items </span>}
      {open && (
        <span className="block pl-4">
          {entries.map(([key, value]) => (
            <span className="block" key={String(key)}>
              <span className="text-rose-600 dark:text-rose-300">{JSON.stringify(key)}</span>
              <span className="text-ink-500">: </span>
              <CollapsibleJson data={value} depth={depth + 1} />
            </span>
          ))}
        </span>
      )}
      <span className="text-sky-600 dark:text-sky-300">{bracket[1]}</span>
    </span>
  );
}
