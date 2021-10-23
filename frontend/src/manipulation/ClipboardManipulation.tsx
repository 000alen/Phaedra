import { v4 as uuidv4 } from "uuid";

import { IPage, ICell } from "./NotebookManipulation";

export type IClipboardElement = IPage | ICell;
export type IClipboard = Array<IClipboardElement>;

export interface IClipboardCommand {
  element: IClipboardElement;
}

export function clipboardPush(
  clipboard: IClipboard,
  { element }: { element: IClipboardElement }
): IClipboard {
  return [...clipboard, element];
}

export function clipboardTop(clipboard: IClipboard): IClipboardElement {
  return clipboard[clipboard.length - 1];
}

export function clipboardPop(clipboard: IClipboard): IClipboard {
  return clipboard.slice(0, -1);
}

export function makeCellUnique(cell: ICell): ICell {
  return {
    ...cell,
    id: uuidv4(),
  };
}

export function makePageUnique(page: IPage): IPage {
  return {
    ...page,
    id: uuidv4(),
    cells: page.cells.map(makeCellUnique),
  };
}
