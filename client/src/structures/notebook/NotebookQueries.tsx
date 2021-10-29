import {
  ICell,
  INotebook,
  INotebookCommand,
  IPage,
} from "./INotebookManipulation";

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

export function isCell(element: ICell | IPage | INotebook): boolean {
  return "id" in element && "data" in element && "content" in element;
}

export function isPage(element: ICell | IPage | INotebook): boolean {
  return "id" in element && "data" in element && "cells" in element;
}

export function isNotebook(element: ICell | IPage | INotebook): boolean {
  return "id" in element && "pages" in element;
}
