import { v4 as uuidv4 } from "uuid";

import {
  addAntonymCell as _addAntonymCell,
  addEntitiesCell as _addEntitiesCell,
  addGenerateCell as _addGenerateCell,
  addImageCell as _addImageCell,
  addMeaningCell as _addMeaningCell,
  addQuestionCell as _addQuestionCell,
  addSparseQuestionCell as _addSparseQuestionCell,
  addSuggestionsCell as _addSuggestionsCell,
  addSummaryCell as _addSummaryCell,
  addSynonymCell as _addSynonymCell,
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

export function makeNotebookUnique(notebook: INotebook): INotebook {
  return {
    ...notebook,
    id: uuidv4(),
    pages: notebook.pages.map(makePageUnique),
  };
}

export function makePageUnique(page: IPage): IPage {
  return {
    ...page,
    id: uuidv4(),
    cells: page.cells.map(makeCellUnique),
  };
}

export function makeCellUnique(cell: ICell): ICell {
  return {
    ...cell,
    id: uuidv4(),
  };
}

interface IInsertPageSyncArguments {
  page: IPage;
  index: number;
}

export function insertPageSync(
  notebook: INotebook,
  { page, index }: IInsertPageSyncArguments
): INotebook {
  notebook.pages.splice(index, 0, page);
  return notebook;
}

interface IUndoInsertPageSyncArguments {
  page: IPage;
}

export function undoInsertPageSync(
  notebook: INotebook,
  { page }: IUndoInsertPageSyncArguments
): INotebook {
  return removePageSync(notebook, { pageId: page.id });
}

interface IAddPageSyncArguments {
  page: IPage;
}

export function addPageSync(
  notebook: INotebook,
  { page }: IAddPageSyncArguments
): INotebook {
  notebook.pages.push(page);
  return notebook;
}

interface IUndoAddPageSyncArguments {
  page: IPage;
}

export function undoAddPageSync(
  notebook: INotebook,
  { page }: IUndoAddPageSyncArguments
): INotebook {
  return removePageSync(notebook, { pageId: page.id });
}

interface IRemovePageSyncArguments {
  pageId: string;
}

export function removePageSync(
  notebook: INotebook,
  { pageId }: IRemovePageSyncArguments
): INotebook {
  notebook.pages = notebook.pages.filter((page) => page.id !== pageId);
  return notebook;
}

interface IUndoRemovePageSyncArguments {
  page: IPage;
  index: number;
}

export function undoRemovePageSync(
  notebook: INotebook,
  { page, index }: IUndoRemovePageSyncArguments
): INotebook {
  return insertPageSync(notebook, { page, index });
}

interface IInsertCellSyncArguments {
  pageId: string;
  cell: ICell;
  index: number;
}

export function insertCellSync(
  notebook: INotebook,
  { pageId, cell, index }: IInsertCellSyncArguments
): INotebook {
  notebook.pages[indexPage(notebook, pageId)].cells.splice(index, 0, cell);
  return notebook;
}

interface IUndoInsertCellSyncArguments {
  pageId: string;
  cell: ICell;
}

export function undoInsertCellSync(
  notebook: INotebook,
  { pageId, cell }: IUndoInsertCellSyncArguments
): INotebook {
  return removeCellSync(notebook, { pageId: pageId, cellId: cell.id });
}

interface IAddCellSyncArguments {
  pageId: string;
  cell: ICell;
}

export function addCellSync(
  notebook: INotebook,
  { pageId, cell }: IAddCellSyncArguments
): INotebook {
  notebook.pages[indexPage(notebook, pageId)].cells.push(cell);
  return notebook;
}

interface IUndoAddCellSyncArguments {
  pageId: string;
  cell: ICell;
}

export function undoAddCellSync(
  notebook: INotebook,
  { pageId, cell }: IUndoAddCellSyncArguments
): INotebook {
  return removeCellSync(notebook, { pageId: pageId, cellId: cell.id });
}

interface IRemoveCellSyncArguments {
  pageId: string;
  cellId: string;
}

export function removeCellSync(
  notebook: INotebook,
  { pageId, cellId }: IRemoveCellSyncArguments
): INotebook {
  notebook.pages[indexPage(notebook, pageId)].cells = notebook.pages[
    indexPage(notebook, pageId)
  ].cells.filter((cell) => cell.id !== cellId);
  return notebook;
}

interface IUndoRemoveCellSyncArguments {
  pageId: string;
  cell: ICell;
  index: number;
}

export function undoRemoveCellSync(
  notebook: INotebook,
  { pageId, cell, index }: IUndoRemoveCellSyncArguments
): INotebook {
  return insertCellSync(notebook, { pageId: pageId, cell: cell, index: index });
}

interface IInsertPlaceholderSyncArguments {
  pageId: string;
  index: number;
}

// * This is not a NotebookManipulation, but it is a helper function async NotebookManipulations
export function insertPlaceholderCellSync(
  notebook: INotebook,
  { pageId, index }: IInsertPlaceholderSyncArguments
): [INotebook, string] {
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

export function undoInsertPlaceholderCellSync(
  notebook: INotebook,
  { pageId, cellId }: IRemoveCellSyncArguments
): INotebook {
  return removeCellSync(notebook, { pageId: pageId, cellId: cellId });
}

interface IAddPlaceholderSyncArguments {
  pageId: string;
}

// * This is not a NotebookManipulation, but it is a helper function async NotebookManipulations
export function addPlaceholderCellSync(
  notebook: INotebook,
  { pageId }: IAddPlaceholderSyncArguments
): [INotebook, string] {
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

export function undoAddPlaceholderCellSync(
  notebook: INotebook,
  { pageId, cellId }: IRemoveCellSyncArguments
): INotebook {
  return removeCellSync(notebook, { pageId: pageId, cellId: cellId });
}

interface IAddEntitiesCellArguments {
  pageId: string;
  cellId?: string;
}

export function addEntitiesCell(
  notebook: INotebook,
  { pageId, cellId }: IAddEntitiesCellArguments
): Promise<INotebook> {
  return _addEntitiesCell(notebook, pageId!, cellId!);
}

export function undoAddEntitiesCell(
  notebook: INotebook,
  { pageId, cellId }: IRemoveCellSyncArguments
): INotebook {
  return removeCellSync(notebook, { pageId: pageId, cellId: cellId });
}

interface IAddQuestionCellArguments {
  question: string;
  pageId: string;
  cellId?: string;
}

export function addQuestionCell(
  notebook: INotebook,
  { question, pageId, cellId }: IAddQuestionCellArguments
): Promise<INotebook> {
  return _addQuestionCell(notebook, question, pageId!, cellId!);
}

export function undoAddQuestionCell(
  notebook: INotebook,
  { pageId, cellId }: IRemoveCellSyncArguments
): INotebook {
  return removeCellSync(notebook, { pageId: pageId, cellId: cellId });
}

interface IAddSparseQuestionCellArguments {
  question: string;
  pageId: string;
  cellId?: string;
}

export function addSparseQuestionCell(
  notebook: INotebook,
  { question, pageId, cellId }: IAddSparseQuestionCellArguments
): Promise<INotebook> {
  return _addSparseQuestionCell(notebook, question, pageId!, cellId!);
}

export function undoAddSparseQuestionCell(
  notebook: INotebook,
  { pageId, cellId }: IRemoveCellSyncArguments
): INotebook {
  return removeCellSync(notebook, { pageId: pageId, cellId: cellId });
}

interface IAddGenerationCellArguments {
  prompt: string;
  pageId: string;
  cellId?: string;
}

export function addGenerationCell(
  notebook: INotebook,
  { prompt, pageId, cellId }: IAddGenerationCellArguments
): Promise<INotebook> {
  return _addGenerateCell(notebook, prompt, pageId!, cellId!);
}

export function undoAddGenerateCell(
  notebook: INotebook,
  { pageId, cellId }: IRemoveCellSyncArguments
): INotebook {
  return removeCellSync(notebook, { pageId: pageId, cellId: cellId });
}

interface IAddSummaryCellArguments {
  query: string;
  pageId: string;
  cellId?: string;
}

export function addSummaryCell(
  notebook: INotebook,
  { query, pageId, cellId }: IAddSummaryCellArguments
): Promise<INotebook> {
  return _addSummaryCell(notebook, query, pageId!, cellId!);
}

export function undoAddSummaryCell(
  notebook: INotebook,
  { pageId, cellId }: IRemoveCellSyncArguments
): INotebook {
  return removeCellSync(notebook, { pageId: pageId, cellId: cellId });
}

interface IAddSuggestionsCellArguments {
  query: string;
  pageId: string;
  cellId?: string;
}

export function addSuggestionsCell(
  notebook: INotebook,
  { query, pageId, cellId }: IAddSuggestionsCellArguments
): Promise<INotebook> {
  return _addSuggestionsCell(notebook, query, pageId!, cellId!);
}

export function undoAddSuggestionsCell(
  notebook: INotebook,
  { pageId, cellId }: IRemoveCellSyncArguments
): INotebook {
  return removeCellSync(notebook, { pageId: pageId, cellId: cellId });
}

interface IAddImageCellArguments {
  query: string;
  pageId: string;
  cellId?: string;
}

export function addImageCell(
  notebook: INotebook,
  { query, pageId, cellId }: IAddImageCellArguments
): Promise<INotebook> {
  return _addImageCell(notebook, query, pageId!, cellId!);
}

export function undoAddImageCell(
  notebook: INotebook,
  { pageId, cellId }: IRemoveCellSyncArguments
): INotebook {
  return removeCellSync(notebook, { pageId: pageId, cellId: cellId });
}

interface IAddMeaningCellArguments {
  word: string;
  pageId: string;
  cellId?: string;
}

export function addMeaningCell(
  notebook: INotebook,
  { word, pageId, cellId }: IAddMeaningCellArguments
): Promise<INotebook> {
  return _addMeaningCell(notebook, word, pageId!, cellId!);
}

export function undoAddMeaningCell(
  notebook: INotebook,
  { pageId, cellId }: IRemoveCellSyncArguments
): INotebook {
  return removeCellSync(notebook, { pageId: pageId, cellId: cellId });
}

interface IAddSynonymCellArguments {
  word: string;
  pageId: string;
  cellId?: string;
}

export function addSynonymCell(
  notebook: INotebook,
  { word, pageId, cellId }: IAddSynonymCellArguments
): Promise<INotebook> {
  return _addSynonymCell(notebook, word, pageId!, cellId!);
}

export function undoAddSynonymCell(
  notebook: INotebook,
  { pageId, cellId }: IRemoveCellSyncArguments
): INotebook {
  return removeCellSync(notebook, { pageId: pageId, cellId: cellId });
}

interface IAddAntonymCellArguments {
  word: string;
  pageId: string;
  cellId?: string;
}

export function addAntonymCell(
  notebook: INotebook,
  { word, pageId, cellId }: IAddAntonymCellArguments
): Promise<INotebook> {
  return _addAntonymCell(notebook, word, pageId!, cellId!);
}

export function undoAddAntonymCell(
  notebook: INotebook,
  { pageId, cellId }: IRemoveCellSyncArguments
): INotebook {
  return removeCellSync(notebook, { pageId: pageId, cellId: cellId });
}

interface ISetCellContentSyncArguments {
  pageId: string;
  cellId: string;
  content: string;
}

export function setCellContentSync(
  notebook: INotebook,
  { pageId, cellId, content }: ISetCellContentSyncArguments
): INotebook {
  notebook.pages[indexPage(notebook, pageId)].cells[
    indexCell(notebook, pageId, cellId)
  ].content = content;
  return notebook;
}

interface IUndoSetCellContentSyncArguments {
  pageId: string;
  cellId: string;
  previousContent: string;
}

export function undoSetCellContentSync(
  notebook: INotebook,
  { pageId, cellId, previousContent }: IUndoSetCellContentSyncArguments
): INotebook {
  if (previousContent === undefined)
    throw new Error("PreviousContent is undefined.");

  return setCellContentSync(notebook, {
    pageId: pageId,
    cellId: cellId,
    content: previousContent,
  });
}

interface ISetCellDataSyncArguments {
  pageId: string;
  cellId: string;
  data: any;
}

export function setCellDataSync(
  notebook: INotebook,
  { pageId, cellId, data }: ISetCellDataSyncArguments
): INotebook {
  notebook.pages[indexPage(notebook, pageId)].cells[
    indexCell(notebook, pageId, cellId)
  ].data = data;
  return notebook;
}

interface IUndoSetCellDataSyncArguments {
  pageId: string;
  cellId: string;
  previousData: any;
}

export function undoSetCellDataSync(
  notebook: INotebook,
  { pageId, cellId, previousData }: IUndoSetCellDataSyncArguments
): INotebook {
  return setCellDataSync(notebook, {
    pageId: pageId,
    cellId: cellId,
    data: previousData,
  });
}

interface IMovePageSyncArguments {
  pageId: string;
  index: number;
}

export function movePageSync(
  notebook: INotebook,
  { pageId, index }: IMovePageSyncArguments
) {
  const currentIndex = indexPage(notebook, pageId);
  const page = notebook.pages[currentIndex];
  notebook.pages.splice(currentIndex, 1);
  notebook.pages.splice(index, 0, page);
  return notebook;
}

interface IUndoMovePageSyncArguments {
  pageId: string;
  previousIndex: number;
}

export function undoMovePageSync(
  notebook: INotebook,
  { pageId, previousIndex }: IUndoMovePageSyncArguments
) {
  const currentIndex = indexPage(notebook, pageId);
  const page = notebook.pages[currentIndex];
  notebook.pages.splice(currentIndex, 1);
  notebook.pages.splice(previousIndex, 0, page);
  return notebook;
}

interface IMoveCellSyncArguments {
  pageId: string;
  cellId: string;
  index: number;
}

export function moveCellSync(
  notebook: INotebook,
  { pageId, cellId, index }: IMoveCellSyncArguments
) {
  const currentPageIndex = indexPage(notebook, pageId);
  const currentCellIndex = indexCell(notebook, pageId, cellId);
  const cell = notebook.pages[currentPageIndex].cells[currentCellIndex];
  notebook.pages[currentPageIndex].cells.splice(currentCellIndex, 1);
  notebook.pages[currentPageIndex].cells.splice(index, 0, cell);
  return notebook;
}

interface IUndoMoveCellSyncArguments {
  pageId: string;
  cellId: string;
  previousIndex: number;
}

export function undoMoveCellSync(
  notebook: INotebook,
  { pageId, cellId, previousIndex }: IUndoMoveCellSyncArguments
) {
  const currentPageIndex = indexPage(notebook, pageId);
  const currentCellIndex = indexCell(notebook, pageId, cellId);
  const cell = notebook.pages[currentPageIndex].cells[currentCellIndex];
  notebook.pages[currentPageIndex].cells.splice(currentCellIndex, 1);
  notebook.pages[currentPageIndex].cells.splice(previousIndex, 0, cell);
  return notebook;
}

const syncManipulations = [
  insertPageSync,
  addPageSync,
  removePageSync,
  insertCellSync,
  addCellSync,
  removeCellSync,
  setCellContentSync,
  setCellDataSync,
  movePageSync,
  moveCellSync,
];

const syncManipulationsNames = syncManipulations.map(
  (manipulation) => manipulation.name
);

const undoSyncManipulations = [
  undoInsertPageSync,
  undoAddPageSync,
  undoRemovePageSync,
  undoInsertCellSync,
  undoAddCellSync,
  undoRemoveCellSync,
  undoSetCellContentSync,
  undoSetCellDataSync,
  undoMovePageSync,
  undoMoveCellSync,
];

const asyncManipulations = [
  addEntitiesCell,
  addQuestionCell,
  addSparseQuestionCell,
  addGenerationCell,
  addSummaryCell,
  addSuggestionsCell,
  addImageCell,
  addMeaningCell,
  addSynonymCell,
  addAntonymCell,
];

const asyncManipulationsNames = asyncManipulations.map(
  (manipulation) => manipulation.name
);

const undoAsyncManipulations = [
  undoAddEntitiesCell,
  undoAddQuestionCell,
  undoAddSparseQuestionCell,
  undoAddGenerateCell,
  undoAddSummaryCell,
  undoAddSuggestionsCell,
  undoAddImageCell,
  undoAddMeaningCell,
  undoAddSynonymCell,
  undoAddAntonymCell,
];

export function undo(
  notebook: INotebook,
  command: INotebookManipulationAction
): INotebook {
  if (command.name === undefined) throw new Error("Action is undefined.");

  let undoManipulation = getUndoManipulation(command);
  return undoManipulation(notebook, command) as INotebook;
}

export function redo(
  notebook: INotebook,
  command: INotebookManipulationAction
): INotebook | Promise<INotebook> {
  if (command.name === undefined) throw new Error("Action is undefined.");

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

export type INotebookManipulationSyncArguments =
  | IInsertPageSyncArguments
  | IAddPageSyncArguments
  | IRemovePageSyncArguments
  | IInsertCellSyncArguments
  | IAddCellSyncArguments
  | IRemoveCellSyncArguments
  | ISetCellContentSyncArguments
  | ISetCellDataSyncArguments
  | IMovePageSyncArguments
  | IMoveCellSyncArguments;

export type INotebookUndoManipulationSyncArguments =
  | IUndoInsertPageSyncArguments
  | IUndoAddPageSyncArguments
  | IUndoRemovePageSyncArguments
  | IUndoInsertCellSyncArguments
  | IUndoAddCellSyncArguments
  | IUndoRemoveCellSyncArguments
  | IUndoSetCellContentSyncArguments
  | IUndoSetCellDataSyncArguments
  | IUndoMovePageSyncArguments
  | IUndoMoveCellSyncArguments;

export type INotebookManipulationAsyncArguments =
  | IAddEntitiesCellArguments
  | IAddQuestionCellArguments
  | IAddSparseQuestionCellArguments
  | IAddGenerationCellArguments
  | IAddSummaryCellArguments
  | IAddSuggestionsCellArguments
  | IAddImageCellArguments
  | IAddMeaningCellArguments
  | IAddSynonymCellArguments
  | IAddAntonymCellArguments;

export type INotebookUndoManipulationAsyncArguments = IRemoveCellSyncArguments;

export type INotebookManipulationArguments =
  | INotebookManipulationSyncArguments
  | INotebookUndoManipulationSyncArguments
  | INotebookManipulationAsyncArguments
  | INotebookUndoManipulationAsyncArguments;

export type INotebookManipulationSyncAction =
  INotebookManipulationSyncArguments & { name: string };

export type INotebookManipulationAsyncAction =
  INotebookManipulationAsyncArguments & { name: string };

export type INotebookManipulationAction =
  | INotebookManipulationSyncAction
  | INotebookManipulationAsyncAction;

export type INotebookManipulation<T extends INotebookManipulationArguments> = (
  notebook: INotebook,
  args: T
) => INotebook | Promise<INotebook>;

export function collectComplementaryArguments<
  T extends INotebookManipulationArguments
>(notebook: INotebook, manipulation: INotebookManipulation<T>, args: T) {
  let newArgs = { ...args };

  switch (manipulation.name) {
    case "removePageSync":
      const page = getPage(notebook, (args as IRemovePageSyncArguments).pageId);
      const pageIndex = indexPage(
        notebook,
        (args as IRemovePageSyncArguments).pageId
      );
      newArgs = { ...newArgs, page: page!, index: pageIndex };
      break;
    case "removeCellSync":
      const cell = getCell(
        notebook,
        (args as IRemoveCellSyncArguments).pageId,
        (args as IRemoveCellSyncArguments).cellId
      );
      const cellIndex = indexCell(
        notebook,
        (args as IRemoveCellSyncArguments).pageId,
        (args as IRemoveCellSyncArguments).cellId
      );
      newArgs = { ...newArgs, cell: cell!, index: cellIndex };
      break;
    case "setCellContentSync":
      const previousContent = getCellContent(
        notebook,
        (args as ISetCellContentSyncArguments).pageId,
        (args as ISetCellContentSyncArguments).cellId
      );
      newArgs = { ...newArgs, previousContent: previousContent };
      break;
    case "setCellDataSync":
      const previousData = getCellData(
        notebook,
        (args as ISetCellDataSyncArguments).pageId,
        (args as ISetCellDataSyncArguments).cellId
      );
      newArgs = { ...newArgs, previousData: previousData };
      break;
    case "movePageSync":
      const previousPageIndex = indexPage(
        notebook,
        (args as IMovePageSyncArguments).pageId
      );
      newArgs = { ...newArgs, previousIndex: previousPageIndex };
      break;
    case "moveCellSync":
      const previousCellIndex = indexCell(
        notebook,
        (args as IMoveCellSyncArguments).pageId,
        (args as IMoveCellSyncArguments).cellId
      );
      newArgs = { ...newArgs, previousIndex: previousCellIndex };
      break;
    default:
      break;
  }

  return newArgs;
}

export function getUndoManipulation<T extends INotebookManipulationAction>(
  args: T
): INotebookManipulation<T> {
  if (asyncManipulationsNames.includes(args.name)) {
    // @ts-ignore
    return undoAsyncManipulations[asyncManipulationsNames.indexOf(args.name)];
  } else {
    // @ts-ignore
    return undoSyncManipulations[syncManipulationsNames.indexOf(args.name)];
  }
}

export function getRedoManipulation<T extends INotebookManipulationAction>(
  args: T
): INotebookManipulation<T> {
  if (asyncManipulationsNames.includes(args.name)) {
    // @ts-ignore
    return asyncManipulations[asyncManipulationsNames.indexOf(args.name)];
  } else {
    // @ts-ignore
    return syncManipulations[syncManipulationsNames.indexOf(args.name)];
  }
}

export function isAsync(args: INotebookManipulationAction): boolean {
  return asyncManipulationsNames.includes(args.name);
}

// ! TODO
export function isCell(element: ICell | IPage | INotebook): boolean {
  return "id" in element && "data" in element && "content" in element;
}

// ! TODO
export function isPage(element: ICell | IPage | INotebook): boolean {
  return "id" in element && "data" in element && "cells" in element;
}

// ! TODO
export function isNotebook(element: ICell | IPage | INotebook): boolean {
  return "id" in element && "pages" in element;
}
