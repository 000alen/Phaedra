import { DialogType, MessageBarType, PanelType } from "@fluentui/react";
import React from "react";

import { INotebook } from "./Notebook/types";
import { NotebookManager } from "./Notebook/UseNotebook";
import { IDialog, IMessage, IPanel, ITab, ITask, IWidget } from "./types";

export interface IAppController {
  getDialog: (id: string, callback?: () => void) => IDialog | undefined;
  addDialog: (dialog: IDialog, callback?: () => void) => void;
  removeDialog: (id: string, callback?: () => void) => void;
  setDialogTitle: (id: string, title: string, callback?: () => void) => void;
  setDialogSubText: (
    id: string,
    subText: string,
    callback?: () => void
  ) => void;
  setDialogType: (id: string, type: DialogType, callback?: () => void) => void;
  setDialogFooter: (
    id: string,
    footer: JSX.Element,
    callback?: () => void
  ) => void;
  setDialogOnDismiss: (
    id: string,
    onDismiss: () => void,
    callback?: () => void
  ) => void;

  getMessage: (id: string) => IMessage | undefined;
  addMessage: (message: IMessage, callback?: () => void) => void;
  removeMessage: (id: string, callback?: () => void) => void;
  setMessageText: (id: string, message: string, callback?: () => void) => void;
  setMessageType: (
    id: string,
    type: MessageBarType,
    callback?: () => void
  ) => void;

  getPanel: (id: string) => IPanel | undefined;
  addPanel: (panel: IPanel, callback?: () => void) => void;
  removePanel: (id: string, callback?: () => void) => void;
  setPanelType: (id: string, type: PanelType, callback?: () => void) => void;
  setPanelVisible: (
    id: string,
    visible: boolean,
    callback?: () => void
  ) => void;
  setPanelContent: (
    id: string,
    content: JSX.Element,
    callback?: () => void
  ) => void;
  setPanelOnDismiss: (
    id: string,
    onDismiss: () => void,
    callback?: () => void
  ) => void;

  getTab: (id: string) => ITab | undefined;
  getActiveTabId: () => string | undefined;
  addTab: (tab: ITab, callback?: () => void) => void;
  removeTab: (id: string, callback?: () => void) => void;
  selectTab: (id: string, callback?: () => void) => void;
  setActiveTabRef: (ref: any) => void;
  setTabTitle: (id: string, title: string, callback?: () => void) => void;
  setTabComponent: (
    id: string,
    component: any,
    props: object,
    callback?: () => void
  ) => void;
  setTabProps: (id: string, props: object, callback?: () => void) => void;
  setTabDirty: (id: string, dirty: boolean, callback?: () => void) => void;

  getTask: (id: string) => ITask | undefined;
  addTask: (task: ITask, callback?: () => void) => void;
  removeTask: (id: string, callback?: () => void) => void;
  setTaskName: (id: string, name: string, callback?: () => void) => void;

  getWidget: (id: string) => IWidget | undefined;
  addWidget: (widget: IWidget, callback?: () => void) => void;
  removeWidget: (id: string, callback?: () => void) => void;
  setWidgetElement: (
    id: string,
    element: JSX.Element,
    callback?: () => void
  ) => void;

  isTasksPanelShown: () => boolean | undefined;
  showTasksPanel: (callback?: () => void) => void;
  hideTasksPanel: (callback?: () => void) => void;
}

export const AppController = React.createContext<IAppController>({
  getDialog: (id: string, callback?: () => void) => undefined,
  addDialog: (dialog: IDialog, callback?: () => void) => {},
  removeDialog: (id: string, callback?: () => void) => {},
  setDialogTitle: (id: string, title: string, callback?: () => void) => {},
  setDialogSubText: (id: string, subText: string, callback?: () => void) => {},
  setDialogType: (id: string, type: DialogType, callback?: () => void) => {},
  setDialogFooter: (
    id: string,
    footer: JSX.Element,
    callback?: () => void
  ) => {},
  setDialogOnDismiss: (
    id: string,
    onDismiss: () => void,
    callback?: () => void
  ) => {},

  getMessage: (id: string) => undefined,
  addMessage: (message: IMessage, callback?: () => void) => {},
  removeMessage: (id: string, callback?: () => void) => {},
  setMessageText: (id: string, message: string, callback?: () => void) => {},
  setMessageType: (
    id: string,
    type: MessageBarType,
    callback?: () => void
  ) => {},

  getPanel: (id: string) => undefined,
  addPanel: (panel: IPanel, callback?: () => void) => {},
  removePanel: (id: string, callback?: () => void) => {},
  setPanelType: (id: string, type: PanelType, callback?: () => void) => {},
  setPanelVisible: (id: string, visible: boolean, callback?: () => void) => {},
  setPanelContent: (
    id: string,
    content: JSX.Element,
    callback?: () => void
  ) => {},
  setPanelOnDismiss: (
    id: string,
    onDismiss: () => void,
    callback?: () => void
  ) => {},

  getTab: (id: string) => undefined,
  getActiveTabId: () => undefined,
  addTab: (tab: ITab, callback?: () => void) => {},
  removeTab: (id: string, callback?: () => void) => {},
  selectTab: (id: string, callback?: () => void) => {},
  setActiveTabRef: (ref: any) => {},
  setTabTitle: (id: string, title: string, callback?: () => void) => {},
  setTabComponent: (
    id: string,
    component: any,
    props: object,
    callback?: () => void
  ) => {},
  setTabProps: (id: string, props: object, callback?: () => void) => {},
  setTabDirty: (id: string, dirty: boolean, callback?: () => void) => {},

  getTask: (id: string) => undefined,
  addTask: (task: ITask, callback?: () => void) => {},
  removeTask: (id: string, callback?: () => void) => {},
  setTaskName: (id: string, name: string, callback?: () => void) => {},

  getWidget: (id: string) => undefined,
  addWidget: (widget: IWidget, callback?: () => void) => {},
  removeWidget: (id: string, callback?: () => void) => {},
  setWidgetElement: (
    id: string,
    element: JSX.Element,
    callback?: () => void
  ) => {},

  isTasksPanelShown: () => undefined,
  showTasksPanel: (callback?: () => void) => {},
  hideTasksPanel: (callback?: () => void) => {},
});

export interface INotebookTabController {
  isDirty: () => boolean;
  setDirty: (isDirty: boolean) => void;
  handleDirt: (callback?: () => void) => void;
  getAppController: () => IAppController | undefined;
  getTabId: () => string | undefined;
  getNotebookManager: () => NotebookManager | undefined;
}

export const NotebookTabController =
  React.createContext<INotebookTabController>({
    isDirty: () => false,
    setDirty: (isDirty: boolean) => {},
    handleDirt: (callback?: () => void) => {},
    getAppController: () => undefined,
    getTabId: () => undefined,
    getNotebookManager: () => undefined,
  });

export interface INotebookController {
  getNotebookPageController: () => INotebookTabController | undefined;
  getNotebook: () => INotebook | undefined;
}

export const NotebookController = React.createContext<INotebookController>({
  getNotebookPageController: () => undefined,
  getNotebook: () => undefined,
});
