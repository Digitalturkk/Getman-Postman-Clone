import type { ApiRequest, Environment } from "../types/api";
import { prepareRequest } from "./http";

function esc(value: string) {
  return value.replace(/'/g, "'\\''");
}

export function toCurl(request: ApiRequest, environment?: Environment) {
  const prepared = prepareRequest(request, environment);
  const parts = [`curl -X ${request.method} '${esc(prepared.url)}'`];
  Object.entries(prepared.headers).forEach(([key, value]) => parts.push(`-H '${esc(key)}: ${esc(value)}'`));
  if (prepared.data !== undefined) {
    const data = typeof prepared.data === "string" ? prepared.data : JSON.stringify(prepared.data);
    parts.push(`--data '${esc(data)}'`);
  }
  return parts.join(" \\\n  ");
}

export function generateSnippet(language: "curl" | "python" | "javascript" | "java", request: ApiRequest, environment?: Environment) {
  const prepared = prepareRequest(request, environment);
  const headers = JSON.stringify(prepared.headers, null, 2);
  const body = prepared.data === undefined ? "" : prepared.data instanceof URLSearchParams ? JSON.stringify(prepared.data.toString()) : JSON.stringify(prepared.data, null, 2);

  if (language === "curl") return toCurl(request, environment);
  if (language === "python") {
    return `import requests\n\nurl = "${prepared.url}"\nheaders = ${headers}\nresponse = requests.request("${request.method}", url, headers=headers${body ? `, json=${body}` : ""})\nprint(response.text)`;
  }
  if (language === "javascript") {
    return `const response = await fetch("${prepared.url}", {\n  method: "${request.method}",\n  headers: ${headers}${body ? `,\n  body: JSON.stringify(${body})` : ""}\n});\n\nconsole.log(await response.text());`;
  }
  return `HttpClient client = HttpClient.newHttpClient();\nHttpRequest request = HttpRequest.newBuilder()\n    .uri(URI.create("${prepared.url}"))\n    .method("${request.method}", ${body ? `HttpRequest.BodyPublishers.ofString("""${body}""")` : "HttpRequest.BodyPublishers.noBody()"})\n    .build();\nHttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());\nSystem.out.println(response.body());`;
}
