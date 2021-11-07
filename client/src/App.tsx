import "./css/App.css";

import Mousetrap from "mousetrap";
import React, { Component } from "react";
import { v4 as uuidv4 } from "uuid";

import { Panel, PanelType } from "@fluentui/react";

import ClipboardPanelComponent from "./components/ClipboardPanelComponent";
import { StatusBarButtonComponent } from "./components/StatusBarButtonComponent";
import { StatusBarComponent } from "./components/StatusBarComponent";
import TasksPanelComponent from "./components/TasksPanelComponent";
import TopBarComponent from "./components/TopBarComponent";
import { AppController, IAppController } from "./contexts/AppController";
import { EmptyPage } from "./pages/EmptyPage";
import { MainPage } from "./pages/MainPage";
import { AppShortcuts } from "./shortcuts/AppShortcuts";
import {
  clipboardTop,
  IClipboard,
  IClipboardElement,
  IClipboardManipulation,
  IClipboardManipulationArguments,
} from "./structures/ClipboardStructure";
import {
  createTab,
  getTabContent,
  ITab,
  ITabsManipulation,
  ITabsManipulationArguments,
} from "./structures/TabsStructure";
import {
  ITask,
  ITasksManipulation,
  ITasksManipulationArguments,
} from "./structures/TasksStructure";
import {
  IWidget,
  IWidgetsManipulation,
  IWidgetsManipulationArguments,
} from "./structures/WidgetsStructure";

export interface AppProps {}

export interface AppState {
  tabs: ITab[];
  activeTabId: string | undefined;
  tasks: ITask[];
  statusBarWidgets: IWidget[];
  clipboard: IClipboard;
  clipboardPanelShown: boolean;
  tasksPanelShown: boolean;
  appController: IAppController;
}

export default class App extends Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);

    this.tabsDo = this.tabsDo.bind(this);
    this.clipboardDo = this.clipboardDo.bind(this);
    this.tasksDo = this.tasksDo.bind(this);
    this.statusBarWidgetsDo = this.statusBarWidgetsDo.bind(this);
    this.getTabs = this.getTabs.bind(this);
    this.getActiveTabId = this.getActiveTabId.bind(this);
    this.getClipboard = this.getClipboard.bind(this);
    this.getClipboardTop = this.getClipboardTop.bind(this);
    this.getTasks = this.getTasks.bind(this);
    this.getStatusBarWidgets = this.getStatusBarWidgets.bind(this);
    this.isClipboardPanelShown = this.isClipboardPanelShown.bind(this);
    this.showClipboardPanel = this.showClipboardPanel.bind(this);
    this.hideClipboardPanel = this.hideClipboardPanel.bind(this);
    this.isTasksPanelShown = this.isTasksPanelShown.bind(this);
    this.showTasksPanel = this.showTasksPanel.bind(this);
    this.hideTasksPanel = this.hideTasksPanel.bind(this);

    this.state = {
      tabs: [],
      activeTabId: undefined,
      clipboard: [],
      tasks: [
        {
          id: uuidv4(),
          name: "Task 1",
        },
        {
          id: uuidv4(),
          name: "Task 2",
        },
        {
          id: uuidv4(),
          name: "Task 3",
        },
      ],
      statusBarWidgets: [
        {
          id: uuidv4(),
          element: <StatusBarButtonComponent text="Button 1" icon="Cancel" />,
        },
        {
          id: uuidv4(),
          element: <StatusBarButtonComponent text="Button 2" icon="Cancel" />,
        },
        {
          id: uuidv4(),
          element: <StatusBarButtonComponent text="Button 3" icon="Cancel" />,
        },
      ],

      clipboardPanelShown: false,
      tasksPanelShown: false,

      appController: {
        tabsDo: this.tabsDo,
        clipboardDo: this.clipboardDo,
        tasksDo: this.tasksDo,
        widgetsDo: this.statusBarWidgetsDo,
        getTabs: this.getTabs,
        getActiveTabId: this.getActiveTabId,
        getClipboard: this.getClipboard,
        getClipboardTop: this.getClipboardTop,
        getTasks: this.getTasks,
        getWidgets: this.getStatusBarWidgets,
        isClipboardPanelShown: this.isClipboardPanelShown,
        showClipboardPanel: this.showClipboardPanel,
        hideClipboardPanel: this.hideClipboardPanel,
        isTasksPanelShown: this.isTasksPanelShown,
        showTasksPanel: this.showTasksPanel,
        hideTasksPanel: this.hideTasksPanel,
      },
    };
  }

  componentDidMount(): void {
    const { appController } = this.state;

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
    for (const keys of Object.keys(AppShortcuts)) {
      Mousetrap.unbind(keys);
    }
  }

  tabsDo(
    manipulation: ITabsManipulation,
    args: ITabsManipulationArguments
  ): void {
    if (args === undefined) args = {};

    let { tabs, activeTabId } = this.state;

    switch (manipulation.name) {
      case "addTab":
        const id = uuidv4();
        if (args.tab === undefined) {
          const tab = createTab({
            id: id,
            content: <EmptyPage key={id} id={id} />,
          });
          args = { ...args, tab: tab };
        }
        break;
      default:
        break;
    }

    let tabsInformation = manipulation(tabs, activeTabId!, args);

    this.setState((state) => {
      return {
        ...state,
        ...tabsInformation,
      };
    });
  }

  clipboardDo(
    manipulation: IClipboardManipulation,
    args: IClipboardManipulationArguments
  ): void {
    const { clipboard } = this.state;
    const currentClipboard = manipulation(clipboard, args);

    this.setState((state) => {
      return {
        ...state,
        clipboard: currentClipboard,
      };
    });
  }

  tasksDo(
    manipulation: ITasksManipulation,
    args: ITasksManipulationArguments
  ): void {
    const { tasks } = this.state;
    const currentTasks = manipulation(tasks, args);

    this.setState((state) => {
      return {
        ...state,
        tasks: currentTasks,
      };
    });
  }

  statusBarWidgetsDo(
    manipulation: IWidgetsManipulation,
    args: IWidgetsManipulationArguments
  ): void {
    const { statusBarWidgets } = this.state;
    const currentWidgets = manipulation(statusBarWidgets, args);

    this.setState((state) => {
      return {
        ...state,
        statusBarWidgets: currentWidgets,
      };
    });
  }

  getTabs(): ITab[] {
    return this.state.tabs;
  }

  getActiveTabId(): string | undefined {
    return this.state.activeTabId;
  }

  getClipboard(): IClipboard {
    return this.state.clipboard;
  }

  getClipboardTop(): IClipboardElement {
    return clipboardTop(this.getClipboard());
  }

  getTasks(): ITask[] {
    return this.state.tasks;
  }

  getStatusBarWidgets(): IWidget[] {
    return this.state.statusBarWidgets;
  }

  isClipboardPanelShown(): boolean {
    return this.state.clipboardPanelShown;
  }

  showClipboardPanel() {
    this.setState((state) => {
      return {
        ...state,
        clipboardPanelShown: true,
      };
    });
  }

  hideClipboardPanel() {
    this.setState((state) => {
      return {
        ...state,
        clipboardPanelShown: false,
      };
    });
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

  render(): JSX.Element {
    const {
      appController,
      clipboardPanelShown,
      tasksPanelShown,
      tabs,
      activeTabId,
      tasks,
      statusBarWidgets,
      clipboard,
    } = this.state;

    let content;
    if (activeTabId === undefined) {
      content = <MainPage id={uuidv4()} />;
    } else {
      content = getTabContent(tabs, activeTabId);
    }

    return (
      <AppController.Provider value={appController}>
        <div className="app">
          <TopBarComponent
            tabs={tabs}
            activeTabId={activeTabId}
            tabsDo={this.tabsDo}
          />

          <div className="appContent">{content}</div>

          <StatusBarComponent
            onShowTasksPanel={this.showTasksPanel}
            tasks={tasks}
            statusBarWidgets={statusBarWidgets}
          />

          <ClipboardPanelComponent
            clipboardPanelShown={clipboardPanelShown}
            hideClipboardPanel={this.hideClipboardPanel}
            clipboard={clipboard}
          />

          <TasksPanelComponent
            tasksPanelShown={tasksPanelShown}
            hideTasksPanel={this.hideTasksPanel}
            tasks={tasks}
          />
        </div>
      </AppController.Provider>
    );
  }
}
