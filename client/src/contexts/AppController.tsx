import React from "react";

import {
  IClipboardCommand,
  IClipboardManipulation,
} from "../structures/clipboard/IClipboardManipulation";
import {
  ITabsCommand,
  ITabsManipulation,
} from "../structures/tabs/ITabsManipulation";
import {
  ITasksCommand,
  ITasksManipulation,
} from "../structures/tasks/ITasksManipulation";
import {
  IWidgetsCommand,
  IWidgetsManipulation,
} from "../structures/widgets/IWidgetsManipulation";
import { IAppController } from "./IAppController";

export const AppController = React.createContext<IAppController>({
  tabsDo: (action: ITabsManipulation, args: ITabsCommand) => {},
  clipboardDo: (action: IClipboardManipulation, args: IClipboardCommand) => {},
  tasksDo: (action: ITasksManipulation, args: ITasksCommand) => {},
  widgetsDo: (action: IWidgetsManipulation, args: IWidgetsCommand) => {},
  getTabs: () => undefined,
  getActiveTab: () => undefined,
  getClipboard: () => undefined,
  getTasks: () => undefined,
  getWidgets: () => undefined,
});
