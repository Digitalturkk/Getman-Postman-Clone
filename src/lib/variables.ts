import type { Environment } from "../types/api";

export function resolveVariables(input: string, environment?: Environment) {
  const values = new Map(
    environment?.variables.filter((row) => row.enabled && row.key).map((row) => [row.key, row.value]) ?? []
  );

  return input.replace(/\{\{\s*([A-Z0-9_.-]+)\s*\}\}/gi, (_, key: string) => values.get(key) ?? "");
}
