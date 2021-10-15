import { ipcRenderer } from "../index";

// TODO
/**
 * Reads a file from the file system.
 * @param  {...any} args
 * @returns {Promise<any>}
 */
export function readFile(...args) {
  return new Promise((resolve, reject) => {
    ipcRenderer.invoke("readFile", ...args).then((result) => {
      resolve(result);
    });
  });
}

// TODO
/**
 * Writes a file to the file system.
 * @param  {...any} args
 * @returns {Promise<any>}
 */
export function writeFile(...args) {
  return new Promise((resolve, reject) => {
    ipcRenderer.invoke("writeFile", ...args).then((result) => {
      resolve(result);
    });
  });
}

// TODO
/**
 * Opens a dialog to select a file.
 * @param  {...any} args
 * @returns {Promise<any>}
 */
export function openDialog(...args) {
  return new Promise((resolve, reject) => {
    ipcRenderer.invoke("openDialog", ...args).then((result) => {
      resolve(result);
    });
  });
}

// TODO
/**
 * Opens a dialog to save a file.
 * @param  {...any} args
 * @returns {Promise<any>}
 */
export function saveDialog(...args) {
  return new Promise((resolve, reject) => {
    ipcRenderer.invoke("saveDialog", ...args).then((result) => {
      resolve(result);
    });
  });
}

// TODO
/**
 * Encodes to base64.
 * @param  {...any} args
 * @returns {Promise<any>}
 */
export function base64encode(...args) {
  return new Promise((resolve, reject) => {
    ipcRenderer.invoke("base64encode", ...args).then((result) => {
      resolve(result);
    });
  });
}
