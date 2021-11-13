import React from "react";

import { IMessage, ITab, ITask, IWidget } from "../App";

export interface IAppController {
  addTab: (tab: ITab) => void;
  removeTab: (id: string) => void;
  selectTab: (id: string) => void;
  setTabTitle: (id: string, title: string) => void;
  setTabContent: (id: string, content: JSX.Element) => void;
  getTabs: () => ITab[] | undefined;
  getActiveTabId: () => string | undefined;
  getTab: (id: string) => ITab | undefined;
  createEmptyTab: () => ITab | undefined;

  addMessage: (message: IMessage) => void;
  removeMessage: (id: string) => void;
  getMessages: () => IMessage[] | undefined;
  getMessage: (id: string) => IMessage | undefined;

  addTask: (task: ITask) => void;
  removeTask: (id: string) => void;
  getTasks: () => ITask[] | undefined;
  getTask: (id: string) => ITask | undefined;
  isTasksPanelShown: () => boolean | undefined;
  showTasksPanel: () => void;
  hideTasksPanel: () => void;

  addStatusBarWidget: (widget: IWidget) => void;
  removeStatusBarWidget: (id: string) => void;
  getStatusBarWidgets: () => IWidget[] | undefined;
  getStatusBarWidget: (id: string) => IWidget | undefined;
}

export const AppController = React.createContext<IAppController>({
  addTab: (tab: ITab) => {},
  removeTab: (id: string) => {},
  selectTab: (id: string) => {},
  setTabTitle: (id: string, title: string) => {},
  setTabContent: (id: string, content: JSX.Element) => {},
  getTabs: () => undefined,
  getActiveTabId: () => undefined,
  getTab: (id: string) => undefined,
  createEmptyTab: () => undefined,

  addMessage: (message: IMessage) => {},
  removeMessage: (id: string) => {},
  getMessages: () => undefined,
  getMessage: (id: string) => undefined,

  addTask: (task: ITask) => {},
  removeTask: (id: string) => {},
  getTasks: () => undefined,
  getTask: (id: string) => undefined,
  isTasksPanelShown: () => undefined,
  showTasksPanel: () => {},
  hideTasksPanel: () => {},

  addStatusBarWidget: (widget: IWidget) => {},
  removeStatusBarWidget: (id: string) => {},
  getStatusBarWidgets: () => undefined,
  getStatusBarWidget: (id: string) => undefined,
});
