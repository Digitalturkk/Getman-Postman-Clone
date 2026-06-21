import { Clock, Copy, Folder, MoreHorizontal, Plus, Send, Trash2 } from "lucide-react";
import { useWorkspaceStore } from "../store/workspace";

export function CollectionsSidebar() {
  const { collections, history, createCollection, renameCollection, deleteCollection, replaceActiveRequest, duplicateRequest, deleteRequest } = useWorkspaceStore();

  return (
    <aside className="sidebar flex w-72 shrink-0 flex-col">
      <div className="flex h-12 items-center justify-between border-b border-[var(--border)] px-3">
        <span className="text-sm font-semibold">Workspace</span>
        <button title="New collection" className="icon-button h-7 w-7" onClick={createCollection}>
          <Plus size={15} />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-3 thin-scrollbar">
        <div className="mb-2 text-xs font-semibold uppercase text-[var(--text-muted)]">Collections</div>
        <div className="space-y-3">
          {collections.map((collection) => (
            <section key={collection.id} className="rounded border border-[var(--border)] bg-[var(--surface-subtle)] p-2">
              <div className="flex items-center gap-2">
                <Folder size={14} className="text-[var(--accent)]" />
                <input className="min-w-0 flex-1 bg-transparent text-sm font-medium outline-none" value={collection.name} onChange={(event) => renameCollection(collection.id, event.target.value)} />
                <button className="rounded p-1 hover:bg-[var(--muted)]" title="Delete collection" onClick={() => deleteCollection(collection.id)}>
                  <Trash2 size={13} />
                </button>
              </div>
              {collection.folders.map((folder) => (
                <div key={folder.id} className="mt-3">
                  <div className="mb-1 flex items-center gap-2 text-xs text-[var(--text-muted)]">
                    <MoreHorizontal size={13} />
                    {folder.name}
                  </div>
                  <div className="space-y-1">
                    {folder.requests.map((request) => (
                      <div className="group flex items-center gap-1 rounded px-2 py-1.5 text-sm hover:bg-[var(--muted)]" key={request.id}>
                        <button className="min-w-0 flex-1 text-left" onClick={() => replaceActiveRequest(request)}>
                          <span className="mr-2 font-mono text-[11px] text-[var(--accent)]">{request.method}</span>
                          <span className="truncate">{request.name}</span>
                        </button>
                        <button className="hidden rounded p-1 group-hover:block" title="Duplicate" onClick={() => duplicateRequest(collection.id, folder.id, request.id)}>
                          <Copy size={12} />
                        </button>
                        <button className="hidden rounded p-1 group-hover:block" title="Delete" onClick={() => deleteRequest(collection.id, folder.id, request.id)}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </section>
          ))}
        </div>

        <div className="mb-2 mt-5 flex items-center gap-2 text-xs font-semibold uppercase text-[var(--text-muted)]">
          <Clock size={13} />
          History
        </div>
        <div className="space-y-1">
          {history.length === 0 && <div className="rounded border border-dashed border-[var(--border)] p-3 text-sm text-[var(--text-muted)]">Requests you send appear here.</div>}
          {history.map((entry) => (
            <button className="block w-full rounded px-2 py-2 text-left text-sm hover:bg-[var(--muted)]" key={entry.id} onClick={() => replaceActiveRequest(entry.request)}>
              <div className="flex items-center gap-2">
                <Send size={12} className="text-[var(--accent)]" />
                <span className="font-mono text-[11px] text-[var(--accent)]">{entry.method}</span>
                <span className="truncate">{entry.url}</span>
              </div>
              <div className="mt-0.5 text-xs text-[var(--text-muted)]">{new Date(entry.timestamp).toLocaleString()}</div>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
