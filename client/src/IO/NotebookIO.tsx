import {
  addRecent,
  base64,
  OpenDialogOptions,
  readFileSync,
  showOpenDialog,
  showSaveDialog,
  writeFileSync,
} from "../API/ElectronAPI";
import { notebookFromPdf, notebookFromText } from "../API/PhaedraAPI";
import { INotebook } from "../HOC/UseNotebook/deprecated";
import { getStrings } from "../strings";

export interface INotebookIO {
  notebook: INotebook;
  notebookPath: string | undefined;
}

const openPdfDialogOptions: OpenDialogOptions = {
  properties: ["openFile"],
  filters: [{ name: getStrings().notebooksFilterName, extensions: ["pdf"] }],
};

const openJsonDialogOptions: OpenDialogOptions = {
  properties: ["openFile"],
  filters: [{ name: getStrings().notebooksFilterName, extensions: ["json"] }],
};

const openTextDialogOptions: OpenDialogOptions = {
  properties: ["openFile"],
  filters: [{ name: getStrings().notebooksFilterName, extensions: ["txt"] }],
};

const openFileDialogOptions: OpenDialogOptions = {
  properties: ["openFile"],
  filters: [
    {
      name: getStrings().notebooksFilterName,
      extensions: ["pdf", "json", "txt"],
    },
  ],
};

export function loadPdf(path: string): Promise<INotebookIO> {
  return new Promise((resolve, reject) => {
    readFileSync(path).then((content) => {
      base64(content as Uint8Array).then((base64) => {
        notebookFromPdf(path, base64).then((notebook) => {
          resolve({ notebook: notebook, notebookPath: undefined });
        });
      });
    });
  });
}

export function loadJson(path: string): Promise<INotebookIO> {
  return new Promise((resolve, reject) => {
    readFileSync(path, "utf-8").then((content) => {
      let notebook = JSON.parse(content as string);

      addRecent(path, notebook.name);

      resolve({ notebook: notebook, notebookPath: path });
    });
  });
}

export function loadText(path: string): Promise<INotebookIO> {
  return new Promise((resolve, reject) => {
    readFileSync(path, "utf-8").then((text) => {
      notebookFromText(text as string).then((notebook) => {
        resolve({ notebook: notebook, notebookPath: undefined });
      });
    });
  });
}

export function openPdf(): Promise<INotebookIO> {
  return new Promise((resolve, reject) => {
    showOpenDialog(openPdfDialogOptions).then((results) => {
      if (!results.canceled) {
        const path = results.filePaths[0];
        loadPdf(path).then(({ notebook, notebookPath }) => {
          resolve({ notebook, notebookPath });
        });
      }
    });
  });
}

export function openJson(): Promise<INotebookIO> {
  return new Promise((resolve, reject) => {
    showOpenDialog(openJsonDialogOptions).then((results) => {
      if (!results.canceled) {
        const path = results.filePaths[0];
        loadJson(path).then(({ notebook, notebookPath }) => {
          resolve({ notebook, notebookPath });
        });
      }
    });
  });
}

export function openText(): Promise<INotebookIO> {
  return new Promise((resolve, reject) => {
    showOpenDialog(openTextDialogOptions).then((results) => {
      if (!results.canceled) {
        const path = results.filePaths[0];
        loadText(path).then(({ notebook, notebookPath }) => {
          resolve({ notebook, notebookPath });
        });
      }
    });
  });
}

export function openFile(): Promise<INotebookIO> {
  return new Promise((resolve, reject) => {
    showOpenDialog(openFileDialogOptions).then((results) => {
      if (!results.canceled) {
        const path = results.filePaths[0];
        const extension = path.split(".").pop()!.toLowerCase();

        switch (extension) {
          case "pdf":
            loadPdf(path).then(({ notebook, notebookPath }) => {
              resolve({ notebook, notebookPath });
            });
            break;
          case "json":
            loadJson(path).then(({ notebook, notebookPath }) => {
              resolve({ notebook, notebookPath });
            });
            break;
          case "txt":
            loadText(path).then(({ notebook, notebookPath }) => {
              resolve({ notebook, notebookPath });
            });
            break;
          default:
            throw new Error("Unreachable");
        }
      }
    });
  });
}

export function saveNotebook(
  notebook: INotebook,
  notebookPath: string | undefined
): Promise<string> {
  const saveDialogOptions = {
    filters: [{ name: getStrings().notebooksFilterName, extensions: ["json"] }],
  };

  return new Promise((resolve, reject) => {
    if (notebookPath === undefined) {
      showSaveDialog(saveDialogOptions).then((results) => {
        if (!results.canceled) {
          const path = results.filePath;
          writeFileSync(path!, JSON.stringify(notebook));
          resolve(path!);
        }
      });
    } else {
      writeFileSync(notebookPath, JSON.stringify(notebook));
      resolve(notebookPath);
    }
  });
}
