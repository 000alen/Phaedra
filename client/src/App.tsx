import Mousetrap from "mousetrap";
import React, { Component } from "react";
import { v4 as uuidv4 } from "uuid";

import { mergeStyles, MessageBarType } from "@fluentui/react";

import { ContextMenu } from "./components/ContextMenu";
import { Message } from "./components/Message";
import { StatusBar } from "./components/StatusBar";
import { TasksPanel } from "./components/TasksPanel";
import { TopBar } from "./components/TopBar";
import { AppController, IAppController } from "./contexts/AppController";
import { EmptyPage } from "./pages/EmptyPage";
import { MainPage } from "./pages/MainPage";
import { strings } from "./resources/strings";
import { theme } from "./resources/theme";
import { AppShortcuts } from "./shortcuts/AppShortcuts";

export interface ITab {
  id: string;
  title: string;
  content: JSX.Element;
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
  tasksPanelShown: boolean;
  appController: IAppController;
}

export class App extends Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);

    this.handleContextMenu = this.handleContextMenu.bind(this);
    this.showContextMenu = this.showContextMenu.bind(this);
    this.hideContextMenu = this.hideContextMenu.bind(this);

    this.addTab = this.addTab.bind(this);
    this.removeTab = this.removeTab.bind(this);
    this.selectTab = this.selectTab.bind(this);
    this.setTabTitle = this.setTabTitle.bind(this);
    this.setTabContent = this.setTabContent.bind(this);
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

    this.state = {
      contextMenuShown: false,
      contextMenuX: 0,
      contextMenuY: 0,

      tabs: [],
      activeTabId: undefined,
      messages: [],
      tasks: [],
      statusBarWidgets: [],

      tasksPanelShown: false,

      appController: {
        addTab: this.addTab,
        removeTab: this.removeTab,
        selectTab: this.selectTab,
        setTabTitle: this.setTabTitle,
        setTabContent: this.setTabContent,
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
      },
    };
  }

  componentDidMount(): void {
    const { appController } = this.state;

    document.addEventListener("contextmenu", this.handleContextMenu);
    document.addEventListener("click", () => this.hideContextMenu());

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
    document.removeEventListener("contextmenu", this.handleContextMenu);
    document.removeEventListener("click", () => this.hideContextMenu());

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
  addTab(tab: ITab) {
    const { tabs } = this.state;
    const newTabs = [...tabs];
    newTabs.push(tab);
    this.setState((state) => {
      return {
        ...state,
        tabs: newTabs,
        activeTabId: tab.id,
      };
    });
  }

  removeTab(id: string) {
    const { tabs, activeTabId } = this.state;
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

  selectTab(id: string) {
    this.setState((state) => {
      return {
        ...state,
        activeTabId: id,
      };
    });
  }

  setTabTitle(id: string, title: string) {
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
    });
  }

  setTabContent(id: string, content: JSX.Element) {
    const { tabs } = this.state;
    const newTabs = tabs.map((tab) =>
      tab.id === id
        ? {
            ...tab,
            content: content,
          }
        : tab
    );

    this.setState((state) => {
      return {
        ...state,
        tabs: newTabs,
      };
    });
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
    const id = uuidv4();
    return {
      id: id,
      title: strings.newTabTitle,
      content: <EmptyPage id={id} />,
    };
  }
  // #endregion

  // #region Messages
  addMessage(message: IMessage) {
    const { messages } = this.state;
    const newMessages = [...messages];
    newMessages.push(message);

    this.setState((state) => {
      return {
        ...state,
        messages: newMessages,
      };
    });
  }

  removeMessage(id: string) {
    const { messages } = this.state;
    const newMessages = messages.filter((message) => message.id !== id);

    this.setState((state) => {
      return {
        ...state,
        messages: newMessages,
      };
    });
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
  addTask(task: ITask) {
    const { tasks } = this.state;
    const newTasks = [...tasks];
    newTasks.push(task);

    this.setState((state) => {
      return {
        ...state,
        tasks: newTasks,
      };
    });
  }

  removeTask(id: string) {
    const { tasks } = this.state;
    const newTasks = tasks.filter((task) => task.id !== id);

    this.setState((state) => {
      return {
        ...state,
        tasks: newTasks,
      };
    });
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

  showTasksPanel() {
    this.setState((state) => {
      return {
        ...state,
        tasksPanelShown: true,
      };
    });
  }

  hideTasksPanel() {
    this.setState((state) => {
      return {
        ...state,
        tasksPanelShown: false,
      };
    });
  }
  // #endregion

  // #region StatusBarWidgets
  addStatusBarWidget(widget: IWidget) {
    const { statusBarWidgets } = this.state;
    const newStatusBarWidgets = [...statusBarWidgets];
    newStatusBarWidgets.push(widget);

    this.setState((state) => {
      return {
        ...state,
        statusBarWidgets: newStatusBarWidgets,
      };
    });
  }

  removeStatusBarWidget(id: string) {
    const { statusBarWidgets } = this.state;
    const newStatusBarWidgets = statusBarWidgets.filter(
      (widget) => widget.id !== id
    );

    this.setState((state) => {
      return {
        ...state,
        statusBarWidgets: newStatusBarWidgets,
      };
    });
  }

  getStatusBarWidgets(): IWidget[] {
    return this.state.statusBarWidgets;
  }

  getStatusBarWidget(id: string): IWidget | undefined {
    const { statusBarWidgets } = this.state;
    return statusBarWidgets.find((widget) => widget.id === id);
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
        backgroundColor: theme.palette.themePrimary,
      },
    });

    const content =
      activeTabId === undefined ? (
        <MainPage id={uuidv4()} />
      ) : (
        this.getTab(activeTabId)?.content
      );

    return (
      <AppController.Provider value={appController}>
        {contextMenuShown && <ContextMenu x={contextMenuX} y={contextMenuY} />}

        <div className={`w-screen h-screen overflow-hidden ${scrollbarStyles}`}>
          <TopBar tabs={tabs} activeTabId={activeTabId} />

          <div className="absolute top-5 inset-x-0 w-[60%] mx-auto space-y-0.5 z-50">
            {messages.map((message) => this.renderMessage(message))}
          </div>

          <div className="w-[100%] h-[calc(100%-60px)]">{content}</div>

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
