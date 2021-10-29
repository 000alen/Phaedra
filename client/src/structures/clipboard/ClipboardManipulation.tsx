import { v4 as uuidv4 } from "uuid";

import { ICell, IPage } from "../notebook/INotebookManipulation";
import { IClipboard, IClipboardElement } from "./IClipboardManipulation";

export function clipboardPush(
  clipboard: IClipboard,
  { element }: { element: IClipboardElement }
): IClipboard {
  return [...clipboard, element];
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
