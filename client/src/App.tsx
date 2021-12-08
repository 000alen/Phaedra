import React from "react";
import { v4 as uuidv4 } from "uuid";

import { mergeStyles } from "@fluentui/react";

import { Dialog } from "./components/Dialog";
import { Message } from "./components/Message";
import { StatusBar } from "./components/StatusBar";
import { TasksPanel } from "./components/TasksPanel";
import { TopBar } from "./components/TopBar";
import { AppController, IAppController } from "./contexts";
import { IDialog, UseDialogs, UseDialogsInjectedProps } from "./HOC/UseDialogs";
import {
  IMessage,
  UseMessages,
  UseMessagesInjectedProps,
} from "./HOC/UseMessages";
import { UsePanels, UsePanelsInjectedProps } from "./HOC/UsePanels";
import { IShortcut, UseShortcuts } from "./HOC/UseShortcuts";
import { UseTabs, UseTabsInjectedProps } from "./HOC/UseTabs";
import { UseTasks, UseTasksInjectedProps } from "./HOC/UseTasks";
import { UseWidgets, UseWidgetsInjectedProps } from "./HOC/UseWidgets";
import { MainTab } from "./tabs/MainTab";
import { getTheme } from "./themes";
import { SettingsTab } from "./tabs/SettingsTab";
import { DevelopmentTab } from "./tabs/DevelopmentTab";

type AppProps = UseDialogsInjectedProps &
  UseMessagesInjectedProps &
  UsePanelsInjectedProps &
  UseTabsInjectedProps &
  UseTasksInjectedProps &
  UseWidgetsInjectedProps;

interface AppState {
  tasksPanelShown: boolean;
  appController: IAppController;
}

export class AppSkeleton extends React.Component<AppProps, AppState> {
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

  get dialogs() {
    return this.props.dialogs;
  }

  get dialogsManager() {
    return this.props.dialogsManager;
  }

  get messages() {
    return this.props.messages;
  }

  get messagesManager() {
    return this.props.messagesManager;
  }

  get panels() {
    return this.props.panels;
  }

  get panelsManager() {
    return this.props.panelsManager;
  }

  get tabs() {
    return this.props.tabs;
  }

  get activeTabId() {
    return this.props.activeTabId;
  }

  get tabsManager() {
    return this.props.tabsManager;
  }

  get tasks() {
    return this.props.tasks;
  }

  get tasksManager() {
    return this.props.tasksManager;
  }

  // #region Tasks Panel
  isTasksPanelShown(): boolean {
    return this.state.tasksPanelShown;
  }

  showTasksPanel(callback?: () => void) {
    this.setState(
      {
        tasksPanelShown: true,
      },
      callback
    );
  }

  hideTasksPanel(callback?: () => void) {
    this.setState(
      {
        tasksPanelShown: false,
      },
      callback
    );
  }
  // #endregion

  renderMessage(message: IMessage) {
    const { id, type, text } = message;

    return (
      <Message
        key={id}
        id={id}
        type={type}
        text={text}
        onDismiss={() => this.props.messagesManager.remove(id)}
      />
    );
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

  render() {
    const {
      dialogs,
      messages,
      tabs,
      activeTabId,
      setActiveTabRef,
      tabsManager,
      tasks,
      widgets,
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

    const tabId = activeTabId === undefined ? uuidv4() : activeTabId;

    const tabProps =
      activeTabId === undefined ? {} : tabsManager.get(activeTabId)?.props;

    return (
      <AppController.Provider value={appController}>
        <div className={`w-screen h-screen overflow-hidden ${scrollbarStyles}`}>
          <TopBar tabs={tabs} activeTabId={activeTabId} />

          <div className="absolute top-5 inset-x-0 w-[60%] mx-auto space-y-0.5 z-50">
            {messages.map((message) => this.renderMessage(message))}
          </div>

          <div>{dialogs.map((dialog) => this.renderDialog(dialog))}</div>

          <div className="w-full h-[calc(100%-60px)]">
            <TabComponent
              key={tabId}
              setActiveTabRef={setActiveTabRef}
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

export const AppShortcuts: IShortcut<AppSkeleton>[] = [
  {
    keys: "ctrl+n",
    description: "New tab",
    action: (appRef: React.RefObject<AppSkeleton>) => {
      appRef.current!.tabsManager.add(appRef.current!.tabsManager.empty());
    },
  },
  {
    keys: "ctrl+w",
    description: "Close tab",
    action: (appRef: React.RefObject<AppSkeleton>) => {
      appRef.current!.tabsManager.remove(
        appRef.current!.tabsManager.activeId()!
      );
    },
  },
  {
    keys: "ctrl+shift+t",
    description: "Show tasks panel",
    action: (appRef: React.RefObject<AppSkeleton>) => {
      appRef.current!.showTasksPanel();
    },
  },
  {
    keys: "ctrl+,",
    description: "Show settings tab",
    action: (appRef: React.RefObject<AppSkeleton>) => {
      appRef.current?.tabsManager.add({
        id: uuidv4(),
        title: "Settings",
        component: SettingsTab,
        props: {},
        dirty: false,
      });
    },
  },
  {
    keys: "ctrl+.",
    description: "Show development tab",
    action: (appRef: React.RefObject<AppSkeleton>) => {
      appRef.current?.tabsManager.add({
        id: uuidv4(),
        title: "Development",
        component: DevelopmentTab,
        props: {},
        dirty: false,
      });
    },
  },
];

export const App = UseShortcuts(
  UseDialogs(
    UseMessages(UsePanels(UseTabs(UseTasks(UseWidgets(AppSkeleton)))))
  ),
  AppShortcuts
);
