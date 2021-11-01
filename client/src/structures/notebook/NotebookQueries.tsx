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
