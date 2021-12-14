import {
  OpenDialogOptions,
  readFileSync,
  showOpenDialog,
  showSaveDialog,
  writeFileSync,
} from "../electron";
import { INotebook } from "./types";
import { getStrings } from "../i18n/i18n";
import { notebookFromPDF } from "../core/Language";

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

const openFileDialogOptions: OpenDialogOptions = {
  properties: ["openFile"],
  filters: [
    {
      name: getStrings().notebooksFilterName,
      extensions: ["pdf", "json"],
    },
  ],
};

export function loadPdf(path: string): Promise<INotebookIO> {
  return new Promise((resolve, reject) => {
    readFileSync(path).then((content) => {
      notebookFromPDF(content as Buffer, path).then((notebook) => {
        resolve({ notebook: notebook, notebookPath: undefined });
      });
    });
  });
}

export function loadJson(path: string): Promise<INotebookIO> {
  return new Promise((resolve, reject) => {
    readFileSync(path, "utf-8").then((content) => {
      let notebook = JSON.parse(content as string);
      resolve({ notebook: notebook, notebookPath: path });
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
