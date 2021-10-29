import {
  ICell,
  INotebook,
  INotebookManipulation,
  INotebookManipulationArguments,
  IPage,
} from "./INotebookManipulation";
import {
  addAntonymCell,
  addCellSync,
  addEntitiesCell,
  addGenerateCell,
  addMeaningCell,
  addPageSync,
  addQuestionCell,
  addSparseQuestionCell,
  addSynonymCell,
  addWikipediaImageCell,
  addWikipediaSuggestionsCell,
  addWikipediaSummaryCell,
  insertCellSync,
  insertPageSync,
  removeCellSync,
  removePageSync,
  setCellContentSync,
  setCellDataSync,
  undoAddAntonymCell,
  undoAddCellSync,
  undoAddEntitiesCell,
  undoAddGenerateCell,
  undoAddMeaningCell,
  undoAddPageSync,
  undoAddQuestionCell,
  undoAddSparseQuestionCell,
  undoAddSynonymCell,
  undoAddWikipediaImageCell,
  undoAddWikipediaSuggestionsCell,
  undoAddWikipediaSummaryCell,
  undoInsertCellSync,
  undoInsertPageSync,
  undoRemoveCellSync,
  undoRemovePageSync,
  undoSetCellContentSync,
  undoSetCellDataSync,
} from "./NotebookManipulation";

export function indexPage(
  notebook: INotebook,
  { pageId }: Partial<INotebookManipulationArguments>
): number {
  if (pageId === undefined) throw new Error("PageId is undefined.");

  return notebook.pages.findIndex((page) => page.id === pageId);
}

export function getPage(
  notebook: INotebook,
  { pageId }: Partial<INotebookManipulationArguments>
): IPage | undefined {
  if (pageId === undefined) throw new Error("PageId is undefined.");

  return notebook.pages.find((page) => page.id === pageId);
}

export function indexCell(
  notebook: INotebook,
  { pageId, cellId }: Partial<INotebookManipulationArguments>
): number {
  if (pageId === undefined) throw new Error("PageId is undefined.");
  if (cellId === undefined) throw new Error("CellId is undefined.");

  return notebook.pages[
    indexPage(notebook, { pageId: pageId })
  ].cells.findIndex((cell) => cell.id === cellId);
}

export function getCell(
  notebook: INotebook,
  { pageId, cellId }: Partial<INotebookManipulationArguments>
): ICell | undefined {
  if (pageId === undefined) throw new Error("PageId is undefined.");
  if (cellId === undefined) throw new Error("CellId is undefined.");

  return notebook.pages[indexPage(notebook, { pageId: pageId })].cells.find(
    (cell) => cell.id === cellId
  );
}

export function getCellContent(
  notebook: INotebook,
  { pageId, cellId }: Partial<INotebookManipulationArguments>
): string {
  if (pageId === undefined) throw new Error("PageId is undefined.");
  if (cellId === undefined) throw new Error("CellId is undefined.");

  return notebook.pages[indexPage(notebook, { pageId: pageId })].cells[
    indexCell(notebook, { pageId: pageId, cellId: cellId })
  ].content;
}

export function getCellData(
  notebook: INotebook,
  { pageId, cellId }: Partial<INotebookManipulationArguments>
): any {
  if (pageId === undefined) throw new Error("PageId is undefined.");
  if (cellId === undefined) throw new Error("CellId is undefined.");

  return notebook.pages[indexPage(notebook, { pageId: pageId })].cells[
    indexCell(notebook, { pageId: pageId, cellId: cellId })
  ].data;
}

export function collectComplementaryArguments(
  notebook: INotebook,
  manipulation: INotebookManipulation,
  args: INotebookManipulationArguments
) {
  let newArgs = { ...args };

  switch (manipulation.name) {
    case "removePage":
      const page = getPage(notebook, { pageId: args.pageId });
      const pageIndex = indexPage(notebook, {
        pageId: args.pageId,
      });
      newArgs = { ...newArgs, page: page, pageIndex: pageIndex };
      break;
    case "removeCell":
      const cell = getCell(notebook, {
        pageId: args.pageId,
        cellId: args.cellId,
      });
      const cellIndex = indexCell(notebook, {
        pageId: args.pageId,
        cellId: args.cellId,
      });
      newArgs = { ...newArgs, cell: cell, cellIndex: cellIndex };
      break;
    case "setCellContent":
      const previousContent = getCellContent(notebook, {
        pageId: args.pageId,
        cellId: args.cellId,
      });
      newArgs = { ...newArgs, previousContent: previousContent };
      break;
    case "setCellData":
      const previousData = getCellData(notebook, {
        pageId: args.pageId,
        cellId: args.cellId,
      });
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
