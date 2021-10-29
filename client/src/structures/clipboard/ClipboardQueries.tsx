import { IClipboard, IClipboardElement } from "./IClipboardManipulation";

export function clipboardTop(clipboard: IClipboard): IClipboardElement {
  return clipboard[clipboard.length - 1];
}
