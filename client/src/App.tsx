import Mousetrap from "mousetrap";
import React, { Component } from "react";
import { v4 as uuidv4 } from "uuid";

import { DialogType, mergeStyles, MessageBarType } from "@fluentui/react";

import { ContextMenu } from "./components/ContextMenu";
import { Dialog } from "./components/Dialog";
import { Message } from "./components/Message";
import { StatusBar } from "./components/StatusBar";
import { TasksPanel } from "./components/TasksPanel";
import { TopBar } from "./components/TopBar";
import { AppController, IAppController } from "./contexts/AppController";
import { getStrings } from "./resources/strings";
import { getTheme } from "./resources/theme";
import { AppShortcuts } from "./shortcuts/AppShortcuts";
import { EmptyTab } from "./tabs/EmptyTab";
import { MainTab } from "./tabs/MainTab";

export interface ITab {
  id: string;
  title: string;
  component: any;
  props: any;
  dirty: boolean;
}

export interface IMessage {
  id: string;
  text: string;
  type: MessageBarType;
}

export interface ITask {
  id: string;
  name: string;
}

export interface IWidget {
  id: string;
  element: JSX.Element;
}

export interface IDialog {
  id: string;
  title: string;
  subText: string;
  type: DialogType;
  visible: boolean;
  footer?: JSX.Element;
  onDismiss?: () => void;
}

export interface AppProps {}

export interface AppState {
  contextMenuShown: boolean;
  contextMenuX: number;
  contextMenuY: number;
  tabs: ITab[];
  messages: IMessage[];
  activeTabId: string | undefined;
  tasks: ITask[];
  statusBarWidgets: IWidget[];
  dialogs: IDialog[];
  tasksPanelShown: boolean;
  appController: IAppController;
}

export class App extends Component<AppProps, AppState> {
  activeTabRef: any;

  constructor(props: AppProps) {
    super(props);

    this.handleContextMenu = this.handleContextMenu.bind(this);
    this.showContextMenu = this.showContextMenu.bind(this);
    this.hideContextMenu = this.hideContextMenu.bind(this);

    this.addTab = this.addTab.bind(this);
    this.closeTab = this.closeTab.bind(this);
    this.selectTab = this.selectTab.bind(this);
    this.setTabTitle = this.setTabTitle.bind(this);
    this.setTabContent = this.setTabContent.bind(this);
    this.setTabDirty = this.setTabDirty.bind(this);
    this.getTabs = this.getTabs.bind(this);
    this.getActiveTabId = this.getActiveTabId.bind(this);
    this.getTab = this.getTab.bind(this);
    this.createEmptyTab = this.createEmptyTab.bind(this);

    this.addMessage = this.addMessage.bind(this);
    this.removeMessage = this.removeMessage.bind(this);
    this.getMessages = this.getMessages.bind(this);
    this.getMessage = this.getMessage.bind(this);
    this.renderMessage = this.renderMessage.bind(this);

    this.addTask = this.addTask.bind(this);
    this.removeTask = this.removeTask.bind(this);
    this.getTasks = this.getTasks.bind(this);
    this.getTask = this.getTask.bind(this);
    this.isTasksPanelShown = this.isTasksPanelShown.bind(this);
    this.showTasksPanel = this.showTasksPanel.bind(this);
    this.hideTasksPanel = this.hideTasksPanel.bind(this);

    this.addStatusBarWidget = this.addStatusBarWidget.bind(this);
    this.removeStatusBarWidget = this.removeStatusBarWidget.bind(this);
    this.getStatusBarWidgets = this.getStatusBarWidgets.bind(this);
    this.getStatusBarWidget = this.getStatusBarWidget.bind(this);

    this.addDialog = this.addDialog.bind(this);
    this.removeDialog = this.removeDialog.bind(this);
    this.setDialogVisible = this.setDialogVisible.bind(this);
    this.getDialogs = this.getDialogs.bind(this);
    this.renderDialog = this.renderDialog.bind(this);

    const initialTab = this.createEmptyTab();

    this.state = {
      contextMenuShown: false,
      contextMenuX: 0,
      contextMenuY: 0,

      tabs: [initialTab],
      activeTabId: initialTab.id,
      messages: [],
      tasks: [],
      statusBarWidgets: [],
      dialogs: [],

      tasksPanelShown: false,

      appController: {
        addTab: this.addTab,
        closeTab: this.closeTab,
        selectTab: this.selectTab,
        setTabTitle: this.setTabTitle,
        setTabContent: this.setTabContent,
        setTabDirty: this.setTabDirty,
        getTabs: this.getTabs,
        getActiveTabId: this.getActiveTabId,
        getTab: this.getTab,
        createEmptyTab: this.createEmptyTab,

        addMessage: this.addMessage,
        removeMessage: this.removeMessage,
        getMessages: this.getMessages,
        getMessage: this.getMessage,

        addTask: this.addTask,
        removeTask: this.removeTask,
        getTasks: this.getTasks,
        getTask: this.getTask,
        isTasksPanelShown: this.isTasksPanelShown,
        showTasksPanel: this.showTasksPanel,
        hideTasksPanel: this.hideTasksPanel,

        addStatusBarWidget: this.addStatusBarWidget,
        removeStatusBarWidget: this.removeStatusBarWidget,
        getStatusBarWidgets: this.getStatusBarWidgets,
        getStatusBarWidget: this.getStatusBarWidget,

        addDialog: this.addDialog,
        removeDialog: this.removeDialog,
        setDialogVisible: this.setDialogVisible,
        getDialogs: this.getDialogs,
      },
    };
  }

  componentDidMount(): void {
    const { appController } = this.state;

    // ! TODO: This causes the app to re-render when clicked.
    // document.addEventListener("contextmenu", this.handleContextMenu);
    // document.addEventListener("click", () => this.hideContextMenu());

    for (const [keys, action] of Object.entries(AppShortcuts)) {
      Mousetrap.bind(
        keys,
        (event) => {
          action(appController);
          event.preventDefault();
        },
        "keyup"
      );
    }
  }

  componentWillUnmount(): void {
    // document.removeEventListener("contextmenu", this.handleContextMenu);
    // document.removeEventListener("click", () => this.hideContextMenu());

    for (const keys of Object.keys(AppShortcuts)) {
      Mousetrap.unbind(keys);
    }
  }

  // #region ContextMenu
  handleContextMenu(event: MouseEvent) {
    event.preventDefault();
    this.showContextMenu(event.clientX, event.clientY);
  }

  showContextMenu(x: number, y: number) {
    this.setState((state) => {
      return {
        ...state,
        contextMenuShown: true,
        contextMenuX: x,
        contextMenuY: y,
      };
    });
  }

  hideContextMenu() {
    this.setState((state) => {
      return {
        ...state,
        contextMenuShown: false,
        contextMenuX: 0,
        contextMenuY: 0,
      };
    });
  }
  // #endregion

  // #region Tabs
  addTab(tab: ITab, callback?: () => void) {
    const { tabs } = this.state;
    const newTabs = [...tabs];
    newTabs.push(tab);
    this.setState((state) => {
      return {
        ...state,
        tabs: newTabs,
        activeTabId: tab.id,
      };
    }, callback);
  }

  closeTab(id: string) {
    const { activeTabId } = this.state;
    const tab = this.getTab(id)!;

    if (tab.dirty) {
      if (activeTabId === id) {
        this.activeTabRef.handleDirt();
      } else {
        this.selectTab(id, () => {
          this.activeTabRef.handleDirt();
        });
      }
    } else {
      const { tabs } = this.state;
      const newTabs = tabs.filter((tab) => tab.id !== id);
      const activeTabIndex = tabs.findIndex((tab) => tab.id === activeTabId);

      const newActiveTabId = newTabs.length
        ? activeTabIndex !== 0
          ? newTabs[activeTabIndex - 1].id
          : newTabs[activeTabIndex].id
        : undefined;

      this.setState((state) => {
        return {
          ...state,
          tabs: newTabs,
          activeTabId: newActiveTabId,
        };
      });
    }
  }

  selectTab(id: string, callback?: () => void) {
    this.setState((state) => {
      return {
        ...state,
        activeTabId: id,
      };
    }, callback);
  }

  setTabTitle(id: string, title: string, callback?: () => void) {
    const { tabs } = this.state;
    const newTabs = tabs.map((tab) =>
      tab.id === id
        ? {
            ...tab,
            title: title,
          }
        : tab
    );

    this.setState((state) => {
      return {
        ...state,
        tabs: newTabs,
      };
    }, callback);
  }

  setTabContent(
    id: string,
    content: JSX.Element,
    props: any,
    callback?: () => void
  ) {
    const { tabs } = this.state;
    const newTabs = tabs.map((tab) =>
      tab.id === id
        ? {
            ...tab,
            component: content,
            props: props,
          }
        : tab
    );

    this.setState((state) => {
      return {
        ...state,
        tabs: newTabs,
      };
    }, callback);
  }

  setTabDirty(id: string, dirty: boolean, callback?: () => void) {
    const { tabs } = this.state;
    const newTabs = tabs.map((tab) =>
      tab.id === id
        ? {
            ...tab,
            dirty: dirty,
          }
        : tab
    );

    this.setState((state) => {
      return {
        ...state,
        tabs: newTabs,
      };
    }, callback);
  }

  getTabs(): ITab[] {
    return this.state.tabs;
  }

  getActiveTabId(): string | undefined {
    return this.state.activeTabId;
  }

  getTab(id: string): ITab | undefined {
    const { tabs } = this.state;
    return tabs.find((tab) => tab.id === id);
  }

  createEmptyTab(): ITab {
    return {
      id: uuidv4(),
      title: getStrings().newTabTitle,
      component: EmptyTab,
      props: {},
      dirty: false,
    };
  }
  // #endregion

  // #region Messages
  addMessage(message: IMessage, callback?: () => void) {
    const { messages } = this.state;
    const newMessages = [...messages];
    newMessages.push(message);

    this.setState((state) => {
      return {
        ...state,
        messages: newMessages,
      };
    }, callback);
  }

  removeMessage(id: string, callback?: () => void) {
    const { messages } = this.state;
    const newMessages = messages.filter((message) => message.id !== id);

    this.setState((state) => {
      return {
        ...state,
        messages: newMessages,
      };
    }, callback);
  }

  getMessages(): IMessage[] {
    return this.state.messages;
  }

  getMessage(id: string): IMessage | undefined {
    const { messages } = this.state;
    return messages.find((message) => message.id === id);
  }

  renderMessage(message: IMessage) {
    const { id, type, text } = message;

    return (
      <Message
        key={id}
        id={id}
        type={type}
        text={text}
        onDismiss={this.removeMessage}
      />
    );
  }
  // #endregion

  // #region Tasks
  addTask(task: ITask, callback?: () => void) {
    const { tasks } = this.state;
    const newTasks = [...tasks];
    newTasks.push(task);

    this.setState((state) => {
      return {
        ...state,
        tasks: newTasks,
      };
    }, callback);
  }

  removeTask(id: string, callback?: () => void) {
    const { tasks } = this.state;
    const newTasks = tasks.filter((task) => task.id !== id);

    this.setState((state) => {
      return {
        ...state,
        tasks: newTasks,
      };
    }, callback);
  }

  getTasks(): ITask[] {
    return this.state.tasks;
  }

  getTask(id: string): ITask | undefined {
    const { tasks } = this.state;
    return tasks.find((task) => task.id === id);
  }

  isTasksPanelShown(): boolean {
    return this.state.tasksPanelShown;
  }

  showTasksPanel(callback?: () => void) {
    this.setState((state) => {
      return {
        ...state,
        tasksPanelShown: true,
      };
    }, callback);
  }

  hideTasksPanel(callback?: () => void) {
    this.setState((state) => {
      return {
        ...state,
        tasksPanelShown: false,
      };
    }, callback);
  }
  // #endregion

  // #region StatusBarWidgets
  addStatusBarWidget(widget: IWidget, callback?: () => void) {
    const { statusBarWidgets } = this.state;
    const newStatusBarWidgets = [...statusBarWidgets];
    newStatusBarWidgets.push(widget);

    this.setState((state) => {
      return {
        ...state,
        statusBarWidgets: newStatusBarWidgets,
      };
    }, callback);
  }

  removeStatusBarWidget(id: string, callback?: () => void) {
    const { statusBarWidgets } = this.state;
    const newStatusBarWidgets = statusBarWidgets.filter(
      (widget) => widget.id !== id
    );

    this.setState((state) => {
      return {
        ...state,
        statusBarWidgets: newStatusBarWidgets,
      };
    }, callback);
  }

  getStatusBarWidgets(): IWidget[] {
    return this.state.statusBarWidgets;
  }

  getStatusBarWidget(id: string): IWidget | undefined {
    const { statusBarWidgets } = this.state;
    return statusBarWidgets.find((widget) => widget.id === id);
  }
  // #endregion

  // #region Dialogs
  addDialog(dialog: IDialog, callback?: () => void) {
    const { dialogs } = this.state;
    const newDialogs = [...dialogs];
    newDialogs.push(dialog);

    this.setState((state) => {
      return {
        ...state,
        dialogs: newDialogs,
      };
    }, callback);
  }

  removeDialog(id: string, callback?: () => void) {
    const { dialogs } = this.state;
    const newDialogs = dialogs.filter((dialog) => dialog.id !== id);

    this.setState((state) => {
      return {
        ...state,
        dialogs: newDialogs,
      };
    }, callback);
  }

  setDialogVisible(id: string, visible: boolean, callback?: () => void) {
    const { dialogs } = this.state;
    const newDialogs = dialogs.map((dialog) =>
      dialog.id === id
        ? {
            ...dialog,
            visible: visible,
          }
        : dialog
    );

    this.setState((state) => {
      return {
        ...state,
        dialogs: newDialogs,
      };
    }, callback);
  }

  getDialogs(): IDialog[] {
    return this.state.dialogs;
  }

  renderDialog(dialog: IDialog) {
    return (
      <Dialog
        key={dialog.id}
        id={dialog.id}
        title={dialog.title}
        subText={dialog.subText}
        type={dialog.type}
        visible={dialog.visible}
        footer={dialog.footer}
        onDismiss={dialog.onDismiss}
      />
    );
  }
  // #endregion

  render(): JSX.Element {
    const {
      contextMenuShown,
      contextMenuX,
      contextMenuY,
      appController,
      tasksPanelShown,
      tabs,
      messages,
      dialogs,
      activeTabId,
      tasks,
      statusBarWidgets,
    } = this.state;

    const scrollbarStyles = mergeStyles({
      "*::-webkit-scrollbar": {
        width: "16px",
      },
      "*::-webkit-scrollbar-thumb": {
        height: "56px",
        borderRadius: "8px",
        border: "4px solid transparent",
        backgroundClip: "content-box",
        backgroundColor: getTheme().palette.themePrimary,
      },
    });

    const TabComponent =
      activeTabId === undefined ? MainTab : this.getTab(activeTabId)?.component;

    const tabId = activeTabId === undefined ? uuidv4() : activeTabId;

    const tabProps =
      activeTabId === undefined ? {} : this.getTab(activeTabId)?.props;

    return (
      <AppController.Provider value={appController}>
        {contextMenuShown && <ContextMenu x={contextMenuX} y={contextMenuY} />}

        <div className={`w-screen h-screen overflow-hidden ${scrollbarStyles}`}>
          <TopBar tabs={tabs} activeTabId={activeTabId} />

          <div className="absolute top-5 inset-x-0 w-[60%] mx-auto space-y-0.5 z-50">
            {messages.map((message) => this.renderMessage(message))}
          </div>

          <div>{dialogs.map((dialog) => this.renderDialog(dialog))}</div>

          <div className="w-[100%] h-[calc(100%-60px)]">
            <TabComponent
              key={tabId}
              tabRef={(ref: any) => (this.activeTabRef = ref)}
              tabId={tabId}
              {...tabProps}
            />
          </div>

          <StatusBar
            onShowTasksPanel={this.showTasksPanel}
            tasks={tasks}
            statusBarWidgets={statusBarWidgets}
          />

          <TasksPanel
            tasksPanelShown={tasksPanelShown}
            hideTasksPanel={this.hideTasksPanel}
            tasks={tasks}
          />
        </div>
      </AppController.Provider>
    );
  }
}
