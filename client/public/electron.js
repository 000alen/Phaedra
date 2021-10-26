const { app, BrowserWindow, ipcMain, globalShortcut } = require("electron");
const path = require("path");
const icon = path.join(__dirname, "./icon.png");
const { register } = require("./ElectronAPI");

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
  });

  splashWindow = new BrowserWindow({
    width: 600,
    height: 400,
    frame: false,
    title: "Phaedra",
    alwaysOnTop: true,
    // transparent: true,
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
    require("electron").shell.openExternal(url);
  });
}

app.whenReady().then(createWindow);

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

register();
