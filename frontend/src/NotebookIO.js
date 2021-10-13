import { notebookFromPdf, notebookFromText } from "./API";
import {
  openDialog,
  saveDialog,
  writeFile,
  readFile,
  base64encode,
} from "./ElectronAPI";

/**
 *
 * @returns
 */
export function openPdf() {
  const openDialogOptions = {
    properties: ["openFile"],
    filters: [{ name: "Notebooks", extensions: ["pdf"] }],
  };

  return new Promise((resolve, reject) => {
    openDialog(openDialogOptions).then((results) => {
      if (!results.canceled) {
        const path = results.filePaths[0];

        readFile(path).then((content) => {
          base64encode(content).then((base64) => {
            notebookFromPdf(path, base64).then((notebook) => {
              resolve({ notebook: notebook, notebookPath: null });
            });
          });
        });
      }
    });
  });
}

/**
 *
 * @returns
 */
export function openJson() {
  const openDialogOptions = {
    properties: ["openFile"],
    filters: [{ name: "Notebooks", extensions: ["json"] }],
  };

  return new Promise((resolve, reject) => {
    openDialog(openDialogOptions).then((results) => {
      if (!results.canceled) {
        const path = results.filePaths[0];

        readFile(path, "utf-8").then((notebook) => {
          resolve({ notebook: JSON.parse(notebook), notebookPath: path });
        });
      }
    });
  });
}

/**
 *
 * @returns
 */
export function openText() {
  const openDialogOptions = {
    properties: ["openFile"],
    filters: [{ name: "Notebooks", extensions: ["txt"] }],
  };

  return new Promise((resolve, reject) => {
    openDialog(openDialogOptions).then((results) => {
      if (!results.canceled) {
        const path = results.filePaths[0];
        readFile(path, "utf-8").then((text) => {
          notebookFromText(text).then((notebook) => {
            resolve({ notebook: notebook, notebookPath: null });
          });
        });
      }
    });
  });
}

/**
 *
 * @returns
 */
export function openFile() {
  const openDialogOptions = {
    properties: ["openFile"],
    filters: [{ name: "Notebooks", extensions: ["pdf", "json", "txt"] }],
  };

  const handleOpenPdf = (path) => {
    return new Promise((resolve, reject) => {
      readFile(path).then((content) => {
        base64encode(content).then((base64) => {
          notebookFromPdf(path, base64).then((notebook) => {
            resolve({ notebook: notebook, notebookPath: null });
          });
        });
      });
    });
  };

  const handleOpenJson = (path) => {
    return new Promise((resolve, reject) => {
      readFile(path, "utf-8").then((content) => {
        resolve({ notebook: JSON.parse(content), notebookPath: path });
      });
    });
  };

  const handleOpenText = (path) => {
    return new Promise((resolve, reject) => {
      readFile(path, "utf-8").then((text) => {
        notebookFromText(text).then((notebook) => {
          resolve({ notebook: notebook, notebookPath: null });
        });
      });
    });
  };

  return new Promise((resolve, reject) => {
    openDialog(openDialogOptions).then((results) => {
      if (!results.canceled) {
        const path = results.filePaths[0];
        const extension = path.split(".").pop().toLowerCase();

        let handler;
        if (extension === "pdf") {
          handler = handleOpenPdf(path);
        } else if (extension === "json") {
          handler = handleOpenJson(path);
        } else {
          handler = handleOpenText(path);
        }

        handler.then((results) => {
          resolve(results);
        });
      }
    });
  });
}

/**
 *
 * @param {*} notebook
 * @param {*} notebookPath
 * @returns
 */
export function saveNotebook(notebook, notebookPath) {
  const saveDialogOptions = {
    filters: [{ name: "Notebooks", extensions: ["json"] }],
  };

  return new Promise((resolve, reject) => {
    if (notebookPath === undefined) {
      saveDialog(saveDialogOptions).then((results) => {
        if (!results.canceled) {
          const path = results.filePath;
          writeFile(path, JSON.stringify(notebook));
          resolve(path);
        }
      });
    } else {
      writeFile(notebookPath, JSON.stringify(notebook));
      resolve(notebookPath);
    }
  });
}
