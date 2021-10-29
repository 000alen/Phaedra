import React from "react";

import { PivotItem } from "@fluentui/react";

import CommandBoxComponent from "../components/CommandBoxComponent";
import {
  IMessagesCommand,
  IMessagesManipulation,
} from "../structures/messages/IMessagesManipulation";
import { IAppController } from "./IAppController";
import { INotebookController } from "./INotebookController";

export interface INotebookPageController {
  messagesDo: (
    manipulation: IMessagesManipulation,
    args: IMessagesCommand
  ) => void;
  showCommandBox: () => void;
  hideCommandBox: () => void;
  getCommandBoxRef: () => React.RefObject<CommandBoxComponent> | undefined;
  getAppController: () => IAppController | undefined;
  getNotebookController: () => INotebookController | undefined;
  getRibbonKey: () => string | undefined;
  setRibbonKey: (item?: PivotItem | undefined) => void;
}
