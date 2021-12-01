import React from "react";

import { DialogsManager, IDialog } from "./HOC/UseDialogs";
import { IMessage, MessagesManager } from "./HOC/UseMessages";
import { INotebook } from "./HOC/UseNotebook/deprecated";
import { IPanel, PanelsManager } from "./HOC/UsePanels";
import { ITab, TabsManager } from "./HOC/UseTabs";
import { ITask, TasksManager } from "./HOC/UseTasks";
import { IWidget, WidgetsManager } from "./HOC/UseWidgets";

export interface IAppController {
  isTasksPanelShown: () => boolean | undefined;
  showTasksPanel: (callback?: () => void) => void;
  hideTasksPanel: (callback?: () => void) => void;

  dialogs: IDialog[];
  dialogsManager: DialogsManager | undefined;

  messages: IMessage[];
  messagesManager: MessagesManager | undefined;

  panels: IPanel[];
  panelsManager: PanelsManager | undefined;

  tabs: ITab[];
  activeTabId: string | undefined;
  tabsManager: TabsManager | undefined;

  tasks: ITask[];
  tasksManager: TasksManager | undefined;

  widgets: IWidget[];
  widgetsManager: WidgetsManager | undefined;
}

export const AppController = React.createContext<IAppController>({
  isTasksPanelShown: () => undefined,
  showTasksPanel: (callback?: () => void) => {},
  hideTasksPanel: (callback?: () => void) => {},

  dialogs: [],
  dialogsManager: undefined,

  messages: [],
  messagesManager: undefined,

  panels: [],
  panelsManager: undefined,

  tabs: [],
  activeTabId: undefined,
  tabsManager: undefined,

  tasks: [],
  tasksManager: undefined,

  widgets: [],
  widgetsManager: undefined,
});

export interface INotebookTabController {
  getAppController: () => IAppController | undefined;
  getTabId: () => string | undefined;
}

export const NotebookTabController =
  React.createContext<INotebookTabController>({
    getAppController: () => undefined,
    getTabId: () => undefined,
  });

export interface INotebookController {
  getNotebookPageController: () => INotebookTabController | undefined;
  getNotebook: () => INotebook | undefined;
}

export const NotebookController = React.createContext<INotebookController>({
  getNotebookPageController: () => undefined,
  getNotebook: () => undefined,
});
