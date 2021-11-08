import React from "react";

import { PivotItem } from "@fluentui/react";

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
    getAppController: () => undefined,
    getNotebookController: () => undefined,
    getRibbonKey: () => undefined,
    setRibbonKey: (item: PivotItem | undefined) => undefined,
  });
