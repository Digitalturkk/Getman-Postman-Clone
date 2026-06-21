import { nanoid } from "nanoid";
import type { ApiRequest, Collection, Environment, KeyValueRow, Workspace } from "../types/api";

export const methods = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"] as const;

export function createRow(key = "", value = "", enabled = true): KeyValueRow {
  return { id: nanoid(), key, value, enabled };
}

export function createRequest(name = "Untitled Request"): ApiRequest {
  return {
    id: nanoid(),
    name,
    method: "GET",
    url: "",
    headers: [createRow("Accept", "application/json")],
    queryParams: [],
    body: {
      type: "json",
      content: "{}",
      fields: []
    }
  };
}

export function createEnvironment(name: string, variables: Array<[string, string]> = []): Environment {
  return {
    id: nanoid(),
    name,
    variables: variables.map(([key, value]) => createRow(key, value))
  };
}

export function createInitialWorkspace(): Workspace {
  const local = createEnvironment("Local", [
    ["BASE_URL", "http://localhost:3000"],
    ["TOKEN", ""],
    ["USER_ID", "1"]
  ]);

  return {
    theme: "postman",
    activeEnvironmentId: local.id,
    environments: [
      local,
      createEnvironment("Development", [["BASE_URL", "https://dev.example.test"]]),
      createEnvironment("Production", [["BASE_URL", "https://api.example.com"]])
    ],
    collections: [
      {
        id: nanoid(),
        name: "Getting Started",
        folders: [
          {
            id: nanoid(),
            kind: "folder",
            name: "Users",
            requests: [
              {
                ...createRequest("List Users"),
                kind: "request",
                method: "GET",
                url: "{{BASE_URL}}/users"
              }
            ]
          }
        ]
      }
    ] as Collection[],
    history: [],
    activeRequest: createRequest()
  };
}
