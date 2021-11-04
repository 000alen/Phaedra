import "./css/App.css";

import Mousetrap from "mousetrap";
import React, { Component } from "react";
import { v4 as uuidv4 } from "uuid";

import { StatusBarComponent } from "./components/StatusBarComponent";
import TopBarComponent from "./components/TopBarComponent";
import { AppController, IAppController } from "./contexts/AppController";
import { EmptyPage } from "./pages/EmptyPage";
import { MainPage } from "./pages/MainPage";
import { AppShortcuts } from "./shortcuts/AppShortcuts";
import {
  IClipboard,
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
    this.getTasks = this.getTasks.bind(this);
    this.getStatusBarWidgets = this.getStatusBarWidgets.bind(this);

    this.state = {
      tabs: [],
      activeTabId: undefined,
      clipboard: [],
      tasks: [],
      statusBarWidgets: [],
      appController: {
        tabsDo: this.tabsDo,
        clipboardDo: this.clipboardDo,
        tasksDo: this.tasksDo,
        widgetsDo: this.statusBarWidgetsDo,
        getTabs: this.getTabs,
        getActiveTabId: this.getActiveTabId,
        getClipboard: this.getClipboard,
        getTasks: this.getTasks,
        getWidgets: this.getStatusBarWidgets,
      },
    };
  }

  componentDidMount(): void {
    for (const [keys, action] of Object.entries(AppShortcuts)) {
      Mousetrap.bind(
        keys,
        (event) => {
          action(this.state.appController);
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
    const clipboard = this.state.clipboard;
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
    const tasks = this.state.tasks;
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
    const widgets = this.state.statusBarWidgets;
    const currentWidgets = manipulation(widgets, args);

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

  getTasks(): ITask[] {
    return this.state.tasks;
  }

  getStatusBarWidgets(): IWidget[] {
    return this.state.statusBarWidgets;
  }

  render(): JSX.Element {
    const { tabs, activeTabId, tasks, statusBarWidgets } = this.state;

    let content;
    if (activeTabId === undefined) {
      content = <MainPage id={uuidv4()} />;
    } else {
      content = getTabContent(tabs, activeTabId);
    }

    return (
      <AppController.Provider value={this.state.appController}>
        <div className="app">
          <TopBarComponent
            tabs={tabs}
            activeTabId={activeTabId}
            tabsDo={this.tabsDo}
          />

          <div className="appContent">{content}</div>

          <StatusBarComponent
            tasks={tasks}
            statusBarWidgets={statusBarWidgets}
          />
        </div>
      </AppController.Provider>
    );
  }
}
