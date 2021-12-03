import { INotebook } from "../HOC/UseNotebook/Notebook";

const defaultApiUrl = "http://localhost:5000";
const headers = { "Content-Type": "application/json" };

export function getApiUrl(): string {
  let apiUrl = window.localStorage.getItem("apiUrl");
  if (apiUrl) return apiUrl;
  window.localStorage.setItem("apiUrl", defaultApiUrl);
  return defaultApiUrl;
}

export function setApiUrl(url: string) {
  window.localStorage.setItem("apiUrl", url);
}

export async function notebookFromPdf(
  path: string,
  base64: string
): Promise<INotebook> {
  return fetch(`${getApiUrl()}/notebook/from_pdf`, {
    method: "POST",
    headers: headers,
    body: JSON.stringify({
      path: path,
      base64: base64,
    }),
  })
    .then((response) => response.json())
    .catch((error) => error);
}

export function generation(context: string, query: string): Promise<string> {
  return fetch(`${getApiUrl()}/command/generate`, {
    method: "POST",
    headers: headers,
    body: JSON.stringify({ context, query }),
  }).then((response) => response.json());
}

export function wimage(context: string, query: string): Promise<string> {
  return fetch(`${getApiUrl()}/command/wimage`, {
    method: "POST",
    headers: headers,
    body: JSON.stringify({ context, query }),
  }).then((response) => response.json());
}

export function question(context: string, query: string): Promise<string> {
  return fetch(`${getApiUrl()}/command/question`, {
    method: "POST",
    headers: headers,
    body: JSON.stringify({ context, query }),
  }).then((response) => response.json());
}

export function wsuggestion(context: string, query: string): Promise<string> {
  return fetch(`${getApiUrl()}/command/wsuggestion`, {
    method: "POST",
    headers: headers,
    body: JSON.stringify({ context, query }),
  }).then((response) => response.json());
}

export function wsummary(context: string, query: string): Promise<string> {
  return fetch(`${getApiUrl()}/command/wsummary`, {
    method: "POST",
    headers: headers,
    body: JSON.stringify({ context, query }),
  }).then((response) => response.json());
}
