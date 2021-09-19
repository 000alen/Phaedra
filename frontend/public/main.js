const { app, BrowserWindow, ipcMain } = require('electron');
require('@electron/remote/main').initialize();
const path = require('path')

const ipc = ipcMain

let mainWindow
function createWindow() {
    const win = new BrowserWindow({
        width: 1250,
        height: 600,
        minWidth: 940,
        minHeight: 560,
        transparent: true,
        frame: false,
        icon: './icons/baseIcon.svg',
        webPreferences: {
            enableRemoteModule: true,
            nodeIntegration: true,
            contextIsolation: false,
            devTools: true
        },
    });

    win.loadURL('http://localhost:3000');
    win.setBackgroundColor('#161616');

    win.webContents.on('new-window', function(e, url) {
        e.preventDefault();
        require('electron').shell.openExternal(url);
    })

    ipc.on('minimizeApp', () => {
        console.log('Clicked on Minimize Btn!')
        win.minimize()
    })

    ipc.on('maximizeRestoreApp', () => {
        if (win.isMaximized()) {
            console.log('Clicked on Restore Btn!')
            win.restore()
        } else {
            console.log('Clicked on Maximize Btn!')
            win.maximize()
        }
    })

    win.on('maximize', () => {
        win.webContents.send('isMaximized')
    })
    win.on('unmaximize', () => {
        win.webContents.send('isRestored')
    })

    ipc.on('closeApp', () => {
        console.log('Clicked on Close Btn!')
        win.close()
    })
}

app.on('ready', createWindow);

app.on('windows-all-closed', function(){
    if (process.platform !== 'darwin') {
        app.quit();
    }
})

app.on('activate', function(){
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
})