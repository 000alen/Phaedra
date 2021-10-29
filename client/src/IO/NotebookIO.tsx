// TODO: refactor

import {
  addRecent,
  base64,
  readFileSync,
  showOpenDialog,
  showSaveDialog,
  writeFileSync,
} from "../API/ElectronAPI";
import { OpenDialogOptions } from "../API/IElectronAPI";
import { notebookFromPdf, notebookFromText } from "../API/PhaedraAPI";
import { strings } from "../strings";
import { INotebook } from "../structures/notebook/INotebookManipulation";
import { INotebookIO } from "./INotebookIO";

export function openPdf(): Promise<INotebookIO> {
  const openDialogOptions: OpenDialogOptions = {
    properties: ["openFile"],
    filters: [{ name: strings.notebooksFilterName, extensions: ["pdf"] }],
  };

  return new Promise((resolve, reject) => {
    showOpenDialog(openDialogOptions).then((results) => {
      if (!results.canceled) {
        const path = results.filePaths[0];

        readFileSync(path).then((content) => {
          base64(content as Uint8Array).then((base64) => {
            notebookFromPdf(path, base64).then((notebook) => {
              resolve({ notebook: notebook, notebookPath: undefined });
            });
          });
        });
      }
    });
  });
}

export function openJson(): Promise<INotebookIO> {
  const openDialogOptions: OpenDialogOptions = {
    properties: ["openFile"],
    filters: [{ name: strings.notebooksFilterName, extensions: ["json"] }],
  };

  return new Promise((resolve, reject) => {
    showOpenDialog(openDialogOptions).then((results) => {
      if (!results.canceled) {
        const path = results.filePaths[0];

        readFileSync(path, "utf-8").then((_notebook) => {
          let notebook = JSON.parse(_notebook as string);

          addRecent(path, notebook.name);

          resolve({ notebook: notebook, notebookPath: path });
        });
      }
    });
  });
}

export function openText(): Promise<INotebookIO> {
  const openDialogOptions: OpenDialogOptions = {
    properties: ["openFile"],
    filters: [{ name: strings.notebooksFilterName, extensions: ["txt"] }],
  };

  return new Promise((resolve, reject) => {
    showOpenDialog(openDialogOptions).then((results) => {
      if (!results.canceled) {
        const path = results.filePaths[0];
        readFileSync(path, "utf-8").then((text) => {
          notebookFromText(text as string).then((notebook) => {
            resolve({ notebook: notebook, notebookPath: undefined });
          });
        });
      }
    });
  });
}

export function openFile(): Promise<INotebookIO> {
  const openDialogOptions: OpenDialogOptions = {
    properties: ["openFile"],
    filters: [
      { name: strings.notebooksFilterName, extensions: ["pdf", "json", "txt"] },
    ],
  };

  const handleOpenPdf = (path: string) => {
    return new Promise((resolve, reject) => {
      readFileSync(path).then((content) => {
        base64(content as Uint8Array).then((base64) => {
          notebookFromPdf(path, base64).then((notebook) => {
            resolve({ notebook: notebook, notebookPath: undefined });
          });
        });
      });
    });
  };

  const handleOpenJson = (path: string) => {
    return new Promise((resolve, reject) => {
      readFileSync(path, "utf-8").then((_notebook) => {
        let notebook = JSON.parse(_notebook as string);

        addRecent(path, notebook.name);

        resolve({ notebook: notebook, notebookPath: path });
      });
    });
  };

  const handleOpenText = (path: string) => {
    return new Promise((resolve, reject) => {
      readFileSync(path, "utf-8").then((text) => {
        notebookFromText(text as string).then((notebook) => {
          resolve({ notebook: notebook, notebookPath: undefined });
        });
      });
    });
  };

  return new Promise((resolve, reject) => {
    showOpenDialog(openDialogOptions).then((results) => {
      if (!results.canceled) {
        const path = results.filePaths[0];
        const extension = path.split(".").pop()!.toLowerCase();

        let handler;
        if (extension === "pdf") {
          handler = handleOpenPdf(path);
        } else if (extension === "json") {
          handler = handleOpenJson(path);
        } else {
          handler = handleOpenText(path);
        }

        handler.then((results) => {
          resolve(results as INotebookIO);
        });
      }
    });
  });
}

export function saveNotebook(
  notebook: INotebook,
  notebookPath: string | undefined
): Promise<string> {
  const saveDialogOptions = {
    filters: [{ name: strings.notebooksFilterName, extensions: ["json"] }],
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
