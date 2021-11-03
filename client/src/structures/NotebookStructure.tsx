// TODO: refactor and add schema validation

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
import { strings } from "../resources/strings";

export interface ICell {
  id: string;
  data: any;
  content: string;
}

export interface IPage {
  id: string;
  data: any;
  cells: ICell[];
}

export interface INotebook {
  id: string;
  name: string;
  document_path?: string;
  pages: IPage[];
}

export interface INotebookManipulationArguments {
  action?: string;
  page?: IPage;
  pageId?: string;
  cell?: ICell;
  cellId?: string;
  index?: number;
  question?: string;
  prompt?: string;
  query?: string;
  content?: string;
  previousContent?: string;
  data?: any;
  previousData?: any;
  word?: string;
  pageIndex?: number;
  cellIndex?: number;
}

export type INotebookManipulation = (
  notebook: INotebook,
  manipulationArguments: INotebookManipulationArguments
) => INotebook | Promise<INotebook>;

export function createNotebook({
  id,
  name,
  document_path,
  pages,
}: Partial<INotebook>): INotebook {
  if (id === undefined) id = uuidv4();
  if (name === undefined) name = strings.newNotebookTitle;
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
  if (content === undefined) content = strings.newCellContent;

  return {
    id: id,
    data: data,
    content: content,
  };
}

export function createArguments({
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
}: Partial<INotebookManipulationArguments>): INotebookManipulationArguments {
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

export function insertPageSync(
  notebook: INotebook,
  { page, index }: Partial<INotebookManipulationArguments>
): INotebook {
  if (page === undefined) throw new Error("Page is undefined.");
  if (index === undefined) throw new Error("Index is undefined.");

  notebook.pages.splice(index, 0, page);
  return notebook;
}

export function undoInsertPageSync(
  notebook: INotebook,
  { page }: Partial<INotebookManipulationArguments>
): INotebook {
  if (page === undefined) throw new Error("Page is undefined.");

  return removePageSync(notebook, { pageId: page.id });
}

export function addPageSync(
  notebook: INotebook,
  { page }: Partial<INotebookManipulationArguments>
): INotebook {
  if (page === undefined) throw new Error("Page is undefined.");

  notebook.pages.push(page);
  return notebook;
}

export function undoAddPageSync(
  notebook: INotebook,
  { page }: Partial<INotebookManipulationArguments>
): INotebook {
  if (page === undefined) throw new Error("Page is undefined.");

  return removePageSync(notebook, { pageId: page.id });
}

export function removePageSync(
  notebook: INotebook,
  { pageId }: Partial<INotebookManipulationArguments>
): INotebook {
  if (pageId === undefined) throw new Error("PageId is undefined.");

  notebook.pages = notebook.pages.filter((page) => page.id !== pageId);
  return notebook;
}

export function undoRemovePageSync(
  notebook: INotebook,
  { page, index }: Partial<INotebookManipulationArguments>
): INotebook {
  if (page === undefined) throw new Error("Page is undefined.");
  if (index === undefined) throw new Error("Index is undefined.");

  return insertPageSync(notebook, { page, index });
}

export function insertCellSync(
  notebook: INotebook,
  { pageId, cell, index }: Partial<INotebookManipulationArguments>
): INotebook {
  if (pageId === undefined) throw new Error("PageId is undefined.");
  if (cell === undefined) throw new Error("Cell is undefined.");
  if (index === undefined) throw new Error("Index is undefined.");

  notebook.pages[indexPage(notebook, pageId)].cells.splice(index, 0, cell);
  return notebook;
}

export function undoInsertCellSync(
  notebook: INotebook,
  { pageId, cell }: Partial<INotebookManipulationArguments>
): INotebook {
  if (pageId === undefined) throw new Error("PageId is undefined.");
  if (cell === undefined) throw new Error("Cell is undefined.");

  return removeCellSync(notebook, { pageId: pageId, cellId: cell.id });
}

export function addCellSync(
  notebook: INotebook,
  { pageId, cell }: Partial<INotebookManipulationArguments>
): INotebook {
  if (pageId === undefined) throw new Error("PageId is undefined.");
  if (cell === undefined) throw new Error("Cell is undefined.");

  notebook.pages[indexPage(notebook, pageId)].cells.push(cell);
  return notebook;
}

export function undoAddCellSync(
  notebook: INotebook,
  { pageId, cell }: Partial<INotebookManipulationArguments>
): INotebook {
  if (pageId === undefined) throw new Error("PageId is undefined.");
  if (cell === undefined) throw new Error("Cell is undefined.");

  return removeCellSync(notebook, { pageId: pageId, cellId: cell.id });
}

export function removeCellSync(
  notebook: INotebook,
  { pageId, cellId }: Partial<INotebookManipulationArguments>
): INotebook {
  if (pageId === undefined) throw new Error("PageId is undefined.");
  if (cellId === undefined) throw new Error("CellId is undefined.");

  notebook.pages[indexPage(notebook, pageId)].cells = notebook.pages[
    indexPage(notebook, pageId)
  ].cells.filter((cell) => cell.id !== cellId);
  return notebook;
}

export function undoRemoveCellSync(
  notebook: INotebook,
  { pageId, cell, index }: Partial<INotebookManipulationArguments>
): INotebook {
  if (pageId === undefined) throw new Error("PageId is undefined.");
  if (cell === undefined) throw new Error("Cell is undefined.");
  if (index === undefined) throw new Error("Index is undefined.");

  return insertCellSync(notebook, { pageId: pageId, cell: cell, index: index });
}

export function insertPlaceholderCellSync(
  notebook: INotebook,
  { pageId, index }: Partial<INotebookManipulationArguments>
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
  const newNotebook = insertCellSync(notebook, {
    pageId: pageId,
    cell: cell,
    index: index,
  });

  return [newNotebook, id];
}

export function addPlaceholderCellSync(
  notebook: INotebook,
  { pageId }: Partial<INotebookManipulationArguments>
): [INotebook, string] {
  if (pageId === undefined) throw new Error("PageId is undefined.");

  const id = uuidv4();
  const cell = createCell({
    id: id,
    data: {
      loading: true,
    },
  });
  const newNotebook = addCellSync(notebook, { pageId: pageId, cell: cell });

  return [newNotebook, id];
}

export function addEntitiesCell(
  notebook: INotebook,
  { pageId, cellId }: Partial<INotebookManipulationArguments>
): Promise<INotebook> {
  if (pageId === undefined) throw new Error("PageId is undefined.");

  return _addEntitiesCell(notebook, pageId!, cellId!);
}

export function undoAddEntitiesCell(
  notebook: INotebook,
  { pageId, cellId }: Partial<INotebookManipulationArguments>
): INotebook {
  if (pageId === undefined) throw new Error("PageId is undefined.");
  if (cellId === undefined) throw new Error("CellId is undefined.");

  return removeCellSync(notebook, { pageId: pageId, cellId: cellId });
}

export function addQuestionCell(
  notebook: INotebook,
  { question, pageId, cellId }: Partial<INotebookManipulationArguments>
): Promise<INotebook> {
  if (question === undefined) throw new Error("Question is undefined.");
  if (pageId === undefined) throw new Error("PageId is undefined.");

  return _addQuestionCell(notebook, question, pageId!, cellId!);
}

export function undoAddQuestionCell(
  notebook: INotebook,
  { pageId, cellId }: Partial<INotebookManipulationArguments>
): INotebook {
  if (pageId === undefined) throw new Error("PageId is undefined.");
  if (cellId === undefined) throw new Error("CellId is undefined.");

  return removeCellSync(notebook, { pageId: pageId, cellId: cellId });
}

export function addSparseQuestionCell(
  notebook: INotebook,
  { question, pageId, cellId }: Partial<INotebookManipulationArguments>
): Promise<INotebook> {
  if (question === undefined) throw new Error("Question is undefined.");

  return _addSparseQuestionCell(notebook, question, pageId!, cellId!);
}

export function undoAddSparseQuestionCell(
  notebook: INotebook,
  { pageId, cellId }: Partial<INotebookManipulationArguments>
): INotebook {
  if (pageId === undefined) throw new Error("PageId is undefined.");
  if (cellId === undefined) throw new Error("CellId is undefined.");

  return removeCellSync(notebook, { pageId: pageId, cellId: cellId });
}

export function addGenerateCell(
  notebook: INotebook,
  { prompt, pageId, cellId }: Partial<INotebookManipulationArguments>
): Promise<INotebook> {
  if (prompt === undefined) throw new Error("Prompt is undefined.");
  if (pageId === undefined) throw new Error("PageId is undefined.");

  return _addGenerateCell(notebook, prompt, pageId!, cellId!);
}

export function undoAddGenerateCell(
  notebook: INotebook,
  { pageId, cellId }: Partial<INotebookManipulationArguments>
): INotebook {
  if (pageId === undefined) throw new Error("PageId is undefined.");
  if (cellId === undefined) throw new Error("CellId is undefined.");

  return removeCellSync(notebook, { pageId: pageId, cellId: cellId });
}

export function addWikipediaSummaryCell(
  notebook: INotebook,
  { query, pageId, cellId }: Partial<INotebookManipulationArguments>
): Promise<INotebook> {
  if (query === undefined) throw new Error("Query is undefined.");
  if (pageId === undefined) throw new Error("PageId is undefined.");

  return _addWikipediaSummaryCell(notebook, query, pageId!, cellId!);
}

export function undoAddWikipediaSummaryCell(
  notebook: INotebook,
  { pageId, cellId }: Partial<INotebookManipulationArguments>
): INotebook {
  if (pageId === undefined) throw new Error("PageId is undefined.");
  if (cellId === undefined) throw new Error("CellId is undefined.");

  return removeCellSync(notebook, { pageId: pageId, cellId: cellId });
}

export function addWikipediaSuggestionsCell(
  notebook: INotebook,
  { query, pageId, cellId }: Partial<INotebookManipulationArguments>
): Promise<INotebook> {
  if (query === undefined) throw new Error("Query is undefined.");
  if (pageId === undefined) throw new Error("PageId is undefined.");

  return _addWikipediaSuggestionsCell(notebook, query, pageId!, cellId!);
}

export function undoAddWikipediaSuggestionsCell(
  notebook: INotebook,
  { pageId, cellId }: Partial<INotebookManipulationArguments>
): INotebook {
  if (pageId === undefined) throw new Error("PageId is undefined.");
  if (cellId === undefined) throw new Error("CellId is undefined.");

  return removeCellSync(notebook, { pageId: pageId, cellId: cellId });
}

export function addWikipediaImageCell(
  notebook: INotebook,
  { query, pageId, cellId }: Partial<INotebookManipulationArguments>
): Promise<INotebook> {
  if (query === undefined) throw new Error("Query is undefined.");
  if (pageId === undefined) throw new Error("PageId is undefined.");

  return _addWikipediaImageCell(notebook, query, pageId!, cellId!);
}

export function undoAddWikipediaImageCell(
  notebook: INotebook,
  { pageId, cellId }: Partial<INotebookManipulationArguments>
): INotebook {
  if (pageId === undefined) throw new Error("PageId is undefined.");
  if (cellId === undefined) throw new Error("CellId is undefined.");

  return removeCellSync(notebook, { pageId: pageId, cellId: cellId });
}

export function addMeaningCell(
  notebook: INotebook,
  { word, pageId, cellId }: Partial<INotebookManipulationArguments>
): Promise<INotebook> {
  if (word === undefined) throw new Error("Word is undefined.");
  if (pageId === undefined) throw new Error("PageId is undefined.");

  return _addMeaningCell(notebook, word, pageId!, cellId!);
}

export function undoAddMeaningCell(
  notebook: INotebook,
  { pageId, cellId }: Partial<INotebookManipulationArguments>
): INotebook {
  if (pageId === undefined) throw new Error("PageId is undefined.");
  if (cellId === undefined) throw new Error("CellId is undefined.");

  return removeCellSync(notebook, { pageId: pageId, cellId: cellId });
}

export function addSynonymCell(
  notebook: INotebook,
  { word, pageId, cellId }: Partial<INotebookManipulationArguments>
): Promise<INotebook> {
  if (word === undefined) throw new Error("Word is undefined.");
  if (pageId === undefined) throw new Error("PageId is undefined.");

  return _addSynonymCell(notebook, word, pageId!, cellId!);
}

export function undoAddSynonymCell(
  notebook: INotebook,
  { pageId, cellId }: Partial<INotebookManipulationArguments>
): INotebook {
  if (pageId === undefined) throw new Error("PageId is undefined.");
  if (cellId === undefined) throw new Error("CellId is undefined.");

  return removeCellSync(notebook, { pageId: pageId, cellId: cellId });
}

export function addAntonymCell(
  notebook: INotebook,
  { word, pageId, cellId }: Partial<INotebookManipulationArguments>
): Promise<INotebook> {
  if (word === undefined) throw new Error("Word is undefined.");
  if (pageId === undefined) throw new Error("PageId is undefined.");

  return _addAntonymCell(notebook, word, pageId!, cellId!);
}

export function undoAddAntonymCell(
  notebook: INotebook,
  { pageId, cellId }: Partial<INotebookManipulationArguments>
): INotebook {
  if (pageId === undefined) throw new Error("PageId is undefined.");
  if (cellId === undefined) throw new Error("CellId is undefined.");

  return removeCellSync(notebook, { pageId: pageId, cellId: cellId });
}

export function setCellContentSync(
  notebook: INotebook,
  { pageId, cellId, content }: Partial<INotebookManipulationArguments>
): INotebook {
  if (pageId === undefined) throw new Error("PageId is undefined.");
  if (cellId === undefined) throw new Error("CellId is undefined.");
  if (content === undefined) throw new Error("Content is undefined.");

  notebook.pages[indexPage(notebook, pageId)].cells[
    indexCell(notebook, pageId, cellId)
  ].content = content;
  return notebook;
}

export function undoSetCellContentSync(
  notebook: INotebook,
  { pageId, cellId, previousContent }: Partial<INotebookManipulationArguments>
): INotebook {
  if (pageId === undefined) throw new Error("PageId is undefined.");
  if (cellId === undefined) throw new Error("CellId is undefined.");
  if (previousContent === undefined)
    throw new Error("PreviousContent is undefined.");

  return setCellContentSync(notebook, {
    pageId: pageId,
    cellId: cellId,
    content: previousContent,
  });
}

export function setCellDataSync(
  notebook: INotebook,
  { pageId, cellId, data }: Partial<INotebookManipulationArguments>
): INotebook {
  if (pageId === undefined) throw new Error("PageId is undefined.");
  if (cellId === undefined) throw new Error("CellId is undefined.");
  if (data === undefined) throw new Error("Data is undefined.");

  notebook.pages[indexPage(notebook, pageId)].cells[
    indexCell(notebook, pageId, cellId)
  ].data = data;
  return notebook;
}

export function undoSetCellDataSync(
  notebook: INotebook,
  { pageId, cellId, previousData }: Partial<INotebookManipulationArguments>
): INotebook {
  if (pageId === undefined) throw new Error("PageId is undefined.");
  if (cellId === undefined) throw new Error("CellId is undefined.");
  if (previousData === undefined) throw new Error("PreviousData is undefined.");

  return setCellDataSync(notebook, {
    pageId: pageId,
    cellId: cellId,
    data: previousData,
  });
}

export function undo(
  notebook: INotebook,
  command: Partial<INotebookManipulationArguments>
): INotebook {
  if (command.action === undefined) throw new Error("Action is undefined.");

  let undoManipulation = getUndoManipulation(command);
  return undoManipulation(notebook, command) as INotebook;
}

export function redo(
  notebook: INotebook,
  command: Partial<INotebookManipulationArguments>
): INotebook | Promise<INotebook> {
  if (command.action === undefined) throw new Error("Action is undefined.");

  let redoManipulation = getRedoManipulation(command);
  return redoManipulation(notebook, command);
}

export function indexPage(notebook: INotebook, pageId: string): number {
  return notebook.pages.findIndex((page) => page.id === pageId);
}

export function getPage(
  notebook: INotebook,
  pageId: string
): IPage | undefined {
  return notebook.pages.find((page) => page.id === pageId);
}

export function indexCell(
  notebook: INotebook,
  pageId: string,
  cellId: string
): number {
  return notebook.pages[indexPage(notebook, pageId)].cells.findIndex(
    (cell) => cell.id === cellId
  );
}

export function getCell(
  notebook: INotebook,
  pageId: string,
  cellId: string
): ICell | undefined {
  return notebook.pages[indexPage(notebook, pageId)].cells.find(
    (cell) => cell.id === cellId
  );
}

export function getCellContent(
  notebook: INotebook,
  pageId: string,
  cellId: string
): string {
  return notebook.pages[indexPage(notebook, pageId)].cells[
    indexCell(notebook, pageId, cellId)
  ].content;
}

export function getCellData(
  notebook: INotebook,
  pageId: string,
  cellId: string
): any {
  return notebook.pages[indexPage(notebook, pageId)].cells[
    indexCell(notebook, pageId, cellId)
  ].data;
}

export function collectComplementaryArguments(
  notebook: INotebook,
  manipulation: INotebookManipulation,
  args: INotebookManipulationArguments
) {
  let newArgs = { ...args };

  switch (manipulation.name) {
    case "removePageSync":
      const page = getPage(notebook, args.pageId!);
      const pageIndex = indexPage(notebook, args.pageId!);
      newArgs = { ...newArgs, page: page, pageIndex: pageIndex };
      break;
    case "removeCellSync":
      const cell = getCell(notebook, args.pageId!, args.cellId!);
      const cellIndex = indexCell(notebook, args.pageId!, args.cellId!);
      newArgs = { ...newArgs, cell: cell, cellIndex: cellIndex };
      break;
    case "setCellContentSync":
      const previousContent = getCellContent(
        notebook,
        args.pageId!,
        args.cellId!
      );
      newArgs = { ...newArgs, previousContent: previousContent };
      break;
    case "setCellDataSync":
      const previousData = getCellData(notebook, args.pageId!, args.cellId!);
      newArgs = { ...newArgs, previousData: previousData };
      break;
    default:
      break;
  }
  return newArgs;
}

export function getUndoManipulation(
  args: INotebookManipulationArguments
): INotebookManipulation {
  switch (args.action) {
    case "insertPageSync":
      return undoInsertPageSync;
    case "addPageSync":
      return undoAddPageSync;
    case "removePageSync":
      return undoRemovePageSync;
    case "insertCellSync":
      return undoInsertCellSync;
    case "addCellSync":
      return undoAddCellSync;
    case "removeCellSync":
      return undoRemoveCellSync;
    case "setCellContentSync":
      return undoSetCellContentSync;
    case "setCellDataSync":
      return undoSetCellDataSync;
    case "addEntitiesCell":
      return undoAddEntitiesCell;
    case "addQuestionCell":
      return undoAddQuestionCell;
    case "addSparseQuestionCell":
      return undoAddSparseQuestionCell;
    case "addGenerateCell":
      return undoAddGenerateCell;
    case "addWikipediaSummaryCell":
      return undoAddWikipediaSummaryCell;
    case "addWikipediaSuggestionsCell":
      return undoAddWikipediaSuggestionsCell;
    case "addWikipediaImageCell":
      return undoAddWikipediaImageCell;
    case "addMeaningCell":
      return undoAddMeaningCell;
    case "addSynonymCell":
      return undoAddSynonymCell;
    case "addAntonymCell":
      return undoAddAntonymCell;
    default:
      throw new Error("Unreachable");
  }
}

export function getRedoManipulation(
  args: INotebookManipulationArguments
): INotebookManipulation {
  switch (args.action) {
    case "insertPageSync":
      return insertPageSync;
    case "addPageSync":
      return addPageSync;
    case "removePageSync":
      return removePageSync;
    case "insertCellSync":
      return insertCellSync;
    case "addCellSync":
      return addCellSync;
    case "removeCellSync":
      return removeCellSync;
    case "setCellContentSync":
      return setCellContentSync;
    case "setCellDataSync":
      return setCellDataSync;
    case "addEntitiesCell":
      return addEntitiesCell;
    case "addQuestionCell":
      return addQuestionCell;
    case "addSparseQuestionCell":
      return addSparseQuestionCell;
    case "addGenerateCell":
      return addGenerateCell;
    case "addWikipediaSummaryCell":
      return addWikipediaSummaryCell;
    case "addWikipediaSuggestionsCell":
      return addWikipediaSuggestionsCell;
    case "addWikipediaImageCell":
      return addWikipediaImageCell;
    case "addMeaningCell":
      return addMeaningCell;
    case "addSynonymCell":
      return addSynonymCell;
    case "addAntonymCell":
      return addAntonymCell;
    default:
      throw new Error("Unreachable");
  }
}

export function isAsync(args: INotebookManipulationArguments): boolean {
  switch (args.action) {
    case "addEntitiesCell":
    case "addQuestionCell":
    case "addSparseQuestionCell":
    case "addGenerateCell":
    case "addWikipediaSummaryCell":
    case "addWikipediaSuggestionsCell":
    case "addWikipediaImageCell":
    case "addMeaningCell":
    case "addSynonymCell":
    case "addAntonymCell":
      return true;
    default:
      return false;
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
