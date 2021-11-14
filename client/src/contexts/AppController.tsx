import React from "react";

import { IDialog, IMessage, ITab, ITask, IWidget } from "../App";

export interface IAppController {
  addTab: (tab: ITab, callback?: () => void) => void;
  closeTab: (id: string) => void;
  selectTab: (id: string, callback?: () => void) => void;
  setTabTitle: (id: string, title: string, callback?: () => void) => void;
  setTabContent: (
    id: string,
    content: any,
    props: any,
    callback?: () => void
  ) => void;
  setTabDirty: (id: string, dirty: boolean, callback?: () => void) => void;
  getTabs: () => ITab[] | undefined;
  getActiveTabId: () => string | undefined;
  getTab: (id: string) => ITab | undefined;
  createEmptyTab: () => ITab | undefined;

  addMessage: (message: IMessage, callback?: () => void) => void;
  removeMessage: (id: string, callback?: () => void) => void;
  getMessages: () => IMessage[] | undefined;
  getMessage: (id: string) => IMessage | undefined;

  addTask: (task: ITask, callback?: () => void) => void;
  removeTask: (id: string, callback?: () => void) => void;
  getTasks: () => ITask[] | undefined;
  getTask: (id: string) => ITask | undefined;
  isTasksPanelShown: () => boolean | undefined;
  showTasksPanel: (callback?: () => void) => void;
  hideTasksPanel: (callback?: () => void) => void;

  addStatusBarWidget: (widget: IWidget, callback?: () => void) => void;
  removeStatusBarWidget: (id: string, callback?: () => void) => void;
  getStatusBarWidgets: () => IWidget[] | undefined;
  getStatusBarWidget: (id: string) => IWidget | undefined;

  addDialog: (dialog: IDialog, callback?: () => void) => void;
  removeDialog: (id: string, callback?: () => void) => void;
  setDialogVisible: (
    id: string,
    visible: boolean,
    callback?: () => void
  ) => void;
  getDialogs: () => IDialog[] | undefined;
}

export const AppController = React.createContext<IAppController>({
  addTab: (tab: ITab, callback?: () => void) => {},
  closeTab: (id: string) => {},
  selectTab: (id: string, callback?: () => void) => {},
  setTabTitle: (id: string, title: string, callback?: () => void) => {},
  setTabContent: (
    id: string,
    content: any,
    props: any,
    callback?: () => void
  ) => {},
  setTabDirty: (id: string, dirty: boolean, callback?: () => void) => {},
  getTabs: () => undefined,
  getActiveTabId: () => undefined,
  getTab: (id: string) => undefined,
  createEmptyTab: () => undefined,

  addMessage: (message: IMessage, callback?: () => void) => {},
  removeMessage: (id: string, callback?: () => void) => {},
  getMessages: () => undefined,
  getMessage: (id: string) => undefined,

  addTask: (task: ITask, callback?: () => void) => {},
  removeTask: (id: string, callback?: () => void) => {},
  getTasks: () => undefined,
  getTask: (id: string) => undefined,
  isTasksPanelShown: () => undefined,
  showTasksPanel: (callback?: () => void) => {},
  hideTasksPanel: (callback?: () => void) => {},

  addStatusBarWidget: (widget: IWidget, callback?: () => void) => {},
  removeStatusBarWidget: (id: string, callback?: () => void) => {},
  getStatusBarWidgets: () => undefined,
  getStatusBarWidget: (id: string) => undefined,

  addDialog: (dialog: IDialog, callback?: () => void) => {},
  removeDialog: (id: string, callback?: () => void) => {},
  setDialogVisible: (id: string, visible: boolean, callback?: () => void) => {},
  getDialogs: () => undefined,
});
