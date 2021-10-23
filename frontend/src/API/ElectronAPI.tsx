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
  return new Promise((resolve, reject) => {
    ipcRenderer.invoke("readFileSync", path, options).then((result: any) => {
      resolve(result);
    });
  });
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
  return new Promise((resolve, reject) => {
    ipcRenderer.invoke("showOpenDialog", options).then((result: any) => {
      resolve(result);
    });
  });
}

export function showSaveDialog(
  options: SaveDialogOptions
): Promise<SaveDialogReturnValue> {
  return new Promise((resolve, reject) => {
    ipcRenderer.invoke("showSaveDialog", options).then((result: any) => {
      resolve(result);
    });
  });
}

export function base64(
  data: Uint8Array | ReadonlyArray<number>
): Promise<string> {
  return new Promise((resolve, reject) => {
    ipcRenderer.invoke("base64", data).then((result: any) => {
      resolve(result);
    });
  });
}

export function getRecent(): Promise<StoreFile[]> {
  return new Promise((resolve, reject) => {
    ipcRenderer.invoke("getRecent").then((result: any) => {
      resolve(result);
    });
  });
}

export function addRecent(path: string, name: string) {
  ipcRenderer.invoke("addRecent", path, name, Date());
}

export function clearRecent() {
  ipcRenderer.invoke("clearRecent");
}

export function getPinned(): Promise<StoreFile[]> {
  return new Promise((resolve, reject) => {
    ipcRenderer.invoke("getPinned").then((result: any) => {
      resolve(result);
    });
  });
}

export function addPinned(path: string, name: string) {
  ipcRenderer.invoke("addPinned", path, name, Date());
}

export function clearPinned() {
  ipcRenderer.invoke("clearPinned");
}
