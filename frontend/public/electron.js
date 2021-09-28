const path = require('path');
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const fs = require('fs');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 680,
        minWidth: 1200,
        minHeight: 680,
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            devTools: true,
        }
    });

    if (app.isPacked) {
        mainWindow.loadFile(path.join(__dirname, '../build/index.html'));
    } else {
        mainWindow.loadURL('http://localhost:3000');
    }

    ipcMain.on('minimizeApp', () => {
        mainWindow.minimize();
    });

    ipcMain.on('maximizeRestoreApp', () => {
        mainWindow.isMaximized() ? mainWindow.restore() : mainWindow.maximize();
    });

    mainWindow.on('maximize', () => {
        mainWindow.webContents.send('isMaximized');
    });

    mainWindow.on('unmaximize', () => {
        mainWindow.webContents.send('isRestored');
    });

    ipcMain.on('closeApp', () => {
        mainWindow.close();
    });

    mainWindow.webContents.on('new-window', function(e, url) {
        e.preventDefault();
        require('electron').shell.openExternal(url);
    });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

ipcMain.handle('readFile', (event, ...args) => {
    const result = fs.readFileSync(...args);
    return result;
});

ipcMain.handle('writeFile', (event, ...args) => {
    const result = fs.writeFileSync(...args);
    return result;
});

ipcMain.handle('openDialog', async (event, ...args) => {
    const result = await dialog.showOpenDialog(...args);
    return result;
});

ipcMain.handle('saveDialog', async (event, ...args) => {
    const result = await dialog.showSaveDialog(...args);
    return result;
});

ipcMain.handle('base64encode', async (event, ...args) => {
    const result = Buffer.from(...args).toString('base64');
    return result;
});
