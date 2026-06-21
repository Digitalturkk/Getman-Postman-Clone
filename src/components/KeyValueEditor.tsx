import { Plus } from "lucide-react";
import type { KeyValueRow } from "../types/api";

type Props = {
  rows: KeyValueRow[];
  onAdd: () => void;
  onChange: (rowId: string, updates: Partial<KeyValueRow>) => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
};

export function KeyValueEditor({ rows, onAdd, onChange, keyPlaceholder = "Key", valuePlaceholder = "Value" }: Props) {
  return (
    <div className="space-y-2">
      {rows.map((row) => (
        <div className="grid grid-cols-[28px_1fr_1fr] gap-2" key={row.id}>
          <input type="checkbox" checked={row.enabled} onChange={(event) => onChange(row.id, { enabled: event.target.checked })} className="mt-2 h-4 w-4" />
          <input className="rounded border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:shadow-focus" placeholder={keyPlaceholder} value={row.key} onChange={(event) => onChange(row.id, { key: event.target.value })} />
          <input className="rounded border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:shadow-focus" placeholder={valuePlaceholder} value={row.value} onChange={(event) => onChange(row.id, { value: event.target.value })} />
        </div>
      ))}
      <button className="soft-button inline-flex items-center gap-2 rounded border border-[var(--border)] px-3 py-2 text-sm" onClick={onAdd}>
        <Plus size={14} />
        Add row
      </button>
    </div>
  );
}
