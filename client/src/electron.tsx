import { PathLike, WriteFileOptions } from "fs";

import { ipcRenderer } from "./index";

export interface FileFilter {
  extensions: string[];
  name: string;
}

export interface OpenDialogOptions {
  title?: string;
  defaultPath?: string;
  buttonLabel?: string;
  filters?: FileFilter[];
  properties?: Array<
    | "openFile"
    | "openDirectory"
    | "multiSelections"
    | "showHiddenFiles"
    | "createDirectory"
    | "promptToCreate"
    | "noResolveAliases"
    | "treatPackageAsDirectory"
    | "dontAddToRecent"
  >;
  message?: string;
  securityScopedBookmarks?: boolean;
}

export interface OpenDialogReturnValue {
  canceled: boolean;
  filePaths: string[];
  bookmarks?: string[];
}

export interface SaveDialogOptions {
  title?: string;
  defaultPath?: string;
  buttonLabel?: string;
  filters?: FileFilter[];
  message?: string;
  nameFieldLabel?: string;
  showsTagField?: boolean;
  properties?: Array<
    | "showHiddenFiles"
    | "createDirectory"
    | "treatPackageAsDirectory"
    | "showOverwriteConfirmation"
    | "dontAddToRecent"
  >;
  securityScopedBookmarks?: boolean;
}

export interface StoreFile {
  path: string;
  name: string;
  lastOpened: string;
}

export interface SaveDialogReturnValue {
  canceled: boolean;
  filePath?: string;
  bookmark?: string;
}

export function readFileSync(
  path: PathLike | number,
  options?:
    | { encoding: BufferEncoding; flag?: string | undefined }
    | BufferEncoding
    | undefined
): Promise<string | Buffer> {
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

export function getSettings(): Promise<object> {
  return ipcRenderer.invoke("getSettings");
}

export function setSettings(settings: object) {
  ipcRenderer.invoke("setSettings", settings);
}

export function setFullscreen(fullscreen: boolean) {
  ipcRenderer.invoke("setFullscreen", fullscreen);
}
