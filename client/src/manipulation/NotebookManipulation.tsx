import { v4 as uuidv4 } from "uuid";

import {
  addAntonymCell as _addAntonymCell,
  addEntitiesCell as _addEntitiesCell,
  addGenerateCell as _addGenerateCell,
  addMeaningCell as _addMeaningCell,
  addQuestionCell as _addQuestionCell,
  addSparseQuestionCell as _addSparseQuestionCell,
  addSynonymCell as _addSynonymCell,
  addWikipediaImageCell as _addWikipediaImageCell,
  addWikipediaSuggestionsCell as _addWikipediaSuggestionsCell,
  addWikipediaSummaryCell as _addWikipediaSummaryCell,
} from "../API/PhaedraAPI";
import {
  ICell,
  INotebook,
  INotebookCommand,
  IPage,
} from "./INotebookManipulation";

export function createNotebook({
  id,
  name,
  document_path,
  pages,
}: Partial<INotebook>): INotebook {
  if (id === undefined) id = uuidv4();
  if (name === undefined) name = "Untitled";
  if (document_path === undefined) document_path = undefined;
  if (pages === undefined)
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

export function createPage({ id, data, cells }: Partial<IPage>): IPage {
  if (id === undefined) id = uuidv4();
  if (data === undefined) data = {};
  if (cells === undefined) cells = [];

  return {
    id: id,
    data: data,
    cells: cells,
  };
}

export function createCell({ id, data, content }: Partial<ICell>): ICell {
  if (id === undefined) id = uuidv4();
  if (data === undefined) data = {};
  if (content === undefined) content = "";

  return {
    id: id,
    data: data,
    content: content,
  };
}

export function createCommand({
  action,
  page,
  pageId,
  cell,
  cellId,
  index,
  question,
  prompt,
  query,
  content,
  previousContent,
  data,
  previousData,
  word,
}: Partial<INotebookCommand>): INotebookCommand {
  return {
    action: action,
    page: page,
    pageId: pageId,
    cell: cell,
    cellId: cellId,
    index: index,
    question: question,
    prompt: prompt,
    query: query,
    content: content,
    previousContent: previousContent,
    data: data,
    previousData: previousData,
    word: word,
  };
}

export function insertPage(
  notebook: INotebook,
  { page, index }: Partial<INotebookCommand>
): INotebook {
  if (page === undefined) throw new Error("Page is undefined.");
  if (index === undefined) throw new Error("Index is undefined.");

  notebook.pages.splice(index, 0, page);
  return notebook;
}

export function undoInsertPage(
  notebook: INotebook,
  { page }: Partial<INotebookCommand>
): INotebook {
  if (page === undefined) throw new Error("Page is undefined.");

  return removePage(notebook, { pageId: page.id });
}

export function addPage(
  notebook: INotebook,
  { page }: Partial<INotebookCommand>
): INotebook {
  if (page === undefined) throw new Error("Page is undefined.");

  notebook.pages.push(page);
  return notebook;
}

export function undoAddPage(
  notebook: INotebook,
  { page }: Partial<INotebookCommand>
): INotebook {
  if (page === undefined) throw new Error("Page is undefined.");

  return removePage(notebook, { pageId: page.id });
}

export function indexPage(
  notebook: INotebook,
  { pageId }: Partial<INotebookCommand>
): number {
  if (pageId === undefined) throw new Error("PageId is undefined.");

  return notebook.pages.findIndex((page) => page.id === pageId);
}

export function getPage(
  notebook: INotebook,
  { pageId }: Partial<INotebookCommand>
): IPage | undefined {
  if (pageId === undefined) throw new Error("PageId is undefined.");

  return notebook.pages.find((page) => page.id === pageId);
}

export function removePage(
  notebook: INotebook,
  { pageId }: Partial<INotebookCommand>
): INotebook {
  if (pageId === undefined) throw new Error("PageId is undefined.");

  notebook.pages = notebook.pages.filter((page) => page.id !== pageId);
  return notebook;
}

export function undoRemovePage(
  notebook: INotebook,
  { page, index }: Partial<INotebookCommand>
): INotebook {
  if (page === undefined) throw new Error("Page is undefined.");
  if (index === undefined) throw new Error("Index is undefined.");

  return insertPage(notebook, { page, index });
}

export function insertCell(
  notebook: INotebook,
  { pageId, cell, index }: Partial<INotebookCommand>
): INotebook {
  if (pageId === undefined) throw new Error("PageId is undefined.");
  if (cell === undefined) throw new Error("Cell is undefined.");
  if (index === undefined) throw new Error("Index is undefined.");

  notebook.pages[indexPage(notebook, { pageId: pageId })].cells.splice(
    index,
    0,
    cell
  );
  return notebook;
}

export function undoInsertCell(
  notebook: INotebook,
  { pageId, cell }: Partial<INotebookCommand>
): INotebook {
  if (pageId === undefined) throw new Error("PageId is undefined.");
  if (cell === undefined) throw new Error("Cell is undefined.");

  return removeCell(notebook, { pageId: pageId, cellId: cell.id });
}

export function addCell(
  notebook: INotebook,
  { pageId, cell }: Partial<INotebookCommand>
): INotebook {
  if (pageId === undefined) throw new Error("PageId is undefined.");
  if (cell === undefined) throw new Error("Cell is undefined.");

  notebook.pages[indexPage(notebook, { pageId: pageId })].cells.push(cell);
  return notebook;
}

export function undoAddCell(
  notebook: INotebook,
  { pageId, cell }: Partial<INotebookCommand>
): INotebook {
  if (pageId === undefined) throw new Error("PageId is undefined.");
  if (cell === undefined) throw new Error("Cell is undefined.");

  return removeCell(notebook, { pageId: pageId, cellId: cell.id });
}

export function indexCell(
  notebook: INotebook,
  { pageId, cellId }: Partial<INotebookCommand>
): number {
  if (pageId === undefined) throw new Error("PageId is undefined.");
  if (cellId === undefined) throw new Error("CellId is undefined.");

  return notebook.pages[
    indexPage(notebook, { pageId: pageId })
  ].cells.findIndex((cell) => cell.id === cellId);
}

export function getCell(
  notebook: INotebook,
  { pageId, cellId }: Partial<INotebookCommand>
): ICell | undefined {
  if (pageId === undefined) throw new Error("PageId is undefined.");
  if (cellId === undefined) throw new Error("CellId is undefined.");

  return notebook.pages[indexPage(notebook, { pageId: pageId })].cells.find(
    (cell) => cell.id === cellId
  );
}

export function removeCell(
  notebook: INotebook,
  { pageId, cellId }: Partial<INotebookCommand>
): INotebook {
  if (pageId === undefined) throw new Error("PageId is undefined.");
  if (cellId === undefined) throw new Error("CellId is undefined.");

  notebook.pages[indexPage(notebook, { pageId: pageId })].cells =
    notebook.pages[indexPage(notebook, { pageId: pageId })].cells.filter(
      (cell) => cell.id !== cellId
    );
  return notebook;
}

export function undoRemoveCell(
  notebook: INotebook,
  { pageId, cell, index }: Partial<INotebookCommand>
): INotebook {
  if (pageId === undefined) throw new Error("PageId is undefined.");
  if (cell === undefined) throw new Error("Cell is undefined.");
  if (index === undefined) throw new Error("Index is undefined.");

  return insertCell(notebook, { pageId: pageId, cell: cell, index: index });
}

export function insertPlaceholderCell(
  notebook: INotebook,
  { pageId, index }: Partial<INotebookCommand>
): [INotebook, string] {
  if (pageId === undefined) throw new Error("PageId is undefined.");
  if (index === undefined) throw new Error("Index is undefined.");

  const id = uuidv4();
  const cell = createCell({
    id: id,
    data: {
      loading: true,
    },
  });
  const newNotebook = insertCell(notebook, {
    pageId: pageId,
    cell: cell,
    index: index,
  });

  return [newNotebook, id];
}

export function addPlaceholderCell(
  notebook: INotebook,
  { pageId }: Partial<INotebookCommand>
): [INotebook, string] {
  if (pageId === undefined) throw new Error("PageId is undefined.");

  const id = uuidv4();
  const cell = createCell({
    id: id,
    data: {
      loading: true,
    },
  });
  const newNotebook = addCell(notebook, { pageId: pageId, cell: cell });

  return [newNotebook, id];
}

export function addEntitiesCell(
  notebook: INotebook,
  { pageId, cellId }: Partial<INotebookCommand>
): Promise<INotebook> {
  if (pageId === undefined) throw new Error("PageId is undefined.");

  return _addEntitiesCell(notebook, pageId!, cellId!);
}

export function undoAddEntitiesCell(
  notebook: INotebook,
  { pageId, cellId }: Partial<INotebookCommand>
): INotebook {
  if (pageId === undefined) throw new Error("PageId is undefined.");
  if (cellId === undefined) throw new Error("CellId is undefined.");

  return removeCell(notebook, { pageId: pageId, cellId: cellId });
}

export function addQuestionCell(
  notebook: INotebook,
  { question, pageId, cellId }: Partial<INotebookCommand>
): Promise<INotebook> {
  if (question === undefined) throw new Error("Question is undefined.");
  if (pageId === undefined) throw new Error("PageId is undefined.");

  return _addQuestionCell(notebook, question, pageId!, cellId!);
}

export function undoAddQuestionCell(
  notebook: INotebook,
  { pageId, cellId }: Partial<INotebookCommand>
): INotebook {
  if (pageId === undefined) throw new Error("PageId is undefined.");
  if (cellId === undefined) throw new Error("CellId is undefined.");

  return removeCell(notebook, { pageId: pageId, cellId: cellId });
}

export function addSparseQuestionCell(
  notebook: INotebook,
  { question, pageId, cellId }: Partial<INotebookCommand>
): Promise<INotebook> {
  if (question === undefined) throw new Error("Question is undefined.");

  return _addSparseQuestionCell(notebook, question, pageId!, cellId!);
}

export function undoAddSparseQuestionCell(
  notebook: INotebook,
  { pageId, cellId }: Partial<INotebookCommand>
): INotebook {
  if (pageId === undefined) throw new Error("PageId is undefined.");
  if (cellId === undefined) throw new Error("CellId is undefined.");

  return removeCell(notebook, { pageId: pageId, cellId: cellId });
}

export function addGenerateCell(
  notebook: INotebook,
  { prompt, pageId, cellId }: Partial<INotebookCommand>
): Promise<INotebook> {
  if (prompt === undefined) throw new Error("Prompt is undefined.");
  if (pageId === undefined) throw new Error("PageId is undefined.");

  return _addGenerateCell(notebook, prompt, pageId!, cellId!);
}

export function undoAddGenerateCell(
  notebook: INotebook,
  { pageId, cellId }: Partial<INotebookCommand>
): INotebook {
  if (pageId === undefined) throw new Error("PageId is undefined.");
  if (cellId === undefined) throw new Error("CellId is undefined.");

  return removeCell(notebook, { pageId: pageId, cellId: cellId });
}

export function addWikipediaSummaryCell(
  notebook: INotebook,
  { query, pageId, cellId }: Partial<INotebookCommand>
): Promise<INotebook> {
  if (query === undefined) throw new Error("Query is undefined.");
  if (pageId === undefined) throw new Error("PageId is undefined.");

  return _addWikipediaSummaryCell(notebook, query, pageId!, cellId!);
}

export function undoAddWikipediaSummaryCell(
  notebook: INotebook,
  { pageId, cellId }: Partial<INotebookCommand>
): INotebook {
  if (pageId === undefined) throw new Error("PageId is undefined.");
  if (cellId === undefined) throw new Error("CellId is undefined.");

  return removeCell(notebook, { pageId: pageId, cellId: cellId });
}

export function addWikipediaSuggestionsCell(
  notebook: INotebook,
  { query, pageId, cellId }: Partial<INotebookCommand>
): Promise<INotebook> {
  if (query === undefined) throw new Error("Query is undefined.");
  if (pageId === undefined) throw new Error("PageId is undefined.");

  return _addWikipediaSuggestionsCell(notebook, query, pageId!, cellId!);
}

export function undoAddWikipediaSuggestionsCell(
  notebook: INotebook,
  { pageId, cellId }: Partial<INotebookCommand>
): INotebook {
  if (pageId === undefined) throw new Error("PageId is undefined.");
  if (cellId === undefined) throw new Error("CellId is undefined.");

  return removeCell(notebook, { pageId: pageId, cellId: cellId });
}

export function addWikipediaImageCell(
  notebook: INotebook,
  { query, pageId, cellId }: Partial<INotebookCommand>
): Promise<INotebook> {
  if (query === undefined) throw new Error("Query is undefined.");
  if (pageId === undefined) throw new Error("PageId is undefined.");

  return _addWikipediaImageCell(notebook, query, pageId!, cellId!);
}

export function undoAddWikipediaImageCell(
  notebook: INotebook,
  { pageId, cellId }: Partial<INotebookCommand>
): INotebook {
  if (pageId === undefined) throw new Error("PageId is undefined.");
  if (cellId === undefined) throw new Error("CellId is undefined.");

  return removeCell(notebook, { pageId: pageId, cellId: cellId });
}

export function addMeaningCell(
  notebook: INotebook,
  { word, pageId, cellId }: Partial<INotebookCommand>
): Promise<INotebook> {
  if (word === undefined) throw new Error("Word is undefined.");
  if (pageId === undefined) throw new Error("PageId is undefined.");

  return _addMeaningCell(notebook, word, pageId!, cellId!);
}

export function undoAddMeaningCell(
  notebook: INotebook,
  { pageId, cellId }: Partial<INotebookCommand>
): INotebook {
  if (pageId === undefined) throw new Error("PageId is undefined.");
  if (cellId === undefined) throw new Error("CellId is undefined.");

  return removeCell(notebook, { pageId: pageId, cellId: cellId });
}

export function addSynonymCell(
  notebook: INotebook,
  { word, pageId, cellId }: Partial<INotebookCommand>
): Promise<INotebook> {
  if (word === undefined) throw new Error("Word is undefined.");
  if (pageId === undefined) throw new Error("PageId is undefined.");

  return _addSynonymCell(notebook, word, pageId!, cellId!);
}

export function undoAddSynonymCell(
  notebook: INotebook,
  { pageId, cellId }: Partial<INotebookCommand>
): INotebook {
  if (pageId === undefined) throw new Error("PageId is undefined.");
  if (cellId === undefined) throw new Error("CellId is undefined.");

  return removeCell(notebook, { pageId: pageId, cellId: cellId });
}

export function addAntonymCell(
  notebook: INotebook,
  { word, pageId, cellId }: Partial<INotebookCommand>
): Promise<INotebook> {
  if (word === undefined) throw new Error("Word is undefined.");
  if (pageId === undefined) throw new Error("PageId is undefined.");

  return _addAntonymCell(notebook, word, pageId!, cellId!);
}

export function undoAddAntonymCell(
  notebook: INotebook,
  { pageId, cellId }: Partial<INotebookCommand>
): INotebook {
  if (pageId === undefined) throw new Error("PageId is undefined.");
  if (cellId === undefined) throw new Error("CellId is undefined.");

  return removeCell(notebook, { pageId: pageId, cellId: cellId });
}

export function getCellContent(
  notebook: INotebook,
  { pageId, cellId }: Partial<INotebookCommand>
): string {
  if (pageId === undefined) throw new Error("PageId is undefined.");
  if (cellId === undefined) throw new Error("CellId is undefined.");

  return notebook.pages[indexPage(notebook, { pageId: pageId })].cells[
    indexCell(notebook, { pageId: pageId, cellId: cellId })
  ].content;
}

export function setCellContent(
  notebook: INotebook,
  { pageId, cellId, content }: Partial<INotebookCommand>
): INotebook {
  if (pageId === undefined) throw new Error("PageId is undefined.");
  if (cellId === undefined) throw new Error("CellId is undefined.");
  if (content === undefined) throw new Error("Content is undefined.");

  notebook.pages[indexPage(notebook, { pageId: pageId })].cells[
    indexCell(notebook, { pageId: pageId, cellId: cellId })
  ].content = content;
  return notebook;
}

export function undoSetCellContent(
  notebook: INotebook,
  { pageId, cellId, previousContent }: Partial<INotebookCommand>
): INotebook {
  if (pageId === undefined) throw new Error("PageId is undefined.");
  if (cellId === undefined) throw new Error("CellId is undefined.");
  if (previousContent === undefined)
    throw new Error("PreviousContent is undefined.");

  return setCellContent(notebook, {
    pageId: pageId,
    cellId: cellId,
    content: previousContent,
  });
}

export function getCellData(
  notebook: INotebook,
  { pageId, cellId }: Partial<INotebookCommand>
): any {
  if (pageId === undefined) throw new Error("PageId is undefined.");
  if (cellId === undefined) throw new Error("CellId is undefined.");

  return notebook.pages[indexPage(notebook, { pageId: pageId })].cells[
    indexCell(notebook, { pageId: pageId, cellId: cellId })
  ].data;
}

export function setCellData(
  notebook: INotebook,
  { pageId, cellId, data }: Partial<INotebookCommand>
): INotebook {
  if (pageId === undefined) throw new Error("PageId is undefined.");
  if (cellId === undefined) throw new Error("CellId is undefined.");
  if (data === undefined) throw new Error("Data is undefined.");

  notebook.pages[indexPage(notebook, { pageId: pageId })].cells[
    indexCell(notebook, { pageId: pageId, cellId: cellId })
  ].data = data;
  return notebook;
}

export function undoSetCellData(
  notebook: INotebook,
  { pageId, cellId, previousData }: Partial<INotebookCommand>
): INotebook {
  if (pageId === undefined) throw new Error("PageId is undefined.");
  if (cellId === undefined) throw new Error("CellId is undefined.");
  if (previousData === undefined) throw new Error("PreviousData is undefined.");

  return setCellData(notebook, {
    pageId: pageId,
    cellId: cellId,
    data: previousData,
  });
}

export function undo(
  notebook: INotebook,
  command: Partial<INotebookCommand>
): INotebook {
  if (command.action === undefined) throw new Error("Action is undefined.");

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
    default:
      return notebook;
  }
}

export function redo(
  notebook: INotebook,
  command: Partial<INotebookCommand>
): INotebook | Promise<INotebook> {
  if (command.action === undefined) throw new Error("Action is undefined.");

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
    default:
      return notebook;
  }
}

export function isCell(element: ICell | IPage | INotebook): boolean {
  return "id" in element && "data" in element && "content" in element;
}

export function isPage(element: ICell | IPage | INotebook): boolean {
  return "id" in element && "data" in element && "cells" in element;
}

export function isNotebook(element: ICell | IPage | INotebook): boolean {
  return "id" in element && "pages" in element;
}
