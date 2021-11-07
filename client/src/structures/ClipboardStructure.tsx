import {
  ICell,
  IPage,
  makeCellUnique,
  makePageUnique,
} from "./NotebookStructure";

export interface IClipboardPageElement {
  type: "page";
  element: IPage;
}

export interface IClipboardCellElement {
  type: "cell";
  element: ICell;
}

export interface IClipboardPagesElement {
  type: "pages";
  element: IPage[];
}

export interface IClipboardCellsElement {
  type: "cells";
  element: ICell[];
}

export type IClipboardElement =
  | IClipboardPageElement
  | IClipboardCellElement
  | IClipboardPagesElement
  | IClipboardCellsElement;

export type IClipboard = IClipboardElement[];

export interface IClipboardManipulationArguments {
  item: IClipboardElement;
}

type IClipboardPush = (
  clipboard: IClipboard,
  { item }: { item: IClipboardElement }
) => IClipboard;

type IClipboardPop = (clipboard: IClipboard) => IClipboard;

type IClipboardSwap = (
  clipboard: IClipboard,
  { item }: { item: IClipboardElement }
) => IClipboard;

type IClipboardClear = (clipboard: IClipboard) => IClipboard;

export type IClipboardManipulation =
  | IClipboardPush
  | IClipboardPop
  | IClipboardSwap
  | IClipboardClear;

export function clipboardPush<T extends IClipboardElement>(
  clipboard: IClipboard,
  { item }: { item: T }
): IClipboard {
  switch (item.type) {
    case "page":
      item.element = makePageUnique(item.element);
      break;
    case "cell":
      item.element = makeCellUnique(item.element);
      break;
    case "pages":
      item.element = item.element.map(makePageUnique);
      break;
    case "cells":
      item.element = item.element.map(makeCellUnique);
      break;
    default:
      throw new Error("Unreachable");
  }

  return [...clipboard, item];
}

export function clipboardSwap(
  clipboard: IClipboard,
  index: number
): IClipboard {
  const item = clipboard[index];
  clipboard.splice(index, 1);
  return clipboardPush(clipboard, { item });
}

export function clipboardClear(clipboard: IClipboard): IClipboard {
  return [];
}

export function clipboardPop(clipboard: IClipboard): IClipboard {
  return clipboard.slice(0, -1);
}

export function clipboardTop(clipboard: IClipboard): IClipboardElement {
  return clipboard[clipboard.length - 1];
}
