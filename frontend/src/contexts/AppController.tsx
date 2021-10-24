import React from "react";

import {
  IClipboardCommand,
  IClipboardManipulation,
} from "../manipulation/IClipboardManipulation";
import {
  ITabsCommand,
  ITabsManipulation,
} from "../manipulation/ITabsManipulation";
import {
  ITasksCommand,
  ITasksManipulation,
} from "../manipulation/ITasksManipulation";
import {
  IWidgetsCommand,
  IWidgetsManipulation,
} from "../manipulation/IWidgetsManipulation";
import { IAppController } from "./IAppController";

export const AppController = React.createContext<IAppController>({
  tabsDo: (action: ITabsManipulation, args: ITabsCommand) => {},
  clipboardDo: (action: IClipboardManipulation, args: IClipboardCommand) => {},
  tasksDo: (action: ITasksManipulation, args: ITasksCommand) => {},
  widgetsDo: (action: IWidgetsManipulation, args: IWidgetsCommand) => {},
  getTabs: () => undefined,
  getClipboard: () => undefined,
  getTasks: () => undefined,
  getWidgets: () => undefined,
});
