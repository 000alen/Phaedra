const {
  app,
  BrowserWindow,
  ipcMain,
  globalShortcut,
  shell,
  session,
  dialog,
} = require("electron");
const path = require("path");
const os = require("os");
const Store = require("electron-store");
const fs = require("fs");

// ! XXX
const reactDevToolsPath = path.join(
  os.homedir(),
  "AppData/Local/Google/Chrome/User Data/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/4.21.0_0"
);
const icon = path.join(__dirname, "./icon.png");

const defaultSettings = JSON.parse(
  fs.readFileSync(path.join(__dirname, "./defaultSettings.json"))
);
const settingsStore = new Store({
  configName: "settings",
  defaults: { settings: defaultSettings },
});

let splashWindow;
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 680,
    minWidth: 1200,
    minHeight: 680,
    frame: false,
    title: "Phaedra",
    icon: icon,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      devTools: true,
    },
    show: false,
    fullscreenable: true,
  });

  splashWindow = new BrowserWindow({
    width: 600,
    height: 400,
    frame: false,
    title: "Phaedra",
    alwaysOnTop: true,
    icon: icon,
  });

  if (app.isPackaged) {
    splashWindow.loadFile(path.join(__dirname, "../build/splash.html"));
    mainWindow.loadFile(path.join(__dirname, "../build/index.html"));
  } else {
    splashWindow.loadFile(path.join(__dirname, "./splash.html"));
    mainWindow.loadURL("http://localhost:3000");
  }

  mainWindow.once("ready-to-show", () => {
    splashWindow.destroy();
    mainWindow.show();
  });

  ipcMain.on("minimizeApp", () => {
    mainWindow.minimize();
  });

  ipcMain.on("maximizeRestoreApp", () => {
    mainWindow.isMaximized() ? mainWindow.restore() : mainWindow.maximize();
  });

  mainWindow.on("maximize", () => {
    mainWindow.webContents.send("isMaximized");
  });

  mainWindow.on("unmaximize", () => {
    mainWindow.webContents.send("isRestored");
  });

  ipcMain.on("closeApp", () => {
    mainWindow.close();
  });

  mainWindow.webContents.on("new-window", function (e, url) {
    e.preventDefault();
    shell.openExternal(url);
  });
}

app.whenReady().then(createWindow);

app.whenReady().then(async () => {
  await session.defaultSession.loadExtension(reactDevToolsPath);
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on("browser-window-focus", function () {
  globalShortcut.register("CommandOrControl+W", () => {});
});

app.on("browser-window-blur", function () {
  globalShortcut.unregister("CommandOrControl+W");
});

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

ipcMain.handle("getSettings", async (event) => {
  return settingsStore.get("settings");
});

ipcMain.handle("setSettings", async (event, settings) => {
  settingsStore.set("settings", settings);
});

ipcMain.handle("setFullscreen", async (event, fullscreen) => {
  mainWindow.setFullScreen(fullscreen);
});
