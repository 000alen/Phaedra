import {
  addEntitiesCell as _addEntitiesCell,
  addQuestionCell as _addQuestionCell,
  addSparseQuestionCell as _addSparseQuestionCell,
  addGenerateCell as _addGenerateCell,
  addWikipediaSummaryCell as _addWikipediaSummaryCell,
  addWikipediaSuggestionsCell as _addWikipediaSuggestionsCell,
  addWikipediaImageCell as _addWikipediaImageCell,
  addMeaningCell as _addMeaningCell,
  addSynonymCell as _addSynonymCell,
  addAntonymCell as _addAntonymCell,
} from "./API";
import { v4 as uuidv4 } from "uuid";

export function createNotebook({ id, name, document_path, pages }) {
  if (!id) id = uuidv4();
  if (!name) name = "Untitled";
  if (!document_path) document_path = null;
  if (!pages)
    pages = [
      {
        id: uuidv4(),
        data: {},
        cells: [],
      },
    ];

  return {
    id: id,
    name: name,
    document_path: document_path,
    pages: pages,
  };
}

export function createPage(id, data, cells) {
  if (!id) id = uuidv4();
  if (!data) data = {};
  if (!cells) cells = [];

  return {
    id: id,
    data: data,
    cells: cells,
  };
}

export function createCell(id, data, content) {
  if (!id) id = uuidv4();
  if (!data) data = {};
  if (!content) content = "";

  return {
    id: id,
    data: data,
    content: content,
  };
}

export function insertPage(notebook, { page, index }) {
  notebook.pages.splice(index, 0, page);
  return notebook;
}

export function undoInsertPage(notebook, { page }) {
  return removePage(notebook, { pageId: page.id });
}

export function addPage(notebook, { page }) {
  notebook.pages.push(page);
  return notebook;
}

export function undoAddPage(notebook, { page }) {
  return removePage(notebook, { pageId: page.id });
}

export function indexPage(notebook, { pageId }) {
  return notebook.pages.findIndex((page) => page.id === pageId);
}

export function getPage(notebook, { pageId }) {
  return notebook.pages.find((page) => page.id === pageId);
}

export function removePage(notebook, { pageId }) {
  notebook.pages = notebook.pages.filter((page) => page.id !== pageId);
  return notebook;
}

export function undoRemovePage(notebook, { page, index }) {
  return insertPage(notebook, { page, index });
}

export function insertCell(notebook, { pageId, cell, index }) {
  notebook.pages[indexPage(notebook, pageId)].cells.splice(index, 0, cell);
  return notebook;
}

export function undoInsertCell(notebook, { pageId, cell }) {
  return removeCell(notebook, { pageId: pageId, cellId: cell.id });
}

export function addCell(notebook, { pageId, cell }) {
  notebook.pages[indexPage(notebook, pageId)].cells.push(cell);
  return notebook;
}

export function undoAddCell(notebook, { pageId, cell }) {
  return removeCell(notebook, { pageId: pageId, cellId: cell.id });
}

export function indexCell(notebook, { pageId, cellId }) {
  return notebook.pages[indexPage(notebook, pageId)].cells.findIndex(
    (cell) => cell.id === cellId
  );
}

export function getCell(notebook, { pageId, cellId }) {
  return notebook.pages[indexPage(notebook, pageId)].cells.find(
    (cell) => cell.id === cellId
  );
}

export function removeCell(notebook, { pageId, cellId }) {
  notebook.pages[indexPage(notebook, pageId)].cells = notebook.pages[
    indexPage(notebook, pageId)
  ].cells.filter((cell) => cell.id !== cellId);
  return notebook;
}

export function undoRemoveCell(notebook, { pageId, cell, index }) {
  return insertCell(notebook, { pageId: pageId, cell: cell, index: index });
}

export function addEntitiesCell(notebook, { pageId }) {
  return new Promise((resolve, reject) => {
    _addEntitiesCell(notebook, pageId).then((notebook) => {
      resolve(notebook);
    });
  });
}

export function undoAddEntitiesCell(notebook, { pageId, cellId }) {
  return removeCell(notebook, { pageId: pageId, cellId: cellId });
}

export function addQuestionCell(notebook, { question, pageId }) {
  return new Promise((resolve, reject) => {
    _addQuestionCell(notebook, question, pageId).then((notebook) => {
      resolve(notebook);
    });
  });
}

export function undoAddQuestionCell(notebook, { pageId, cellId }) {
  return removeCell(notebook, { pageId: pageId, cellId: cellId });
}

export function addSparseQuestionCell(notebook, { question }) {
  return new Promise((resolve, reject) => {
    _addSparseQuestionCell(notebook, question).then((notebook) => {
      resolve(notebook);
    });
  });
}

export function undoAddSparseQuestionCell(notebook, { pageId, cellId }) {
  return removeCell(notebook, { pageId: pageId, cellId: cellId });
}

export function addGenerateCell(notebook, { prompt, pageId }) {
  return new Promise((resolve, reject) => {
    _addGenerateCell(notebook, prompt, pageId).then((notebook) => {
      resolve(notebook);
    });
  });
}

export function undoAddGenerateCell(notebook, { pageId, cellId }) {
  return removeCell(notebook, { pageId: pageId, cellId: cellId });
}

export function addWikipediaSummaryCell(notebook, { query, pageId }) {
  return new Promise((resolve, reject) => {
    _addWikipediaSummaryCell(notebook, query, pageId).then((notebook) => {
      resolve(notebook);
    });
  });
}

export function undoAddWikipediaSummaryCell(notebook, { pageId, cellId }) {
  return removeCell(notebook, { pageId: pageId, cellId: cellId });
}

export function addWikipediaSuggestionsCell(notebook, { query, pageId }) {
  return new Promise((resolve, reject) => {
    _addWikipediaSuggestionsCell(notebook, query, pageId).then((notebook) => {
      resolve(notebook);
    });
  });
}

export function undoAddWikipediaSuggestionsCell(notebook, { pageId, cellId }) {
  return removeCell(notebook, { pageId: pageId, cellId: cellId });
}

export function addWikipediaImageCell(notebook, { query, pageId }) {
  return new Promise((resolve, reject) => {
    _addWikipediaImageCell(notebook, query, pageId).then((notebook) => {
      resolve(notebook);
    });
  });
}

export function undoAddWikipediaImageCell(notebook, { pageId, cellId }) {
  return removeCell(notebook, { pageId: pageId, cellId: cellId });
}

export function addMeaningCell(notebook, { word, pageId }) {
  return new Promise((resolve, reject) => {
    _addMeaningCell(notebook, word, pageId).then((notebook) => {
      resolve(notebook);
    });
  });
}

export function undoAddMeaningCell(notebook, { pageId, cellId }) {
  return removeCell(notebook, { pageId: pageId, cellId: cellId });
}

export function addSynonymCell(notebook, { word, pageId }) {
  return new Promise((resolve, reject) => {
    _addSynonymCell(notebook, word, pageId).then((notebook) => {
      resolve(notebook);
    });
  });
}

export function undoAddSynonymCell(notebook, { pageId, cellId }) {
  return removeCell(notebook, { pageId: pageId, cellId: cellId });
}

export function addAntonymCell(notebook, { word, pageId }) {
  return new Promise((resolve, reject) => {
    _addAntonymCell(notebook, word, pageId).then((notebook) => {
      resolve(notebook);
    });
  });
}

export function undoAddAntonymCell(notebook, { pageId, cellId }) {
  return removeCell(notebook, { pageId: pageId, cellId: cellId });
}

export function getCellContent(notebook, { pageId, cellId }) {
  return notebook.pages[indexPage(notebook, pageId)].cells[
    indexCell(notebook, pageId, cellId)
  ].content;
}

export function setCellContent(notebook, { pageId, cellId, content }) {
  notebook.pages[indexPage(notebook, pageId)].cells[
    indexCell(notebook, pageId, cellId)
  ].content = content;
  return notebook;
}

export function undoSetCellContent(
  notebook,
  { pageId, cellId, previousContent }
) {
  return setCellContent(notebook, {
    pageId: pageId,
    cellId: cellId,
    content: previousContent,
  });
}

export function getCellData(notebook, { pageId, cellId }) {
  return notebook.pages[indexPage(notebook, pageId)].cells[
    indexCell(notebook, pageId, cellId)
  ].data;
}

export function setCellData(notebook, { pageId, cellId, data }) {
  notebook.pages[indexPage(notebook, pageId)].cells[
    indexCell(notebook, pageId, cellId)
  ].data = data;
  return notebook;
}

export function undoSetCellData(notebook, { pageId, cellId, previousData }) {
  return setCellData(notebook, {
    pageId: pageId,
    cellId: cellId,
    data: previousData,
  });
}

export function undo(notebook, command) {
  switch (command.action) {
    case "insertPage":
      return undoInsertPage(notebook, command);
    case "addPage":
      return undoAddPage(notebook, command);
    case "removePage":
      return undoRemovePage(notebook, command);
    case "insertCell":
      return undoInsertCell(notebook, command);
    case "addCell":
      return undoAddCell(notebook, command);
    case "removeCell":
      return undoRemoveCell(notebook, command);
    case "addEntitiesCell":
      return undoAddEntitiesCell(notebook, command);
    case "addQuestionCell":
      return undoAddQuestionCell(notebook, command);
    case "addSparseQuestionCell":
      return undoAddSparseQuestionCell(notebook, command);
    case "addGenerateCell":
      return undoAddGenerateCell(notebook, command);
    case "addWikipediaSummaryCell":
      return undoAddWikipediaSummaryCell(notebook, command);
    case "addWikipediaSuggestionsCell":
      return undoAddWikipediaSuggestionsCell(notebook, command);
    case "addWikipediaImageCell":
      return undoAddWikipediaImageCell(notebook, command);
    case "addMeaningCell":
      return undoAddMeaningCell(notebook, command);
    case "addSynonymCell":
      return undoAddSynonymCell(notebook, command);
    case "addAntonymCell":
      return undoAddAntonymCell(notebook, command);
    case "setCellContent":
      return undoSetCellContent(notebook, command);
    case "setCellData":
      return undoSetCellData(notebook, command);
  }
}

export function redo(notebook, command) {
  switch (command.action) {
    case "insertPage":
      return insertPage(notebook, command);
    case "addPage":
      return addPage(notebook, command);
    case "removePage":
      return removePage(notebook, command);
    case "insertCell":
      return insertCell(notebook, command);
    case "addCell":
      return addCell(notebook, command);
    case "removeCell":
      return removeCell(notebook, command);
    case "addEntitiesCell":
      return addEntitiesCell(notebook, command);
    case "addQuestionCell":
      return addQuestionCell(notebook, command);
    case "addSparseQuestionCell":
      return addSparseQuestionCell(notebook, command);
    case "addGenerateCell":
      return addGenerateCell(notebook, command);
    case "addWikipediaSummaryCell":
      return addWikipediaSummaryCell(notebook, command);
    case "addWikipediaSuggestionsCell":
      return addWikipediaSuggestionsCell(notebook, command);
    case "addWikipediaImageCell":
      return addWikipediaImageCell(notebook, command);
    case "addMeaningCell":
      return addMeaningCell(notebook, command);
    case "addSynonymCell":
      return addSynonymCell(notebook, command);
    case "addAntonymCell":
      return addAntonymCell(notebook, command);
    case "setCellContent":
      return setCellContent(notebook, command);
    case "setCellData":
      return setCellData(notebook, command);
  }
}
