import { invoke } from "@tauri-apps/api/core";
import type { Workspace } from "../types/api";

const browserStorageKey = "getman.workspace";

function isTauriRuntime() {
  return "__TAURI_INTERNALS__" in window;
}

export async function loadWorkspaceFile(): Promise<Workspace | null> {
  try {
    if (isTauriRuntime()) {
      const raw = await invoke<string | null>("load_workspace");
      return raw ? (JSON.parse(raw) as Workspace) : null;
    }

    const raw = localStorage.getItem(browserStorageKey);
    return raw ? (JSON.parse(raw) as Workspace) : null;
  } catch (error) {
    console.error("Unable to load workspace", error);
    return null;
  }
}

export async function saveWorkspaceFile(workspace: Workspace): Promise<void> {
  const data = JSON.stringify(workspace, null, 2);

  if (isTauriRuntime()) {
    await invoke("save_workspace", { data });
    return;
  }

  localStorage.setItem(browserStorageKey, data);
}
