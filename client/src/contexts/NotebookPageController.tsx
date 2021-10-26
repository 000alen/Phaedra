import React from "react";

import { PivotItem } from "@fluentui/react";

import {
  IMessagesCommand,
  IMessagesManipulation,
} from "../manipulation/IMessagesManipulation";
import { INotebookPageController } from "./INotebookPageController";

export const NotebookPageController =
  React.createContext<INotebookPageController>({
    messagesDo: (
      manipulation: IMessagesManipulation,
      args: IMessagesCommand
    ) => {},
    showCommandBox: () => {},
    hideCommandBox: () => {},
    getCommandBoxRef: () => undefined,
    getAppController: () => undefined,
    getNotebookController: () => undefined,
    getRibbonKey: () => undefined,
    setRibbonKey: (item: PivotItem | undefined) => undefined,
  });
