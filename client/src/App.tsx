import Mousetrap from "mousetrap";
import React, { Component } from "react";
import { v4 as uuidv4 } from "uuid";

import { mergeStyles } from "@fluentui/react";

import { Dialog } from "./components/Dialog";
import { Message } from "./components/Message";
import { StatusBar } from "./components/StatusBar";
import { TasksPanel } from "./components/TasksPanel";
import { TopBar } from "./components/TopBar";
import { AppController, IAppController } from "./contexts/AppController";
import { IDialog, UseDialogs } from "./HOC/UseDialogs";
import { IMessage, UseMessages } from "./HOC/UseMessages";
import { IPanel, UsePanels } from "./HOC/UsePanels";
import { ITab, UseTabs } from "./HOC/UseTabs";
import { ITask, UseTasks } from "./HOC/UseTasks";
import { IWidget, UseWidgets } from "./HOC/UseWidgets";
import { getTheme } from "./resources/theme";
import { AppShortcuts } from "./shortcuts/AppShortcuts";
import { MainTab } from "./tabs/MainTab";

export interface AppProps {
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

export interface AppState {
  tasksPanelShown: boolean;
  appController: IAppController;
}

export class App extends Component<AppProps, AppState> {
  activeTabRef: any;

  constructor(props: AppProps) {
    super(props);

    this.renderMessage = this.renderMessage.bind(this);

    this.isTasksPanelShown = this.isTasksPanelShown.bind(this);
    this.showTasksPanel = this.showTasksPanel.bind(this);
    this.hideTasksPanel = this.hideTasksPanel.bind(this);

    this.renderDialog = this.renderDialog.bind(this);

    const {
      dialogs,
      dialogsManager,
      messages,
      messagesManager,
      panels,
      panelsManager,
      tabs,
      activeTabId,
      tabsManager,
      tasks,
      tasksManager,
      widgets,
      widgetsManager,
    } = this.props;

    this.state = {
      tasksPanelShown: false,

      appController: {
        isTasksPanelShown: this.isTasksPanelShown,
        showTasksPanel: this.showTasksPanel,
        hideTasksPanel: this.hideTasksPanel,

        dialogs,
        dialogsManager,
        messages,
        messagesManager,
        panels,
        panelsManager,
        tabs,
        activeTabId,
        tabsManager,
        tasks,
        tasksManager,
        widgets,
        widgetsManager,
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

  renderMessage(message: IMessage) {
    const { id, type, text } = message;

    return (
      <Message
        key={id}
        id={id}
        type={type}
        text={text}
        // onDismiss={this.removeMessage}
        onDismiss={() => {}}
      />
    );
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

  render(): JSX.Element {
    const {
      dialogs,
      dialogsManager,
      messages,
      messagesManager,
      panels,
      panelsManager,
      tabs,
      activeTabId,
      tabsManager,
      tasks,
      tasksManager,
      widgets,
      widgetsManager,
    } = this.props;
    const { appController, tasksPanelShown } = this.state;

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
      activeTabId === undefined
        ? MainTab
        : tabsManager.get(activeTabId)?.component;
    // activeTabId === undefined ? MainTab : this.getTab(activeTabId)?.component;

    const tabId = activeTabId === undefined ? uuidv4() : activeTabId;

    const tabProps =
      activeTabId === undefined ? {} : tabsManager.get(activeTabId)?.props;
    // activeTabId === undefined ? {} : this.getTab(activeTabId)?.props;

    return (
      <AppController.Provider value={appController}>
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
            statusBarWidgets={widgets}
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

export const Application = UseDialogs(
  UseMessages(UsePanels(UseTabs(UseTasks(UseWidgets(App)))))
);
