import React from "react";

import { PivotItem } from "@fluentui/react";

import CommandBoxComponent from "../components/CommandBoxComponent";
import {
  IMessagesManipulation,
  IMessagesManipulationArguments,
} from "../structures/MessagesStructure";
import { IAppController } from "./AppController";
import { INotebookController } from "./NotebookController";

export interface INotebookPageController {
  messagesDo: (
    manipulation: IMessagesManipulation,
    args: IMessagesManipulationArguments
  ) => void;
  showCommandBox: () => void;
  hideCommandBox: () => void;
  getCommandBoxRef: () => React.RefObject<CommandBoxComponent> | undefined;
  getAppController: () => IAppController | undefined;
  getNotebookController: () => INotebookController | undefined;
  getRibbonKey: () => string | undefined;
  setRibbonKey: (item?: PivotItem | undefined) => void;
}

export const NotebookPageController =
  React.createContext<INotebookPageController>({
    messagesDo: (
      manipulation: IMessagesManipulation,
      args: IMessagesManipulationArguments
    ) => {},
    showCommandBox: () => {},
    hideCommandBox: () => {},
    getCommandBoxRef: () => undefined,
    getAppController: () => undefined,
    getNotebookController: () => undefined,
    getRibbonKey: () => undefined,
    setRibbonKey: (item: PivotItem | undefined) => undefined,
  });
