import { ICell, IPage } from "./INotebookManipulation";

export type IClipboardElement = IPage | ICell;
export type IClipboard = Array<IClipboardElement>;

export interface IClipboardCommand {
  element: IClipboardElement;
}

export type IClipboardManipulation = (
  clipboard: IClipboard,
  clipboardCommand?: IClipboardCommand
) => IClipboard;
