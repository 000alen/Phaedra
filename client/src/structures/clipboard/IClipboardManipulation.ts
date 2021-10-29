import { ICell, IPage } from "../notebook/INotebookManipulation";

export type IClipboardElement = IPage | ICell;
export type IClipboard = IClipboardElement[];

export interface IClipboardCommand {
  element: IClipboardElement;
}

type IClipboardPush = (
  clipboard: IClipboard,
  { element }: { element: IClipboardElement }
) => IClipboard;

type IClipboardPop = (clipboard: IClipboard) => IClipboard;

export type IClipboardManipulation = IClipboardPush | IClipboardPop;
