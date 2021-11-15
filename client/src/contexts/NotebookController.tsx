import React from "react";

import { INotebook } from "../structures/NotebookStructure";
import { INotebookPageController } from "./NotebookPageController";

export interface INotebookController {
  save: () => Promise<void>;
  isSaved: () => boolean | undefined;
  getNotebookPageController: () => INotebookPageController | undefined;
  getNotebook: () => INotebook | undefined;
}

export const NotebookController = React.createContext<INotebookController>({
  save: () => Promise.resolve(),
  isSaved: () => undefined,
  getNotebookPageController: () => undefined,
  getNotebook: () => undefined,
});
