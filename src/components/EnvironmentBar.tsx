import { Plus } from "lucide-react";
import { useMemo } from "react";
import { useWorkspaceStore } from "../store/workspace";

export function EnvironmentBar() {
  const { environments, activeEnvironmentId, setActiveEnvironment, updateEnvironmentVariable, addEnvironmentVariable } = useWorkspaceStore();
  const activeEnvironment = useMemo(() => environments.find((env) => env.id === activeEnvironmentId), [activeEnvironmentId, environments]);

  return (
    <div className="group relative">
      <select className="rounded border border-ink-200 bg-white px-3 py-2 text-sm outline-none dark:border-white/10 dark:bg-ink-900" value={activeEnvironmentId} onChange={(event) => setActiveEnvironment(event.target.value)}>
        {environments.map((env) => (
          <option key={env.id} value={env.id}>
            {env.name}
          </option>
        ))}
      </select>
      <div className="invisible absolute right-0 top-10 z-20 w-96 rounded border border-ink-200 bg-white p-3 opacity-0 shadow-xl transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100 dark:border-white/10 dark:bg-ink-900">
        <div className="mb-2 text-xs font-semibold uppercase text-ink-500">Variables</div>
        <div className="space-y-2">
          {activeEnvironment?.variables.map((row) => (
            <div className="grid grid-cols-[22px_1fr_1fr] gap-2" key={row.id}>
              <input type="checkbox" checked={row.enabled} onChange={(event) => updateEnvironmentVariable(activeEnvironment.id, row.id, { enabled: event.target.checked })} />
              <input className="rounded border border-ink-200 bg-white px-2 py-1 text-xs dark:border-white/10 dark:bg-ink-950" value={row.key} onChange={(event) => updateEnvironmentVariable(activeEnvironment.id, row.id, { key: event.target.value })} />
              <input className="rounded border border-ink-200 bg-white px-2 py-1 text-xs dark:border-white/10 dark:bg-ink-950" value={row.value} onChange={(event) => updateEnvironmentVariable(activeEnvironment.id, row.id, { value: event.target.value })} />
            </div>
          ))}
        </div>
        {activeEnvironment && (
          <button className="mt-3 inline-flex items-center gap-2 rounded border border-ink-200 px-2 py-1 text-xs hover:bg-ink-100 dark:border-white/10 dark:hover:bg-white/10" onClick={() => addEnvironmentVariable(activeEnvironment.id)}>
            <Plus size={13} />
            Variable
          </button>
        )}
      </div>
    </div>
  );
}
