import { PanelRightOpen, Palette, Wrench } from "lucide-react";
import { useEffect, useState } from "react";
import { CollectionsSidebar } from "./components/CollectionsSidebar";
import { EnvironmentBar } from "./components/EnvironmentBar";
import { RequestBuilder } from "./components/RequestBuilder";
import { ResponseViewer } from "./components/ResponseViewer";
import { ToolsPanel } from "./components/ToolsPanel";
import { useWorkspaceStore } from "./store/workspace";
import type { ResponseRecord } from "./types/api";

export default function App() {
  const { hydrate, hydrated, theme, setTheme, persist } = useWorkspaceStore();
  const [response, setResponse] = useState<ResponseRecord | null>(null);
  const [toolsOpen, setToolsOpen] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.classList.toggle("dark", theme !== "light");
  }, [theme]);

  useEffect(() => {
    if (!hydrated) return;
    const unsubscribe = useWorkspaceStore.subscribe(() => {
      void persist();
    });
    return unsubscribe;
  }, [hydrated, persist]);

  if (!hydrated) {
    return <div className="grid h-screen place-items-center bg-[var(--app-bg)] text-[var(--text)]">Opening Getman...</div>;
  }

  return (
    <main className="app-shell flex h-screen overflow-hidden">
      <CollectionsSidebar />
      <section className="flex min-w-0 flex-1 flex-col">
        <header className="topbar flex h-12 items-center justify-between px-3">
          <div className="flex items-center gap-2">
            <img className="h-7 w-7 rounded object-cover shadow-sm" src="/icon.png" alt="Getman" />
            <span className="font-semibold">Getman</span>
            <span className="rounded bg-[var(--muted)] px-2 py-0.5 text-[11px] font-medium text-[var(--text-muted)]">Offline</span>
          </div>
          <div className="flex items-center gap-2">
            <EnvironmentBar />
            <label className="inline-flex items-center gap-2 rounded border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-sm text-[var(--text-muted)]">
              <Palette size={15} />
              <select className="bg-transparent text-[var(--text)] outline-none" value={theme} onChange={(event) => setTheme(event.target.value as typeof theme)}>
                <option value="postman">Postman</option>
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="sydney">Sydney Sweeney</option>
              </select>
            </label>
            <button className="icon-button" onClick={() => setToolsOpen(true)} title="Developer tools">
              <Wrench size={16} />
            </button>
          </div>
        </header>

        <div className="flex min-h-0 flex-1">
          <div className="min-w-[430px] flex-1 overflow-auto thin-scrollbar">
            <RequestBuilder onResponse={setResponse} />
          </div>
          <div className="response-pane w-[48%] min-w-[420px] resize-x overflow-auto">
            <ResponseViewer response={response} />
          </div>
        </div>
      </section>
      {toolsOpen && (
        <aside className="surface-raised w-[420px] border-l border-[var(--border)] shadow-2xl">
          <div className="flex h-12 items-center justify-between border-b border-[var(--border)] px-4">
            <div className="flex items-center gap-2 font-semibold">
              <PanelRightOpen size={16} />
              Tools
            </div>
            <button className="rounded px-2 py-1 text-sm hover:bg-[var(--muted)]" onClick={() => setToolsOpen(false)}>
              Close
            </button>
          </div>
          <ToolsPanel />
        </aside>
      )}
    </main>
  );
}
