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
} from "../../API/PhaedraAPI";
import {
  INotebook,
  INotebookManipulationArguments,
} from "./INotebookManipulation";
import { createCell } from "./NotebookConstructors";
import {
  getRedoManipulation,
  getUndoManipulation,
  indexCell,
  indexPage,
} from "./NotebookQueries";

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

  notebook.pages[indexPage(notebook, { pageId: pageId })].cells.splice(
    index,
    0,
    cell
  );
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

  notebook.pages[indexPage(notebook, { pageId: pageId })].cells.push(cell);
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

  notebook.pages[indexPage(notebook, { pageId: pageId })].cells =
    notebook.pages[indexPage(notebook, { pageId: pageId })].cells.filter(
      (cell) => cell.id !== cellId
    );
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

  notebook.pages[indexPage(notebook, { pageId: pageId })].cells[
    indexCell(notebook, { pageId: pageId, cellId: cellId })
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

  notebook.pages[indexPage(notebook, { pageId: pageId })].cells[
    indexCell(notebook, { pageId: pageId, cellId: cellId })
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
