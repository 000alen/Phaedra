import { notebookFromPdf, notebookFromText } from "../API/PhaedraAPI";
import {
  openDialog,
  saveDialog,
  writeFile,
  readFile,
  base64encode,
  addRecent,
} from "../API/ElectronAPI";

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
              resolve({ notebook: notebook, notebookPath: undefined });
            });
          });
        });
      }
    });
  });
}

export function openJson() {
  const openDialogOptions = {
    properties: ["openFile"],
    filters: [{ name: "Notebooks", extensions: ["json"] }],
  };

  return new Promise((resolve, reject) => {
    openDialog(openDialogOptions).then((results) => {
      if (!results.canceled) {
        const path = results.filePaths[0];

        readFile(path, "utf-8").then((_notebook) => {
          let notebook = JSON.parse(_notebook);

          addRecent(path, notebook.name);

          resolve({ notebook: notebook, notebookPath: path });
        });
      }
    });
  });
}

/**
 * Creates a Notebook from a text file.
 * @returns {Promise<NotebookInformation>}
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
            resolve({ notebook: notebook, notebookPath: undefined });
          });
        });
      }
    });
  });
}

/**
 * Opens (and creates if needed) a Notebook.
 * @returns {Promise<NotebookInformation>}
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
            resolve({ notebook: notebook, notebookPath: undefined });
          });
        });
      });
    });
  };

  const handleOpenJson = (path) => {
    return new Promise((resolve, reject) => {
      readFile(path, "utf-8").then((_notebook) => {
        let notebook = JSON.parse(_notebook);

        addRecent(path, notebook.name);

        resolve({ notebook: notebook, notebookPath: path });
      });
    });
  };

  const handleOpenText = (path) => {
    return new Promise((resolve, reject) => {
      readFile(path, "utf-8").then((text) => {
        notebookFromText(text).then((notebook) => {
          resolve({ notebook: notebook, notebookPath: undefined });
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
 * Saves a Notebook to a JSON file.
 * @param {Notebook} notebook
 * @param {string | undefined} notebookPath
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
