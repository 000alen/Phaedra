const { app, BrowserWindow, ipcMain, globalShortcut } = require("electron");
const path = require("path");
const icon = path.join(__dirname, "./icon.png");
const { register } = require("./ElectronAPI");

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
  });

  if (app.isPackaged) {
    mainWindow.loadFile(path.join(__dirname, "../build/index.html"));
  } else {
    mainWindow.loadURL("http://localhost:3000");
  }

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
  globalShortcut.register("CommandOrControl+R", () => {
    console.log("CommandOrControl+R is pressed: Shortcut Disabled");
  });

  globalShortcut.register("F5", () => {
    console.log("F5 is pressed: Shortcut Disabled");
  });

  globalShortcut.register("CommandOrControl+W", () => {
    console.log("CommandOrControl+W is pressed: Shortcut Disabled");
  });
});

app.on("browser-window-blur", function () {
  globalShortcut.unregister("CommandOrControl+R");
  globalShortcut.unregister("F5");
  globalShortcut.unregister("CommandOrControl+W");
});

register();
