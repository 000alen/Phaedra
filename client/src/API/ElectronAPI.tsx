import { PathLike, WriteFileOptions } from "fs";

import { ipcRenderer } from "../index";
import {
  OpenDialogOptions,
  OpenDialogReturnValue,
  SaveDialogOptions,
  SaveDialogReturnValue,
  StoreFile,
} from "./IElectronAPI";

export function readFileSync(
  path: PathLike | number,
  options?:
    | { encoding: BufferEncoding; flag?: string | undefined }
    | BufferEncoding
    | undefined
): Promise<string | Uint8Array> {
  return ipcRenderer.invoke("readFileSync", path, options);
}

export function writeFileSync(
  path: PathLike | number,
  data: string | NodeJS.ArrayBufferView,
  options?: WriteFileOptions
) {
  ipcRenderer.invoke("writeFileSync", path, data, options);
}

export function showOpenDialog(
  options: OpenDialogOptions
): Promise<OpenDialogReturnValue> {
  return ipcRenderer.invoke("showOpenDialog", options);
}

export function showSaveDialog(
  options: SaveDialogOptions
): Promise<SaveDialogReturnValue> {
  return ipcRenderer.invoke("showSaveDialog", options);
}

export function base64(
  data: Uint8Array | ReadonlyArray<number>
): Promise<string> {
  return ipcRenderer.invoke("base64", data);
}

export function getRecent(): Promise<StoreFile[]> {
  return ipcRenderer.invoke("getRecent");
}

export function addRecent(path: string, name: string) {
  ipcRenderer.invoke("addRecent", path, name, Date());
}

export function clearRecent() {
  ipcRenderer.invoke("clearRecent");
}

export function getPinned(): Promise<StoreFile[]> {
  return ipcRenderer.invoke("getPinned");
}

export function addPinned(path: string, name: string) {
  ipcRenderer.invoke("addPinned", path, name, Date());
}

export function clearPinned() {
  ipcRenderer.invoke("clearPinned");
}
