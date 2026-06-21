import { nanoid } from "nanoid";
import { create } from "zustand";
import { createInitialWorkspace, createRequest, createRow } from "../lib/factory";
import { loadWorkspaceFile, saveWorkspaceFile } from "../lib/storage";
import type { ApiRequest, Collection, CollectionFolder, CollectionRequest, Environment, HistoryEntry, KeyValueRow, Workspace } from "../types/api";

type WorkspaceStore = Workspace & {
  hydrated: boolean;
  hydrate: () => Promise<void>;
  persist: () => Promise<void>;
  setTheme: (theme: Workspace["theme"]) => void;
  setActiveEnvironment: (id: string) => void;
  updateEnvironment: (id: string, updates: Partial<Environment>) => void;
  updateEnvironmentVariable: (environmentId: string, rowId: string, updates: Partial<KeyValueRow>) => void;
  addEnvironmentVariable: (environmentId: string) => void;
  updateActiveRequest: (updates: Partial<ApiRequest>) => void;
  replaceActiveRequest: (request: ApiRequest) => void;
  addHeader: () => void;
  addQueryParam: () => void;
  addBodyField: () => void;
  updateHeader: (rowId: string, updates: Partial<KeyValueRow>) => void;
  updateQueryParam: (rowId: string, updates: Partial<KeyValueRow>) => void;
  updateBodyField: (rowId: string, updates: Partial<KeyValueRow>) => void;
  saveActiveToCollection: () => void;
  createCollection: () => void;
  renameCollection: (id: string, name: string) => void;
  deleteCollection: (id: string) => void;
  duplicateRequest: (collectionId: string, folderId: string, requestId: string) => void;
  deleteRequest: (collectionId: string, folderId: string, requestId: string) => void;
  addHistory: (entry: Omit<HistoryEntry, "id" | "timestamp">) => void;
};

const initial = createInitialWorkspace();

function requestAsCollectionRequest(request: ApiRequest): CollectionRequest {
  return { ...request, id: nanoid(), kind: "request" };
}

function mutateRequestRows(request: ApiRequest, key: "headers" | "queryParams", rowId: string, updates: Partial<KeyValueRow>) {
  return {
    ...request,
    [key]: request[key].map((row) => (row.id === rowId ? { ...row, ...updates } : row))
  };
}

async function save(snapshot: Workspace) {
  await saveWorkspaceFile(snapshot);
}

export const useWorkspaceStore = create<WorkspaceStore>((set, get) => ({
  ...initial,
  hydrated: false,
  hydrate: async () => {
    const workspace = await loadWorkspaceFile();
    set({ ...(workspace ?? initial), hydrated: true });
  },
  persist: async () => {
    const { hydrated, hydrate, persist, setTheme, setActiveEnvironment, updateEnvironment, updateEnvironmentVariable, addEnvironmentVariable, updateActiveRequest, replaceActiveRequest, addHeader, addQueryParam, addBodyField, updateHeader, updateQueryParam, updateBodyField, saveActiveToCollection, createCollection, renameCollection, deleteCollection, duplicateRequest, deleteRequest, addHistory, ...workspace } = get();
    await save(workspace);
  },
  setTheme: (theme) => set({ theme }),
  setActiveEnvironment: (activeEnvironmentId) => set({ activeEnvironmentId }),
  updateEnvironment: (id, updates) =>
    set((state) => ({
      environments: state.environments.map((env) => (env.id === id ? { ...env, ...updates } : env))
    })),
  updateEnvironmentVariable: (environmentId, rowId, updates) =>
    set((state) => ({
      environments: state.environments.map((env) =>
        env.id === environmentId
          ? { ...env, variables: env.variables.map((row) => (row.id === rowId ? { ...row, ...updates } : row)) }
          : env
      )
    })),
  addEnvironmentVariable: (environmentId) =>
    set((state) => ({
      environments: state.environments.map((env) =>
        env.id === environmentId ? { ...env, variables: [...env.variables, createRow()] } : env
      )
    })),
  updateActiveRequest: (updates) => set((state) => ({ activeRequest: { ...state.activeRequest, ...updates } })),
  replaceActiveRequest: (request) => set({ activeRequest: { ...request, id: nanoid() } }),
  addHeader: () => set((state) => ({ activeRequest: { ...state.activeRequest, headers: [...state.activeRequest.headers, createRow()] } })),
  addQueryParam: () => set((state) => ({ activeRequest: { ...state.activeRequest, queryParams: [...state.activeRequest.queryParams, createRow()] } })),
  addBodyField: () =>
    set((state) => ({
      activeRequest: {
        ...state.activeRequest,
        body: { ...state.activeRequest.body, fields: [...state.activeRequest.body.fields, createRow()] }
      }
    })),
  updateHeader: (rowId, updates) => set((state) => ({ activeRequest: mutateRequestRows(state.activeRequest, "headers", rowId, updates) })),
  updateQueryParam: (rowId, updates) => set((state) => ({ activeRequest: mutateRequestRows(state.activeRequest, "queryParams", rowId, updates) })),
  updateBodyField: (rowId, updates) =>
    set((state) => ({
      activeRequest: {
        ...state.activeRequest,
        body: {
          ...state.activeRequest.body,
          fields: state.activeRequest.body.fields.map((row) => (row.id === rowId ? { ...row, ...updates } : row))
        }
      }
    })),
  saveActiveToCollection: () =>
    set((state) => {
      const collection = state.collections[0] ?? ({ id: nanoid(), name: "Default", folders: [] } satisfies Collection);
      const folder = collection.folders[0] ?? ({ id: nanoid(), kind: "folder", name: "Requests", requests: [] } satisfies CollectionFolder);
      const updatedFolder = { ...folder, requests: [...folder.requests, requestAsCollectionRequest(state.activeRequest)] };
      const updatedCollection = {
        ...collection,
        folders: collection.folders.length ? collection.folders.map((item) => (item.id === folder.id ? updatedFolder : item)) : [updatedFolder]
      };
      return {
        collections: state.collections.length ? state.collections.map((item) => (item.id === collection.id ? updatedCollection : item)) : [updatedCollection]
      };
    }),
  createCollection: () =>
    set((state) => ({
      collections: [...state.collections, { id: nanoid(), name: "New Collection", folders: [{ id: nanoid(), kind: "folder", name: "Requests", requests: [] }] }]
    })),
  renameCollection: (id, name) =>
    set((state) => ({ collections: state.collections.map((collection) => (collection.id === id ? { ...collection, name } : collection)) })),
  deleteCollection: (id) => set((state) => ({ collections: state.collections.filter((collection) => collection.id !== id) })),
  duplicateRequest: (collectionId, folderId, requestId) =>
    set((state) => ({
      collections: state.collections.map((collection) =>
        collection.id !== collectionId
          ? collection
          : {
              ...collection,
              folders: collection.folders.map((folder) => {
                if (folder.id !== folderId) return folder;
                const request = folder.requests.find((item) => item.id === requestId);
                return request ? { ...folder, requests: [...folder.requests, { ...request, id: nanoid(), name: `${request.name} Copy` }] } : folder;
              })
            }
      )
    })),
  deleteRequest: (collectionId, folderId, requestId) =>
    set((state) => ({
      collections: state.collections.map((collection) =>
        collection.id !== collectionId
          ? collection
          : {
              ...collection,
              folders: collection.folders.map((folder) =>
                folder.id === folderId ? { ...folder, requests: folder.requests.filter((request) => request.id !== requestId) } : folder
              )
            }
      )
    })),
  addHistory: (entry) =>
    set((state) => ({
      history: [{ ...entry, id: nanoid(), timestamp: new Date().toISOString() }, ...state.history].slice(0, 100)
    }))
}));
