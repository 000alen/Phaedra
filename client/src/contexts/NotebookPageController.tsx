import React from "react";

import { IAppController } from "./AppController";
import { INotebookController } from "./NotebookController";

export interface INotebookPageController {
  getAppController: () => IAppController | undefined;
  getNotebookController: () => INotebookController | undefined;
  showColaborationPanel: () => void;
  hideColaborationPanel: () => void;
  isColaborationPanelShown: () => boolean | undefined;
}

export const NotebookPageController =
  React.createContext<INotebookPageController>({
    getAppController: () => undefined,
    getNotebookController: () => undefined,
    showColaborationPanel: () => {},
    hideColaborationPanel: () => {},
    isColaborationPanelShown: () => undefined,
  });
