import { ipcRenderer } from "../index";

export function readFile(...args: any[]): Promise<any> {
  return new Promise((resolve, reject) => {
    ipcRenderer.invoke("readFile", ...args).then((result: any) => {
      resolve(result);
    });
  });
}

export function writeFile(...args: any[]): Promise<any> {
  return new Promise((resolve, reject) => {
    ipcRenderer.invoke("writeFile", ...args).then((result: any) => {
      resolve(result);
    });
  });
}

export function openDialog(...args: any[]): Promise<any> {
  return new Promise((resolve, reject) => {
    ipcRenderer.invoke("openDialog", ...args).then((result: any) => {
      resolve(result);
    });
  });
}

export function saveDialog(...args: any[]): Promise<any> {
  return new Promise((resolve, reject) => {
    ipcRenderer.invoke("saveDialog", ...args).then((result: any) => {
      resolve(result);
    });
  });
}

export function base64encode(...args: any[]): Promise<any> {
  return new Promise((resolve, reject) => {
    ipcRenderer.invoke("base64encode", ...args).then((result: any) => {
      resolve(result);
    });
  });
}

export function getRecent(): Promise<any> {
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

export function getPinned(): Promise<any> {
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
