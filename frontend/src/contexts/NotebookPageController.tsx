import React from "react";

import { MessageBarType } from "@fluentui/react";

import { INotebookPageController } from "./INotebookPageController";

export const NotebookPageController =
  React.createContext<INotebookPageController>({
    showCommandBox: () => {},
    hideCommandBox: () => {},
    addMessageBar: (text: string, type: MessageBarType) => {},
    removeMessageBar: (id: string) => {},
    getNotebookRef: () => undefined,
    getCommandBoxRef: () => undefined,
    getAppController: () => undefined,
  });
