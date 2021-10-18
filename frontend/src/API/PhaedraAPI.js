/**
 * @typedef {import("../manipulation/NotebookManipulation").Notebook} Notebook
 */

const defaultApiUrl = "http://localhost:5000";
const headers = { "Content-Type": "application/json" };

/**
 * Returns the API URL.
 * @returns {string}
 */
export function getApiUrl() {
  let apiUrl = window.localStorage.getItem("apiUrl");
  if (apiUrl) return apiUrl;
  window.localStorage.setItem("apiUrl", defaultApiUrl);
  return defaultApiUrl;
}

/**
 * Sets the API URL.
 * @param {string} url
 */
export function setApiUrl(url) {
  window.localStorage.setItem("apiUrl", url);
}

/**
 * Creates a Notebook from a PDF file.
 * @param {string} path
 * @param {string} base64
 * @returns {Promise<Notebook>}
 */
export async function notebookFromPdf(path, base64) {
  const response = await fetch(`${getApiUrl()}/notebook/from_pdf`, {
    method: "POST",
    headers: headers,
    body: JSON.stringify({
      path: path,
      base64: base64,
    }),
  });

  return response.json();
}

/**
 * Creates a Notebook from text.
 * @param {string} text
 * @returns {Promise<Notebook>}
 */
export async function notebookFromText(text) {
  const response = await fetch(`${getApiUrl()}/notebook/from_text`, {
    method: "POST",
    headers: headers,
    body: JSON.stringify({
      text: text,
    }),
  });

  return response.json();
}

/**
 *
 * @param {Notebook} notebook_json
 * @param {string} page_id
 * @param {string} [cell_id]
 * @returns {Promise<Notebook>}
 */
export async function addEntitiesCell(notebook_json, page_id, cell_id) {
  const response = await fetch(`${getApiUrl()}/cell/add/entities`, {
    method: "POST",
    headers: headers,
    body: JSON.stringify({
      notebook: JSON.stringify(notebook_json),
      page_id: page_id,
      cell_id: cell_id,
    }),
  });

  return response.json();
}

/**
 *
 * @param {Notebook} notebook_json
 * @param {string} question
 * @param {string} page_id
 * @param {string} [cell_id]
 * @returns {Promise<Notebook>}
 */
export async function addQuestionCell(
  notebook_json,
  question,
  page_id,
  cell_id
) {
  const response = await fetch(`${getApiUrl()}/cell/add/question`, {
    method: "POST",
    headers: headers,
    body: JSON.stringify({
      notebook: JSON.stringify(notebook_json),
      question: question,
      page_id: page_id,
      cell_id: cell_id,
    }),
  });

  return response.json();
}

/**
 *
 * @param {Notebook} notebook_json
 * @param {string} question
 * @param {string} [page_id]
 * @param {string} [cell_id]
 * @returns
 */
export async function addSparseQuestionCell(
  notebook_json,
  question,
  page_id,
  cell_id
) {
  const response = await fetch(`${getApiUrl()}/cell/add/sparse_question`, {
    method: "POST",
    headers: headers,
    body: JSON.stringify({
      notebook: JSON.stringify(notebook_json),
      question: question,
      page_id: page_id,
      cell_id: cell_id,
    }),
  });

  return response.json();
}

/**
 *
 * @param {Notebook} notebook_json
 * @param {string} prompt
 * @param {string} page_id
 * @param {string} [cell_id]
 * @returns {Promise<Notebook>}
 */
export async function addGenerateCell(notebook_json, prompt, page_id, cell_id) {
  const response = await fetch(`${getApiUrl()}/cell/add/generate`, {
    method: "POST",
    headers: headers,
    body: JSON.stringify({
      notebook: JSON.stringify(notebook_json),
      prompt: prompt,
      page_id: page_id,
      cell_id: cell_id,
    }),
  });

  return response.json();
}

/**
 *
 * @param {Notebook} notebook_json
 * @param {string} query
 * @param {string} page_id
 * @param {string} [cell_id]
 * @returns {Promise<Notebook>}
 */
export async function addWikipediaSummaryCell(
  notebook_json,
  query,
  page_id,
  cell_id
) {
  const response = await fetch(`${getApiUrl()}/cell/add/wikipedia_summary`, {
    method: "POST",
    headers: headers,
    body: JSON.stringify({
      notebook: JSON.stringify(notebook_json),
      query: query,
      page_id: page_id,
      cell_id: cell_id,
    }),
  });

  return response.json();
}

/**
 *
 * @param {Notebook} notebook_json
 * @param {string} query
 * @param {string} page_id
 * @param {string} [cell_id]
 * @returns {Promise<Notebook>}
 */
export async function addWikipediaSuggestionsCell(
  notebook_json,
  query,
  page_id,
  cell_id
) {
  const response = await fetch(
    `${getApiUrl()}/cell/add/wikipedia_suggestions`,
    {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        notebook: JSON.stringify(notebook_json),
        query: query,
        page_id: page_id,
        cell_id: cell_id,
      }),
    }
  );

  return response.json();
}

/**
 *
 * @param {Notebook} notebook_json
 * @param {string} query
 * @param {string} page_id
 * @param {string} [cell_id]
 * @returns {Promise<Notebook>}
 */
export async function addWikipediaImageCell(
  notebook_json,
  query,
  page_id,
  cell_id
) {
  const response = await fetch(`${getApiUrl()}/cell/add/wikipedia_image`, {
    method: "POST",
    headers: headers,
    body: JSON.stringify({
      notebook: JSON.stringify(notebook_json),
      query: query,
      page_id: page_id,
      cell_id: cell_id,
    }),
  });

  return response.json();
}

/**
 *
 * @param {Notebook} notebook_json
 * @param {string} word
 * @param {string} page_id
 * @param {string} [cell_id]
 * @returns {Promise<Notebook>}
 */
export async function addMeaningCell(notebook_json, word, page_id, cell_id) {
  const response = await fetch(`${getApiUrl()}/cell/add/meaning`, {
    method: "POST",
    headers: headers,
    body: JSON.stringify({
      notebook: JSON.stringify(notebook_json),
      word: word,
      page_id: page_id,
      cell_id: cell_id,
    }),
  });

  return response.json();
}

/**
 *
 * @param {Notebook} notebook_json
 * @param {string} word
 * @param {string} page_id
 * @param {string} [cell_id]
 * @returns
 */
export async function addSynonymCell(notebook_json, word, page_id, cell_id) {
  const response = await fetch(`${getApiUrl()}/cell/add/synonym`, {
    method: "POST",
    headers: headers,
    body: JSON.stringify({
      notebook: JSON.stringify(notebook_json),
      word: word,
      page_id: page_id,
      cell_id: cell_id,
    }),
  });

  return response.json();
}

/**
 *
 * @param {Notebook} notebook_json
 * @param {string} word
 * @param {string} page_id
 * @param {string} [cell_id]
 * @returns
 */
export async function addAntonymCell(notebook_json, word, page_id, cell_id) {
  const response = await fetch(`${getApiUrl()}/cell/add/antonym`, {
    method: "POST",
    headers: headers,
    body: JSON.stringify({
      notebook: JSON.stringify(notebook_json),
      word: word,
      page_id: page_id,
      cell_id: cell_id,
    }),
  });

  return response.json();
}

export async function kill() {
  return await fetch(`${getApiUrl()}/kill`);
}
