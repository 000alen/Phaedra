import { ipcRenderer } from "./index";

/**
 *
 * @param  {...any} args
 * @returns
 */
export function readFile(...args) {
  return new Promise((resolve, reject) => {
    ipcRenderer.invoke("readFile", ...args).then((result) => {
      resolve(result);
    });
  });
}

/**
 *
 * @param  {...any} args
 * @returns
 */
export function writeFile(...args) {
  return new Promise((resolve, reject) => {
    ipcRenderer.invoke("writeFile", ...args).then((result) => {
      resolve(result);
    });
  });
}

/**
 *
 * @param  {...any} args
 * @returns
 */
export function openDialog(...args) {
  return new Promise((resolve, reject) => {
    ipcRenderer.invoke("openDialog", ...args).then((result) => {
      resolve(result);
    });
  });
}

/**
 *
 * @param  {...any} args
 * @returns
 */
export function saveDialog(...args) {
  return new Promise((resolve, reject) => {
    ipcRenderer.invoke("saveDialog", ...args).then((result) => {
      resolve(result);
    });
  });
}

/**
 *
 * @param  {...any} args
 * @returns
 */
export function base64encode(...args) {
  return new Promise((resolve, reject) => {
    ipcRenderer.invoke("base64encode", ...args).then((result) => {
      resolve(result);
    });
  });
}
