const { contextBridge } = require("electron");
contextBridge.exposeInMainWorld("IN_DESKTOP_ENV", true);
