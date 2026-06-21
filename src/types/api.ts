export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";

export type BodyType = "json" | "raw" | "form-data" | "urlencoded";

export type KeyValueRow = {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
};

export type RequestBody = {
  type: BodyType;
  content: string;
  fields: KeyValueRow[];
};

export type ApiRequest = {
  id: string;
  name: string;
  method: HttpMethod;
  url: string;
  headers: KeyValueRow[];
  queryParams: KeyValueRow[];
  body: RequestBody;
};

export type ResponseRecord = {
  status: number;
  statusText: string;
  timeMs: number;
  sizeBytes: number;
  headers: Record<string, string>;
  cookies: string[];
  body: unknown;
  rawBody: string;
};

export type CollectionRequest = ApiRequest & {
  kind: "request";
};

export type CollectionFolder = {
  id: string;
  kind: "folder";
  name: string;
  requests: CollectionRequest[];
};

export type Collection = {
  id: string;
  name: string;
  folders: CollectionFolder[];
};

export type HistoryEntry = {
  id: string;
  method: HttpMethod;
  url: string;
  timestamp: string;
  request: ApiRequest;
};

export type Environment = {
  id: string;
  name: string;
  variables: KeyValueRow[];
};

export type Workspace = {
  theme: "dark" | "light" | "postman" | "sydney";
  activeEnvironmentId: string;
  environments: Environment[];
  collections: Collection[];
  history: HistoryEntry[];
  activeRequest: ApiRequest;
};
