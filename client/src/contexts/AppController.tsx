import React from "react";

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
  getTasks: () => ITask[] | undefined;
  getWidgets: () => IWidget[] | undefined;
  isTasksPanelShown: () => boolean | undefined;
  showTasksPanel: () => void;
  hideTasksPanel: () => void;
}

export const AppController = React.createContext<IAppController>({
  tabsDo: (action: ITabsManipulation, args: ITabsManipulationArguments) => {},
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
  getTasks: () => undefined,
  getWidgets: () => undefined,
  isTasksPanelShown: () => undefined,
  showTasksPanel: () => {},
  hideTasksPanel: () => {},
});
