import React from "react";

import { INotebookPageController } from "./INotebookPageController";

export const NotebookPageController =
  React.createContext<INotebookPageController>({
    messagesDo: (manipulation, args) => {},
    showCommandBox: () => {},
    hideCommandBox: () => {},
    getCommandBoxRef: () => undefined,
    getAppController: () => undefined,
    getNotebookController: () => undefined,
  });
