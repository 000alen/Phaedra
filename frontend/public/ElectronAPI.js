const { ipcMain, dialog } = require("electron");
const { recentStore, pinnedStore } = require("./store");
const fs = require("fs");

function register() {
  ipcMain.handle("readFileSync", (event, path, options) => {
    // readFileSync(path: PathLike | number, options: { encoding: BufferEncoding; flag?: string | undefined; } | BufferEncoding): string;
    return fs.readFileSync(path, options);
  });

  ipcMain.handle("writeFileSync", (event, path, data, options) => {
    // writeFileSync(path: PathLike | number, data: string | NodeJS.ArrayBufferView, options?: WriteFileOptions): void;
    fs.writeFileSync(path, data, options);
  });

  ipcMain.handle("showOpenDialog", async (event, options) => {
    // showOpenDialog(options: OpenDialogOptions): Promise<Electron.OpenDialogReturnValue>;
    return await dialog.showOpenDialog(options);
  });

  ipcMain.handle("showSaveDialog", async (event, options) => {
    // showSaveDialog(options: SaveDialogOptions): Promise<Electron.SaveDialogReturnValue>;
    return await dialog.showSaveDialog(options);
  });

  ipcMain.handle("base64", async (event, data) => {
    // from(data: Uint8Array | ReadonlyArray<number>): Buffer;
    return Buffer.from(data).toString("base64");
  });

  ipcMain.handle("getRecent", (event) => {
    return recentStore.get("files");
  });

  ipcMain.handle("addRecent", (event, path, name, lastOpened) => {
    const file = { path: path, name: name, lastOpened: lastOpened };
    const files = [file, ...recentStore.get("files")];
    recentStore.set("files", files);
  });

  ipcMain.handle("clearRecent", (event) => {
    recentStore.set("files", []);
  });

  ipcMain.handle("getPinned", (event) => {
    return pinnedStore.get("files");
  });

  ipcMain.handle("addPinned", (event, path, name, lastOpened) => {
    const file = { path: path, name: name, lastOpened: lastOpened };
    const files = [file, ...pinnedStore.get("files")];
    pinnedStore.set("files", files);
  });

  ipcMain.handle("clearPinned", (event) => {
    pinnedStore.set("files", []);
  });
}

module.exports = { register };
