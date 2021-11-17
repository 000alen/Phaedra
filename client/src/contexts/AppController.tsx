import React from "react";

import { IDialog } from "../HOC/UseDialogs";
import { IMessage } from "../HOC/UseMessages";
import { IPanel } from "../HOC/UsePanels";
import { ITab } from "../HOC/UseTabs";
import { ITask } from "../HOC/UseTasks";
import { IWidget } from "../HOC/UseWidgets";

export interface IAppController {
  isTasksPanelShown: () => boolean | undefined;
  showTasksPanel: (callback?: () => void) => void;
  hideTasksPanel: (callback?: () => void) => void;

  dialogs: IDialog[];
  dialogsManager: any;

  messages: IMessage[];
  messagesManager: any;

  panels: IPanel[];
  panelsManager: any;

  tabs: ITab[];
  activeTabId: string | undefined;
  tabsManager: any;

  tasks: ITask[];
  tasksManager: any;

  widgets: IWidget[];
  widgetsManager: any;
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
