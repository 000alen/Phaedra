const headers = {"Content-Type": "application/json"}

export function getApiUrl() {
    let apiUrl = window.localStorage.getItem("apiUrl");
    if (apiUrl) return apiUrl;
    window.localStorage.setItem("apiUrl", "http://localhost:5000");
    return "http://localhost:5000";
}

// "/notebook/open"
async function openNotebook(path) {
    const response = await fetch(`${getApiUrl()}/notebook/open`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
            path: path,
        })
    });

    return response.json();
}

// "/notebook/new"
async function newNotebook(id, name, file, pages) {
    const response = await fetch(`${getApiUrl()}/notebook/new`, {
        method: "POST",
        headers: headers, 
        body: JSON.stringify({
            id: id,
            name: name,
            file: file,
            pages: JSON.stringify(pages),
        })
    });

    return response.json();
}

// "/notebook/new/from_pdf"
async function newNotebookFromPdf(path) {
    const response = await fetch(`${getApiUrl()}/notebook/new/from_pdf`, {
        method: "POST",
        headers: headers, 
        body: JSON.stringify({
            path: path,
        })
    });

    return response.json();
}

// "/notebook/new/from_text"
async function newNotebookFromText(text) {
    const response = await fetch(`${getApiUrl()}/notebook/new/from_text`, {
        method: "POST",
        headers: headers, 
        body: JSON.stringify({
            text: text
        })
    });

    return response.json();
}

// "/entities"
async function entities(notebook_json, page_index) {
    const response = await fetch(`${getApiUrl()}/entities`, {
        method: "POST",
        headers: headers, 
        body: JSON.stringify({
            notebook: JSON.stringify(notebook_json),
            page_index: page_index
        })      
    });

    return response.json();
}

// "/question"
async function question(notebook_json, page_index, question) {
    const response = await fetch(`${getApiUrl()}/question`, {
        method: "POST",
        headers: headers, 
        body: JSON.stringify({
            notebook: JSON.stringify(notebook_json),
            page_index: page_index,
            question: question,
        })
    });

    return response.json();
}

// "/question/sparse"
async function sparseQuestion(notebook_json, question) {
    const response = await fetch(`${getApiUrl()}/question/sparse`, {
        method: "POST",
        headers: headers, 
        body: JSON.stringify({
            notebook: JSON.stringify(notebook_json),
            question: question,
        })
    })

    return response.json();
}

// "/page/new"
async function newPage(id, name, cells, data) {
    const response = await fetch(`${getApiUrl()}/page/new`, {
        method: "POST",
        headers: headers, 
        body: JSON.stringify({
            id: id,
            name: name,
            cells: JSON.stringify(cells),
            data: JSON.stringify(data),
        })
    });

    return response.json();
}

// "/page/remove"
async function removePage(notebook_json, page_json) {
    const response = await fetch(`${getApiUrl()}/page/remove`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
            notebook: JSON.stringify(notebook_json),
            page: JSON.stringify(page_json),
        })
    });

    return response.json();
}

// "/cell/new"
async function newCell(id, data, content) {
    const response = await fetch(`${getApiUrl()}/cell/new`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
            id: id,
            data: JSON.stringify(data),
            content: content,
        })
    });

    return response.json();
}

// "/cell/add"
async function addCell(notebook_json, page_index, cell_json) {
    const response = await fetch(`${getApiUrl()}/cell/add`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
            notebook: JSON.stringify(notebook_json),
            page_index: page_index,
            cell: JSON.stringify(cell_json),
        })
    });

    return response.json();
}

// "/cell/get"
async function getCell(notebook_json, page_index, cell_index) {
    const response = await fetch(`${getApiUrl()}/cell/get`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
            notebook: JSON.stringify(notebook_json),
            page_index: page_index,
            cell_index: cell_index,
        })
    });

    return response.json();
}

// "/cell/remove"
async function removeCell(notebook_json, page_index, cell_json) {
    const response = await fetch(`${getApiUrl()}/cell/remove`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
            notebook: JSON.stringify(notebook_json),
            page_index: page_index,
            cell: JSON.stringify(cell_json),
        })
    });

    return response.json();
}

// "/cell/add/question"
async function addQuestionCell(notebook_json, page_index, question) {
    const response = await fetch(`${getApiUrl()}/cell/add/question`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
            notebook: JSON.stringify(notebook_json),
            page_index: page_index,
            question: question,
        })
    });

    return response.json();
}

// "/cell/add/wikipedia"
async function addWikipediaCell(notebook_json, page_index, query) {
    const response = await fetch(`${getApiUrl()}/cell/add/wikipedia`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
            notebook: JSON.stringify(notebook_json),
            page_index: page_index,
            query: query,
        })
    });

    return response.json();
}

// "/kill"
async function kill() {
    return await fetch(`${getApiUrl()}/kill`);
}

export { 
    openNotebook,
    newNotebook,
    newNotebookFromPdf,
    newNotebookFromText,
    entities,
    question,
    sparseQuestion,
    newPage,
    removePage,
    newCell,
    addCell,
    getCell,
    removeCell,
    addQuestionCell,
    addWikipediaCell,
    kill
}