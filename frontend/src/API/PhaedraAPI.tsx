import { INotebook } from "../manipulation/INotebookManipulation";

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
  return new Promise((resolve, reject) => {
    fetch(`${getApiUrl()}/notebook/from_pdf`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        path: path,
        base64: base64,
      }),
    })
      .then((response) => {
        resolve(response.json());
      })
      .catch((error) => {
        reject(error);
      });
  });
}

export async function notebookFromText(text: string): Promise<INotebook> {
  return new Promise((resolve, reject) => {
    fetch(`${getApiUrl()}/notebook/from_text`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        text: text,
      }),
    })
      .then((response) => {
        resolve(response.json());
      })
      .catch((error) => {
        reject(error);
      });
  });
}

export async function addEntitiesCell(
  notebook_json: INotebook,
  page_id: string,
  cell_id: string
): Promise<INotebook> {
  return new Promise((resolve, reject) => {
    fetch(`${getApiUrl()}/cell/add/entities`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        notebook: JSON.stringify(notebook_json),
        page_id: page_id,
        cell_id: cell_id,
      }),
    })
      .then((response) => {
        resolve(response.json());
      })
      .catch((error) => {
        reject(error);
      });
  });
}

export async function addQuestionCell(
  notebook_json: INotebook,
  question: string,
  page_id: string,
  cell_id: string
): Promise<INotebook> {
  return new Promise((resolve, reject) => {
    fetch(`${getApiUrl()}/cell/add/question`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        notebook: JSON.stringify(notebook_json),
        question: question,
        page_id: page_id,
        cell_id: cell_id,
      }),
    })
      .then((response) => {
        resolve(response.json());
      })
      .catch((error) => {
        reject(error);
      });
  });
}

export async function addSparseQuestionCell(
  notebook_json: INotebook,
  question: string,
  page_id: string,
  cell_id: string
): Promise<INotebook> {
  return new Promise((resolve, reject) => {
    fetch(`${getApiUrl()}/cell/add/sparse_question`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        notebook: JSON.stringify(notebook_json),
        question: question,
        page_id: page_id,
        cell_id: cell_id,
      }),
    })
      .then((response) => {
        resolve(response.json());
      })
      .catch((error) => {
        reject(error);
      });
  });
}

export async function addGenerateCell(
  notebook_json: INotebook,
  prompt: string,
  page_id: string,
  cell_id: string
): Promise<INotebook> {
  return new Promise((resolve, reject) => {
    fetch(`${getApiUrl()}/cell/add/generate`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        notebook: JSON.stringify(notebook_json),
        prompt: prompt,
        page_id: page_id,
        cell_id: cell_id,
      }),
    })
      .then((response) => {
        resolve(response.json());
      })
      .catch((error) => {
        reject(error);
      });
  });
}

export async function addWikipediaSummaryCell(
  notebook_json: INotebook,
  query: string,
  page_id: string,
  cell_id: string
): Promise<INotebook> {
  return new Promise((resolve, reject) => {
    fetch(`${getApiUrl()}/cell/add/wikipedia_summary`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        notebook: JSON.stringify(notebook_json),
        query: query,
        page_id: page_id,
        cell_id: cell_id,
      }),
    })
      .then((response) => {
        resolve(response.json());
      })
      .catch((error) => {
        reject(error);
      });
  });
}

export async function addWikipediaSuggestionsCell(
  notebook_json: INotebook,
  query: string,
  page_id: string,
  cell_id: string
): Promise<INotebook> {
  return new Promise((resolve, reject) => {
    fetch(`${getApiUrl()}/cell/add/wikipedia_suggestions`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        notebook: JSON.stringify(notebook_json),
        query: query,
        page_id: page_id,
        cell_id: cell_id,
      }),
    })
      .then((response) => {
        resolve(response.json());
      })
      .catch((error) => {
        reject(error);
      });
  });
}

export async function addWikipediaImageCell(
  notebook_json: INotebook,
  query: string,
  page_id: string,
  cell_id: string
): Promise<INotebook> {
  return new Promise((resolve, reject) => {
    fetch(`${getApiUrl()}/cell/add/wikipedia_image`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        notebook: JSON.stringify(notebook_json),
        query: query,
        page_id: page_id,
        cell_id: cell_id,
      }),
    })
      .then((response) => {
        resolve(response.json());
      })
      .catch((error) => {
        reject(error);
      });
  });
}

export async function addMeaningCell(
  notebook_json: INotebook,
  word: string,
  page_id: string,
  cell_id: string
): Promise<INotebook> {
  return new Promise((resolve, reject) => {
    fetch(`${getApiUrl()}/cell/add/meaning`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        notebook: JSON.stringify(notebook_json),
        word: word,
        page_id: page_id,
        cell_id: cell_id,
      }),
    })
      .then((response) => {
        resolve(response.json());
      })
      .catch((error) => {
        reject(error);
      });
  });
}

export async function addSynonymCell(
  notebook_json: INotebook,
  word: string,
  page_id: string,
  cell_id: string
): Promise<INotebook> {
  return new Promise((resolve, reject) => {
    fetch(`${getApiUrl()}/cell/add/synonym`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        notebook: JSON.stringify(notebook_json),
        word: word,
        page_id: page_id,
        cell_id: cell_id,
      }),
    })
      .then((response) => {
        resolve(response.json());
      })
      .catch((error) => {
        reject(error);
      });
  });
}

export async function addAntonymCell(
  notebook_json: INotebook,
  word: string,
  page_id: string,
  cell_id: string
): Promise<INotebook> {
  return new Promise((resolve, reject) => {
    fetch(`${getApiUrl()}/cell/add/antonym`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        notebook: JSON.stringify(notebook_json),
        word: word,
        page_id: page_id,
        cell_id: cell_id,
      }),
    })
      .then((response) => {
        resolve(response.json());
      })
      .catch((error) => {
        reject(error);
      });
  });
}

export async function kill() {
  return await fetch(`${getApiUrl()}/kill`);
}

export async function beacon() {
  return await fetch(`${getApiUrl()}/beacon`);
}