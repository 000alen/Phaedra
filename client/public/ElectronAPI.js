const { ipcMain, dialog } = require("electron");
const Store = require("electron-store");
const fs = require("fs");

const recentStore = new Store({
  configName: "recent",
  defaults: {
    files: [],
  },
});

const pinnedStore = new Store({
  configName: "pinned",
  defaults: {
    files: [],
  },
});

function register() {
  ipcMain.handle("readFileSync", (event, path, options) => {
    return fs.readFileSync(path, options);
  });

  ipcMain.handle("writeFileSync", (event, path, data, options) => {
    fs.writeFileSync(path, data, options);
  });

  ipcMain.handle("showOpenDialog", async (event, options) => {
    return await dialog.showOpenDialog(options);
  });

  ipcMain.handle("showSaveDialog", async (event, options) => {
    return await dialog.showSaveDialog(options);
  });

  ipcMain.handle("base64", async (event, data) => {
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
