const defaultApiUrl = "http://localhost:5000";
const headers = { "Content-Type": "application/json" };

/**
 *
 * @returns
 */
export function getApiUrl() {
  let apiUrl = window.localStorage.getItem("apiUrl");
  if (apiUrl) return apiUrl;
  window.localStorage.setItem("apiUrl", defaultApiUrl);
  return defaultApiUrl;
}

/**
 *
 * @param {*} url
 */
export function setApiUrl(url) {
  window.localStorage.setItem("apiUrl", url);
}

/**
 *
 * @param {*} path
 * @param {*} base64
 * @returns
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
 *
 * @param {*} text
 * @returns
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
 * @param {*} notebook_json
 * @param {*} page_id
 * @returns
 */
export async function addEntitiesCell(notebook_json, page_id) {
  const response = await fetch(`${getApiUrl()}/cell/add/entities`, {
    method: "POST",
    headers: headers,
    body: JSON.stringify({
      notebook: JSON.stringify(notebook_json),
      page_id: page_id,
    }),
  });

  return response.json();
}

/**
 *
 * @param {*} notebook_json
 * @param {*} question
 * @param {*} page_id
 * @returns
 */
export async function addQuestionCell(notebook_json, question, page_id) {
  const response = await fetch(`${getApiUrl()}/cell/add/question`, {
    method: "POST",
    headers: headers,
    body: JSON.stringify({
      notebook: JSON.stringify(notebook_json),
      question: question,
      page_id: page_id,
    }),
  });

  return response.json();
}

/**
 *
 * @param {*} notebook_json
 * @param {*} question
 * @returns
 */
export async function addSparseQuestionCell(notebook_json, question) {
  const response = await fetch(`${getApiUrl()}/cell/add/sparse_question`, {
    method: "POST",
    headers: headers,
    body: JSON.stringify({
      notebook: JSON.stringify(notebook_json),
      question: question,
    }),
  });

  return response.json();
}

/**
 *
 * @param {*} notebook_json
 * @param {*} prompt
 * @param {*} page_id
 * @returns
 */
export async function addGenerateCell(notebook_json, prompt, page_id) {
  const response = await fetch(`${getApiUrl()}/cell/add/generate`, {
    method: "POST",
    headers: headers,
    body: JSON.stringify({
      notebook: JSON.stringify(notebook_json),
      prompt: prompt,
      page_id: page_id,
    }),
  });

  return response.json();
}

/**
 *
 * @param {*} notebook_json
 * @param {*} query
 * @param {*} page_id
 * @returns
 */
export async function addWikipediaSummaryCell(notebook_json, query, page_id) {
  const response = await fetch(`${getApiUrl()}/cell/add/wikipedia_summary`, {
    method: "POST",
    headers: headers,
    body: JSON.stringify({
      notebook: JSON.stringify(notebook_json),
      query: query,
      page_id: page_id,
    }),
  });

  return response.json();
}

/**
 *
 * @param {*} notebook_json
 * @param {*} query
 * @param {*} page_id
 * @returns
 */
export async function addWikipediaSuggestionsCell(
  notebook_json,
  query,
  page_id
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
      }),
    }
  );

  return response.json();
}

/**
 *
 * @param {*} notebook_json
 * @param {*} query
 * @param {*} page_id
 * @returns
 */
export async function addWikipediaImageCell(notebook_json, query, page_id) {
  const response = await fetch(`${getApiUrl()}/cell/add/wikipedia_image`, {
    method: "POST",
    headers: headers,
    body: JSON.stringify({
      notebook: JSON.stringify(notebook_json),
      query: query,
      page_id: page_id,
    }),
  });

  return response.json();
}

/**
 *
 * @param {*} notebook_json
 * @param {*} word
 * @param {*} page_id
 * @returns
 */
export async function addMeaningCell(notebook_json, word, page_id) {
  const response = await fetch(`${getApiUrl()}/cell/add/meaning`, {
    method: "POST",
    headers: headers,
    body: JSON.stringify({
      notebook: JSON.stringify(notebook_json),
      word: word,
      page_id: page_id,
    }),
  });

  return response.json();
}

/**
 *
 * @param {*} notebook_json
 * @param {*} word
 * @param {*} page_id
 * @returns
 */
export async function addSynonymCell(notebook_json, word, page_id) {
  const response = await fetch(`${getApiUrl()}/cell/add/synonym`, {
    method: "POST",
    headers: headers,
    body: JSON.stringify({
      notebook: JSON.stringify(notebook_json),
      word: word,
      page_id: page_id,
    }),
  });

  return response.json();
}

/**
 *
 * @param {*} notebook_json
 * @param {*} word
 * @param {*} page_id
 * @returns
 */
export async function addAntonymCell(notebook_json, word, page_id) {
  const response = await fetch(`${getApiUrl()}/cell/add/antonym`, {
    method: "POST",
    headers: headers,
    body: JSON.stringify({
      notebook: JSON.stringify(notebook_json),
      word: word,
      page_id: page_id,
    }),
  });

  return response.json();
}

/**
 *
 * @returns
 */
export async function kill() {
  return await fetch(`${getApiUrl()}/kill`);
}
