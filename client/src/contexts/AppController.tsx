import React from "react";

import {
  IClipboard,
  IClipboardManipulation,
  IClipboardManipulationArguments,
} from "../structures/ClipboardStructure";
import {
  ITab,
  ITabsManipulation,
  ITabsManipulationArguments,
} from "../structures/TabsStructure";
import {
  ITask,
  ITasksManipulation,
  ITasksManipulationArguments,
} from "../structures/TasksStructure";
import {
  IWidget,
  IWidgetsManipulation,
  IWidgetsManipulationArguments,
} from "../structures/WidgetsStructure";

export interface IAppController {
  tabsDo: (action: ITabsManipulation, args: ITabsManipulationArguments) => void;
  clipboardDo: (
    action: IClipboardManipulation,
    args: IClipboardManipulationArguments
  ) => void;
  tasksDo: (
    action: ITasksManipulation,
    args: ITasksManipulationArguments
  ) => void;
  widgetsDo: (
    action: IWidgetsManipulation,
    args: IWidgetsManipulationArguments
  ) => void;
  getTabs: () => ITab[] | undefined;
  getActiveTabId: () => string | undefined;
  getClipboard: () => IClipboard | undefined;
  getTasks: () => ITask[] | undefined;
  getWidgets: () => IWidget[] | undefined;
}

export const AppController = React.createContext<IAppController>({
  tabsDo: (action: ITabsManipulation, args: ITabsManipulationArguments) => {},
  clipboardDo: (
    action: IClipboardManipulation,
    args: IClipboardManipulationArguments
  ) => {},
  tasksDo: (
    action: ITasksManipulation,
    args: ITasksManipulationArguments
  ) => {},
  widgetsDo: (
    action: IWidgetsManipulation,
    args: IWidgetsManipulationArguments
  ) => {},
  getTabs: () => undefined,
  getActiveTabId: () => undefined,
  getClipboard: () => undefined,
  getTasks: () => undefined,
  getWidgets: () => undefined,
});
