import { v4 as uuidv4 } from "uuid";

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
} from "../API/PhaedraAPI";

/**
 * @typedef {Object} Cell
 * @property {string} id
 * @property {Object} data
 * @property {string} content
 */

/**
 * @typedef {Object} Page
 * @property {string} id
 * @property {Object} data
 * @property {Cell[]} cells
 */

/**
 * @typedef {Object} Notebook
 * @property {string} id
 * @property {string} name
 * @property {string | null} document_path
 * @property {Page[]} pages
 */

/**
 * @typedef {Object} Command
 * @property {Function} action
 * @property {Page} page
 * @property {string} pageId
 * @property {Cell} cell
 * @property {string} cellId
 * @property {number} index
 * @property {string} question
 * @property {string} prompt
 * @property {string} query
 * @property {string} content
 * @property {string} previousContent
 * @property {Object} data
 * @property {Object} previousData
 * @property {string} word
 */

/**
 * Creates a Notebook.
 * @param {Object} args
 * @param {string} args.id
 * @param {string} args.name
 * @param {string | null} args.document_path
 * @param {Page[]} args.pages
 * @returns {Notebook}
 */
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

/**
 * Creates a Page.
 * @param {string} id
 * @param {Object} data
 * @param {Cell[]} cells
 * @returns {Page}
 */
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

/**
 * Creates a Cell.
 * @param {string} id
 * @param {Object} data
 * @param {string} content
 * @returns {Cell}
 */
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

/**
 * Inserts a Page into the Notebook.
 * @param {Notebook} notebook
 * @param {Object} args
 * @param {Page} args.page
 * @param {number} args.index
 * @returns {Notebook}
 */
export function insertPage(notebook, { page, index }) {
  notebook.pages.splice(index, 0, page);
  return notebook;
}

/**
 * Undoes a Page insertion.
 * @param {Notebook} notebook
 * @param {object} args
 * @param {Page} args.page
 * @returns {Notebook}
 */
export function undoInsertPage(notebook, { page }) {
  return removePage(notebook, { pageId: page.id });
}

/**
 * Adds a page to the Notebook.
 * @param {Notebook} notebook
 * @param {Object} args
 * @param {Page} args.page
 * @returns {Notebook}
 */
export function addPage(notebook, { page }) {
  notebook.pages.push(page);
  return notebook;
}

/**
 * Undoes a Page addition.
 * @param {Notebook} notebook
 * @param {Object} args
 * @param {Page} args.page
 * @returns {Notebook}
 */
export function undoAddPage(notebook, { page }) {
  return removePage(notebook, { pageId: page.id });
}

/**
 * Indexes a Page in the Notebook.
 * @param {Notebook} notebook
 * @param {Object} args
 * @param {string} args.pageId
 * @returns {number}
 */
export function indexPage(notebook, { pageId }) {
  return notebook.pages.findIndex((page) => page.id === pageId);
}

/**
 * Returns a Page from the Notebook.
 * @param {Notebook} notebook
 * @param {Object} args
 * @param {string} args.pageId
 * @returns {Page | undefined}
 */
export function getPage(notebook, { pageId }) {
  return notebook.pages.find((page) => page.id === pageId);
}

/**
 * Removes a Page from the Notebook.
 * @param {Notebook} notebook
 * @param {Object} args
 * @param {string} args.pageId
 * @returns {Notebook}
 */
export function removePage(notebook, { pageId }) {
  notebook.pages = notebook.pages.filter((page) => page.id !== pageId);
  return notebook;
}

/**
 * Undoes a Page removal.
 * @param {Notebook} notebook
 * @param {Object} args
 * @param {Page} args.page
 * @param {number} args.index
 * @returns {Notebook}
 */
export function undoRemovePage(notebook, { page, index }) {
  return insertPage(notebook, { page, index });
}

/**
 * Inserts a Cell into the Notebook.
 * @param {Notebook} notebook
 * @param {Object} args
 * @param {string} args.pageId
 * @param {Cell} args.cell
 * @param {number} args.index
 * @returns {Notebook}
 */
export function insertCell(notebook, { pageId, cell, index }) {
  console.log(pageId, cell, index);
  notebook.pages[indexPage(notebook, { pageId: pageId })].cells.splice(
    index,
    0,
    cell
  );
  return notebook;
}

/**
 * Undoes a Cell insertion.
 * @param {Notebook} notebook
 * @param {Object} args
 * @param {string} args.pageId
 * @param {Cell} args.cell
 * @returns {Notebook}
 */
export function undoInsertCell(notebook, { pageId, cell }) {
  return removeCell(notebook, { pageId: pageId, cellId: cell.id });
}

/**
 * Adds a Cell to the Notebook.
 * @param {Notebook} notebook
 * @param {Object} args
 * @param {string} args.pageId
 * @param {Cell} args.cell
 * @returns {Notebook}
 */
export function addCell(notebook, { pageId, cell }) {
  notebook.pages[indexPage(notebook, { pageId: pageId })].cells.push(cell);
  return notebook;
}

/**
 * Undoes a Cell addition.
 * @param {Notebook} notebook
 * @param {Object} args
 * @param {string} args.pageId
 * @param {Cell} args.cell
 * @returns {Notebook}
 */
export function undoAddCell(notebook, { pageId, cell }) {
  return removeCell(notebook, { pageId: pageId, cellId: cell.id });
}

/**
 * Indexes a Cell in the Notebook.
 * @param {Notebook} notebook
 * @param {Object} args
 * @param {string} args.pageId
 * @param {string} args.cellId
 * @returns {number}
 */
export function indexCell(notebook, { pageId, cellId }) {
  return notebook.pages[
    indexPage(notebook, { pageId: pageId })
  ].cells.findIndex((cell) => cell.id === cellId);
}

/**
 * Returns a Cell from the Notebook.
 * @param {Notebook} notebook
 * @param {Object} args
 * @param {string} args.pageId
 * @param {string} args.cellId
 * @returns {Cell | undefined}
 */
export function getCell(notebook, { pageId, cellId }) {
  return notebook.pages[indexPage(notebook, { pageId: pageId })].cells.find(
    (cell) => cell.id === cellId
  );
}

/**
 * Removes a Cell from the Notebook.
 * @param {Notebook} notebook
 * @param {Object} args
 * @param {string} args.pageId
 * @param {string} args.cellId
 * @returns {Notebook}
 */
export function removeCell(notebook, { pageId, cellId }) {
  notebook.pages[indexPage(notebook, { pageId: pageId })].cells =
    notebook.pages[indexPage(notebook, { pageId: pageId })].cells.filter(
      (cell) => cell.id !== cellId
    );
  return notebook;
}

/**
 * Undoes a Cell removal.
 * @param {Notebook} notebook
 * @param {Object} args
 * @param {string} args.pageId
 * @param {Cell} args.cell
 * @param {number} args.index
 * @returns {Notebook}
 */
export function undoRemoveCell(notebook, { pageId, cell, index }) {
  return insertCell(notebook, { pageId: pageId, cell: cell, index: index });
}

/**
 * Adds entities cell to the Notebook.
 * @param {Notebook} notebook
 * @param {object} args
 * @param {string} args.pageId
 * @returns {Promise<Notebook>}
 */
export function addEntitiesCell(notebook, { pageId }) {
  return new Promise((resolve, reject) => {
    _addEntitiesCell(notebook, pageId).then((notebook) => {
      resolve(notebook);
    });
  });
}

/**
 * Undoes a entities cell addition.
 * @param {Notebook} notebook
 * @param {Object} args
 * @param {string} args.pageId
 * @param {string} args.cellId
 * @returns {Notebook}
 */
export function undoAddEntitiesCell(notebook, { pageId, cellId }) {
  return removeCell(notebook, { pageId: pageId, cellId: cellId });
}

/**
 * Adds a question cell to the Notebook.
 * @param {Notebook} notebook
 * @param {Object} args
 * @param {string} args.question
 * @param {string} args.pageId
 * @returns {Promise<Notebook>}
 */
export function addQuestionCell(notebook, { question, pageId }) {
  return new Promise((resolve, reject) => {
    _addQuestionCell(notebook, question, pageId).then((notebook) => {
      resolve(notebook);
    });
  });
}

/**
 * Undoes a question cell addition.
 * @param {Notebook} notebook
 * @param {Object} args
 * @param {string} args.pageId
 * @param {string} args.cellId
 * @returns {Notebook}
 */
export function undoAddQuestionCell(notebook, { pageId, cellId }) {
  return removeCell(notebook, { pageId: pageId, cellId: cellId });
}

/**
 * Adds a sparse question cell to the Notebook.
 * @param {Notebook} notebook
 * @param {Object} args
 * @param {string} args.question
 * @returns {Promise<Notebook>}
 */
export function addSparseQuestionCell(notebook, { question }) {
  return new Promise((resolve, reject) => {
    _addSparseQuestionCell(notebook, question).then((notebook) => {
      resolve(notebook);
    });
  });
}

/**
 * Undoes sparse question cell addition.
 * @param {Notebook} notebook
 * @param {Object} args
 * @param {string} args.pageId
 * @param {string} args.cellId
 * @returns {Notebook}
 */
export function undoAddSparseQuestionCell(notebook, { pageId, cellId }) {
  return removeCell(notebook, { pageId: pageId, cellId: cellId });
}

/**
 * Adds a generate cell to the Notebook.
 * @param {Notebook} notebook
 * @param {Object} args
 * @param {string} args.prompt
 * @param {string} args.pageId
 * @returns {Promise<Notebook>}
 */
export function addGenerateCell(notebook, { prompt, pageId }) {
  return new Promise((resolve, reject) => {
    _addGenerateCell(notebook, prompt, pageId).then((notebook) => {
      resolve(notebook);
    });
  });
}

/**
 * Undoes a generate cell addition.
 * @param {Notebook} notebook
 * @param {Object} args
 * @param {string} args.pageId
 * @param {string} args.cellId
 * @returns {Notebook}
 */
export function undoAddGenerateCell(notebook, { pageId, cellId }) {
  return removeCell(notebook, { pageId: pageId, cellId: cellId });
}

/**
 * Adds a Wikipedia summary cell to the Notebook.
 * @param {Notebook} notebook
 * @param {object} args
 * @param {string} args.query
 * @param {string} args.pageId
 * @returns {Promise<Notebook>}
 */
export function addWikipediaSummaryCell(notebook, { query, pageId }) {
  return new Promise((resolve, reject) => {
    _addWikipediaSummaryCell(notebook, query, pageId).then((notebook) => {
      resolve(notebook);
    });
  });
}

/**
 * Undoes a Wikipedia summary cell addition.
 * @param {Notebook} notebook
 * @param {Object} args
 * @param {string} args.pageId
 * @param {string} args.cellId
 * @returns {Notebook}
 */
export function undoAddWikipediaSummaryCell(notebook, { pageId, cellId }) {
  return removeCell(notebook, { pageId: pageId, cellId: cellId });
}

/**
 * Adds a Wikipedia suggestions cell to the Notebook.
 * @param {Notebook} notebook
 * @param {Object} args
 * @param {string} args.query
 * @param {string} args.pageId
 * @returns {Promise<Notebook>}
 */
export function addWikipediaSuggestionsCell(notebook, { query, pageId }) {
  return new Promise((resolve, reject) => {
    _addWikipediaSuggestionsCell(notebook, query, pageId).then((notebook) => {
      resolve(notebook);
    });
  });
}

/**
 * Undoes a Wikipedia suggestions cell addition.
 * @param {Notebook} notebook
 * @param {Object} args
 * @param {string} args.pageId
 * @param {string} args.cellId
 * @returns {Notebook}
 */
export function undoAddWikipediaSuggestionsCell(notebook, { pageId, cellId }) {
  return removeCell(notebook, { pageId: pageId, cellId: cellId });
}

/**
 * Adds Wikipedia image cell to Notebook.
 * @param {Notebook} notebook
 * @param {Object} args
 * @returns {Promise<Notebook>}
 */
export function addWikipediaImageCell(notebook, { query, pageId }) {
  return new Promise((resolve, reject) => {
    _addWikipediaImageCell(notebook, query, pageId).then((notebook) => {
      resolve(notebook);
    });
  });
}

/**
 * Undoes a Wikipedia image cell addition.
 * @param {Notebook} notebook
 * @param {Object} args
 * @param {string} args.pageId
 * @param {string} args.cellId
 * @returns
 */
export function undoAddWikipediaImageCell(notebook, { pageId, cellId }) {
  return removeCell(notebook, { pageId: pageId, cellId: cellId });
}

/**
 * Adds a meaning cell to the Notebook.
 * @param {Notebook} notebook
 * @param {Object} args
 * @param {string} args.word
 * @param {string} args.pageId
 * @returns {Promise<Notebook>}
 */
export function addMeaningCell(notebook, { word, pageId }) {
  return new Promise((resolve, reject) => {
    _addMeaningCell(notebook, word, pageId).then((notebook) => {
      resolve(notebook);
    });
  });
}

/**
 * Undoes a meaning cell addition.
 * @param {Notebook} notebook
 * @param {Object} args
 * @param {string} args.pageId
 * @param {string} args.cellId
 * @returns {Notebook}
 */
export function undoAddMeaningCell(notebook, { pageId, cellId }) {
  return removeCell(notebook, { pageId: pageId, cellId: cellId });
}

/**
 * Adds a synonym cell to the Notebook.
 * @param {Notebook} notebook
 * @param {Object} args
 * @param {string} args.word
 * @param {string} args.pageId
 * @returns {Promise<Notebook>}
 */
export function addSynonymCell(notebook, { word, pageId }) {
  return new Promise((resolve, reject) => {
    _addSynonymCell(notebook, word, pageId).then((notebook) => {
      resolve(notebook);
    });
  });
}

/**
 * Undoes a synonym cell addition.
 * @param {Notebook} notebook
 * @param {Object} args
 * @param {string} args.pageId
 * @param {string} args.cellId
 * @returns {Notebook}
 */
export function undoAddSynonymCell(notebook, { pageId, cellId }) {
  return removeCell(notebook, { pageId: pageId, cellId: cellId });
}

/**
 * Adds an antonym cell to the Notebook.
 * @param {Notebook} notebook
 * @param {Object} args
 * @param {string} args.word
 * @param {string} args.pageId
 * @returns {Promise<Notebook>}
 */
export function addAntonymCell(notebook, { word, pageId }) {
  return new Promise((resolve, reject) => {
    _addAntonymCell(notebook, word, pageId).then((notebook) => {
      resolve(notebook);
    });
  });
}

/**
 * Undoes an antonym cell addition.
 * @param {Notebook} notebook
 * @param {Object} args
 * @param {string} args.pageId
 * @param {string} args.cellId
 * @returns {Notebook}
 */
export function undoAddAntonymCell(notebook, { pageId, cellId }) {
  return removeCell(notebook, { pageId: pageId, cellId: cellId });
}

/**
 * Returns the content of a cell.
 * @param {Notebook} notebook
 * @param {Object} args
 * @param {string} args.pageId
 * @param {string} args.cellId
 * @returns {string}
 */
export function getCellContent(notebook, { pageId, cellId }) {
  return notebook.pages[indexPage(notebook, { pageId: pageId })].cells[
    indexCell(notebook, { pageId: pageId, cellId: cellId })
  ].content;
}

/**
 * Changes the content of a cell
 * @param {Notebook} notebook
 * @param {Object} args
 * @param {string} args.pageId
 * @param {string} args.cellId
 * @param {string} args.content
 * @returns {Notebook}
 */
export function setCellContent(notebook, { pageId, cellId, content }) {
  notebook.pages[indexPage(notebook, { pageId: pageId })].cells[
    indexCell(notebook, { pageId: pageId, cellId: cellId })
  ].content = content;
  return notebook;
}

/**
 * Undoes the content change of a cell.
 * @param {*} notebook
 * @param {Object} args
 * @param {string} args.pageId
 * @param {string} args.cellId
 * @param {string} args.previousContent
 * @returns {Notebook}
 */
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

/**
 * Returns the data of a cell.
 * @param {Notebook} notebook
 * @param {Object} args
 * @param {string} args.pageId
 * @param {string} args.cellId
 * @returns {Object}
 */
export function getCellData(notebook, { pageId, cellId }) {
  return notebook.pages[indexPage(notebook, { pageId: pageId })].cells[
    indexCell(notebook, { pageId: pageId, cellId: cellId })
  ].data;
}

/**
 * Changes the data of a cell.
 * @param {*} notebook
 * @param {Object} args
 * @param {string} args.pageId
 * @param {string} args.cellId
 * @param {Object} args.data
 * @returns {Notebook}
 */
export function setCellData(notebook, { pageId, cellId, data }) {
  notebook.pages[indexPage(notebook, { pageId: pageId })].cells[
    indexCell(notebook, { pageId: pageId, cellId: cellId })
  ].data = data;
  return notebook;
}

/**
 * Undoes the change of data of a cell.
 * @param {Notebook} notebook
 * @param {Object} args
 * @param {string} args.pageId
 * @param {string} args.cellId
 * @param {Object} args.previousData
 * @returns {Notebook}
 */
export function undoSetCellData(notebook, { pageId, cellId, previousData }) {
  return setCellData(notebook, {
    pageId: pageId,
    cellId: cellId,
    data: previousData,
  });
}

/**
 * Undoes an command.
 * @param {Notebook} notebook
 * @param {Command} command
 * @returns {Notebook | undefined}
 */
export function undo(notebook, command) {
  switch (command.action.name) {
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

/**
 * Redoes an command.
 * @param {Notebook} notebook
 * @param {Command} command
 * @returns {Notebook | Promise<Notebook> | undefined}
 */
export function redo(notebook, command) {
  switch (command.action.name) {
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
