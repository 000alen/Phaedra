import { MessageBarType } from "@fluentui/react";
import React from "react";
import CommandBoxComponent from "../components/CommandBoxComponent";
import NotebookComponent from "../components/Notebook/NotebookComponent";
import { IAppController } from "./AppController";

export interface INotebookPageController {
  showCommandBox: () => void;
  hideCommandBox: () => void;
  addMessageBar: (text: string, type: MessageBarType) => void;
  removeMessageBar: (id: string) => void;
  getNotebookRef: () => React.RefObject<NotebookComponent> | undefined;
  getCommandBoxRef: () => React.RefObject<CommandBoxComponent> | undefined;
  getAppController: () => IAppController | undefined;
}

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
