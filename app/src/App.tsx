import React from "react";
import { v4 as uuidv4 } from "uuid";

import {
  DialogType,
  mergeStyles,
  MessageBarType,
  PanelType
} from "@fluentui/react";

import { Dialog } from "./components/Dialog";
import { Message } from "./components/Message";
import { StatusBar } from "./components/StatusBar";
import { TasksPanel } from "./components/TasksPanel";
import { TopBar } from "./components/TopBar";
import { AppController, IAppController } from "./contexts";
import { IShortcut, UseShortcuts } from "./HOC/UseShortcuts";
import { getStrings } from "./i18n/i18n";
import { DevelopmentTab } from "./tabs/DevelopmentTab";
import { EmptyTab } from "./tabs/EmptyTab";
import { MainTab } from "./tabs/MainTab";
import { SettingsTab } from "./tabs/SettingsTab";
import { getTheme } from "./themes";
import { IDialog, IMessage, IPanel, ITab, ITask, IWidget } from "./types";

interface AppSkeletonProps {}

interface AppSkeletonState {
  tasksPanelShown: boolean;
  appController: IAppController;
  dialogs: IDialog[];
  messages: IMessage[];
  panels: IPanel[];
  tabs: ITab[];
  activeTabId: string | undefined;
  tasks: ITask[];
  widgets: IWidget[];
}

export function makeTab({
  id,
  title,
  component,
  props,
  dirty
}: Partial<ITab>): ITab {
  if (id === undefined) id = uuidv4();
  if (title === undefined) title = getStrings().newTabTitle;
  if (component === undefined) component = EmptyTab;
  if (props === undefined) props = {};
  if (dirty === undefined) dirty = false;

  return {
    id,
    title,
    component,
    props,
    dirty
  };
}

export class AppSkeleton extends React.Component<
  AppSkeletonProps,
  AppSkeletonState
> {
  activeTabRef: any;

  constructor(props: AppSkeletonProps) {
    super(props);

    this.getDialog = this.getDialog.bind(this);
    this.addDialog = this.addDialog.bind(this);
    this.removeDialog = this.removeDialog.bind(this);
    this.setDialogTitle = this.setDialogTitle.bind(this);
    this.setDialogSubText = this.setDialogSubText.bind(this);
    this.setDialogType = this.setDialogType.bind(this);
    this.setDialogFooter = this.setDialogFooter.bind(this);
    this.setDialogOnDismiss = this.setDialogOnDismiss.bind(this);
    this.getMessage = this.getMessage.bind(this);
    this.addMessage = this.addMessage.bind(this);
    this.removeMessage = this.removeMessage.bind(this);
    this.setMessageText = this.setMessageText.bind(this);
    this.setMessageType = this.setMessageType.bind(this);
    this.getPanel = this.getPanel.bind(this);
    this.addPanel = this.addPanel.bind(this);
    this.removePanel = this.removePanel.bind(this);
    this.setPanelType = this.setPanelType.bind(this);
    this.setPanelVisible = this.setPanelVisible.bind(this);
    this.setPanelContent = this.setPanelContent.bind(this);
    this.setPanelOnDismiss = this.setPanelOnDismiss.bind(this);
    this.getTab = this.getTab.bind(this);
    this.getActiveTabId = this.getActiveTabId.bind(this);
    this.addTab = this.addTab.bind(this);
    this.removeTab = this.removeTab.bind(this);
    this.selectTab = this.selectTab.bind(this);
    this.setActiveTabRef = this.setActiveTabRef.bind(this);
    this.setTabTitle = this.setTabTitle.bind(this);
    this.setTabComponent = this.setTabComponent.bind(this);
    this.setTabProps = this.setTabProps.bind(this);
    this.setTabDirty = this.setTabDirty.bind(this);
    this.getTask = this.getTask.bind(this);
    this.addTask = this.addTask.bind(this);
    this.removeTask = this.removeTask.bind(this);
    this.setTaskName = this.setTaskName.bind(this);
    this.getWidget = this.getWidget.bind(this);
    this.addWidget = this.addWidget.bind(this);
    this.removeWidget = this.removeWidget.bind(this);
    this.setWidgetElement = this.setWidgetElement.bind(this);

    this.isTasksPanelShown = this.isTasksPanelShown.bind(this);
    this.showTasksPanel = this.showTasksPanel.bind(this);
    this.hideTasksPanel = this.hideTasksPanel.bind(this);

    this.renderDialog = this.renderDialog.bind(this);
    this.renderMessage = this.renderMessage.bind(this);

    this.state = {
      tasksPanelShown: false,

      appController: {
        getDialog: this.getDialog,
        addDialog: this.addDialog,
        removeDialog: this.removeDialog,
        setDialogTitle: this.setDialogTitle,
        setDialogSubText: this.setDialogSubText,
        setDialogType: this.setDialogType,
        setDialogFooter: this.setDialogFooter,
        setDialogOnDismiss: this.setDialogOnDismiss,
        getMessage: this.getMessage,
        addMessage: this.addMessage,
        removeMessage: this.removeMessage,
        setMessageText: this.setMessageText,
        setMessageType: this.setMessageType,
        getPanel: this.getPanel,
        addPanel: this.addPanel,
        removePanel: this.removePanel,
        setPanelType: this.setPanelType,
        setPanelVisible: this.setPanelVisible,
        setPanelContent: this.setPanelContent,
        setPanelOnDismiss: this.setPanelOnDismiss,
        getTab: this.getTab,
        getActiveTabId: this.getActiveTabId,
        addTab: this.addTab,
        removeTab: this.removeTab,
        selectTab: this.selectTab,
        setActiveTabRef: this.setActiveTabRef,
        setTabTitle: this.setTabTitle,
        setTabComponent: this.setTabComponent,
        setTabProps: this.setTabProps,
        setTabDirty: this.setTabDirty,
        getTask: this.getTask,
        addTask: this.addTask,
        removeTask: this.removeTask,
        setTaskName: this.setTaskName,
        getWidget: this.getWidget,
        addWidget: this.addWidget,
        removeWidget: this.removeWidget,
        setWidgetElement: this.setWidgetElement,

        isTasksPanelShown: this.isTasksPanelShown,
        showTasksPanel: this.showTasksPanel,
        hideTasksPanel: this.hideTasksPanel
      },

      messages: [],
      dialogs: [],
      panels: [],
      tabs: [],
      activeTabId: undefined,
      tasks: [],
      widgets: []
    };
  }

  getDialog(id: string) {
    return this.state.dialogs.find((dialog) => dialog.id === id);
  }

  addDialog(dialog: IDialog, callback?: () => void) {
    const newDialogs = [...this.state.dialogs];
    newDialogs.push(dialog);
    this.setState({ dialogs: newDialogs }, callback);
  }

  removeDialog(id: string, callback?: () => void) {
    const newDialogs = this.state.dialogs.filter((dialog) => dialog.id !== id);
    this.setState({ dialogs: newDialogs }, callback);
  }

  setDialogTitle(id: string, title: string, callback?: () => void) {
    const newDialogs = this.state.dialogs.map((dialog) =>
      dialog.id === id ? { ...dialog, title } : dialog
    );
    this.setState({ dialogs: newDialogs }, callback);
  }

  setDialogSubText(id: string, subText: string, callback?: () => void) {
    const newDialogs = this.state.dialogs.map((dialog) =>
      dialog.id === id ? { ...dialog, subText } : dialog
    );
    this.setState({ dialogs: newDialogs }, callback);
  }

  setDialogType(id: string, type: DialogType, callback?: () => void) {
    const newDialogs = this.state.dialogs.map((dialog) =>
      dialog.id === id ? { ...dialog, type } : dialog
    );
    this.setState({ dialogs: newDialogs }, callback);
  }

  setDialogVisible(id: string, visible: boolean, callback?: () => void) {
    const newDialogs = this.state.dialogs.map((dialog) =>
      dialog.id === id ? { ...dialog, visible } : dialog
    );
    this.setState({ dialogs: newDialogs }, callback);
  }

  setDialogFooter(id: string, footer: JSX.Element, callback?: () => void) {
    const newDialogs = this.state.dialogs.map((dialog) =>
      dialog.id === id ? { ...dialog, footer } : dialog
    );
    this.setState({ dialogs: newDialogs }, callback);
  }

  setDialogOnDismiss(id: string, onDismiss: () => void, callback?: () => void) {
    const newDialogs = this.state.dialogs.map((dialog) =>
      dialog.id === id ? { ...dialog, onDismiss } : dialog
    );
    this.setState({ dialogs: newDialogs }, callback);
  }

  getMessage(id: string) {
    return this.state.messages.find((message) => message.id === id);
  }

  addMessage(message: IMessage, callback?: () => void) {
    const newMessages = [...this.state.messages];
    newMessages.push(message);
    this.setState({ messages: newMessages }, callback);
  }

  removeMessage(id: string, callback?: () => void) {
    const newMessages = this.state.messages.filter(
      (message) => message.id !== id
    );
    this.setState({ messages: newMessages }, callback);
  }

  setMessageText(id: string, text: string, callback?: () => void) {
    const newMessages = this.state.messages.map((message) =>
      message.id === id ? { ...message, text } : message
    );
    this.setState({ messages: newMessages }, callback);
  }

  setMessageType(id: string, type: MessageBarType, callback?: () => void) {
    const newMessages = this.state.messages.map((message) =>
      message.id === id ? { ...message, type } : message
    );
    this.setState({ messages: newMessages }, callback);
  }

  getPanel(id: string) {
    return this.state.panels.find((panel) => panel.id === id);
  }

  addPanel(panel: IPanel, callback?: () => void) {
    const newPanels = [...this.state.panels];
    newPanels.push(panel);
    this.setState({ panels: newPanels }, callback);
  }

  removePanel(id: string, callback?: () => void) {
    const newPanels = this.state.panels.filter((panel) => panel.id !== id);
    this.setState({ panels: newPanels }, callback);
  }

  setPanelType(id: string, type: PanelType, callback?: () => void) {
    const newPanels = this.state.panels.map((panel) =>
      panel.id === id ? { ...panel, type } : panel
    );
    this.setState({ panels: newPanels }, callback);
  }

  setPanelVisible(id: string, visible: boolean, callback?: () => void) {
    const newPanels = this.state.panels.map((panel) =>
      panel.id === id ? { ...panel, visible } : panel
    );
    this.setState({ panels: newPanels }, callback);
  }

  setPanelContent(id: string, content: JSX.Element, callback?: () => void) {
    const newPanels = this.state.panels.map((panel) =>
      panel.id === id ? { ...panel, content } : panel
    );
    this.setState({ panels: newPanels }, callback);
  }

  setPanelOnDismiss(id: string, onDismiss: () => void, callback?: () => void) {
    const newPanels = this.state.panels.map((panel) =>
      panel.id === id ? { ...panel, onDismiss } : panel
    );
    this.setState({ panels: newPanels }, callback);
  }

  getTab(id: string) {
    return this.state.tabs.find((tab) => tab.id === id);
  }

  getActiveTabId() {
    return this.state.activeTabId;
  }

  addTab(tab: ITab, callback?: () => void) {
    const newTabs = [...this.state.tabs];
    newTabs.push(tab);
    this.setState({ tabs: newTabs, activeTabId: tab.id }, callback);
  }

  removeTab(id: string, callback?: () => void) {
    if (this.getTab(id)?.dirty) {
      this.selectTab(id, () => {
        this.activeTabRef.handleDirt(callback);
      });
      return;
    }

    const newTabs = this.state.tabs.filter((tab) => tab.id !== id);
    const activeTabIndex = this.state.tabs.findIndex(
      (tab) => tab.id === this.state.activeTabId
    );

    const newActiveTabId = newTabs.length
      ? activeTabIndex !== 0
        ? newTabs[activeTabIndex - 1].id
        : newTabs[activeTabIndex].id
      : undefined;

    this.setState(
      {
        tabs: newTabs,
        activeTabId: newActiveTabId
      },
      callback
    );
  }

  selectTab(id: string, callback?: () => void) {
    this.setState({ activeTabId: id }, callback);
  }

  setActiveTabRef(ref: any) {
    this.activeTabRef = ref;
  }

  setTabTitle(id: string, title: string, callback?: () => void) {
    const newTabs = this.state.tabs.map((tab) =>
      tab.id === id ? { ...tab, title } : tab
    );
    this.setState({ tabs: newTabs }, callback);
  }

  setTabComponent(
    id: string,
    component: any,
    props: any,
    callback?: () => void
  ) {
    const newTabs = this.state.tabs.map((tab) =>
      tab.id === id ? { ...tab, component, props } : tab
    );
    this.setState({ tabs: newTabs }, callback);
  }

  setTabProps(id: string, props: any, callback?: () => void) {
    const newTabs = this.state.tabs.map((tab) =>
      tab.id === id ? { ...tab, props } : tab
    );
    this.setState({ tabs: newTabs }, callback);
  }

  setTabDirty(id: string, dirty: boolean, callback?: () => void) {
    const newTabs = this.state.tabs.map((tab) =>
      tab.id === id ? { ...tab, dirty } : tab
    );
    this.setState({ tabs: newTabs }, callback);
  }

  getTask(id: string) {
    return this.state.tasks.find((t) => t.id === id);
  }

  addTask(task: ITask, callback?: () => void) {
    const newTasks = [...this.state.tasks];
    newTasks.push(task);
    this.setState({ tasks: newTasks }, callback);
  }

  removeTask(id: string, callback?: () => void) {
    const newTasks = this.state.tasks.filter((task) => task.id !== id);
    this.setState({ tasks: newTasks }, callback);
  }

  setTaskName(id: string, name: string, callback?: () => void) {
    const newTasks = this.state.tasks.map((task) =>
      task.id === id ? { ...task, name } : task
    );
    this.setState({ tasks: newTasks }, callback);
  }

  getWidget(id: string) {
    return this.state.widgets.find((w) => w.id === id);
  }

  addWidget(widget: IWidget, callback?: () => void) {
    const newWidgets = [...this.state.widgets];
    newWidgets.push(widget);
    this.setState({ widgets: newWidgets }, callback);
  }

  removeWidget(id: string, callback?: () => void) {
    const newWidgets = this.state.widgets.filter((widget) => widget.id !== id);
    this.setState({ widgets: newWidgets }, callback);
  }

  setWidgetElement(id: string, element: JSX.Element, callback?: () => void) {
    const newWidgets = this.state.widgets.map((widget) =>
      widget.id === id ? { ...widget, element } : widget
    );
    this.setState({ widgets: newWidgets }, callback);
  }

  isTasksPanelShown(): boolean {
    return this.state.tasksPanelShown;
  }

  showTasksPanel(callback?: () => void) {
    this.setState(
      {
        tasksPanelShown: true
      },
      callback
    );
  }

  hideTasksPanel(callback?: () => void) {
    this.setState(
      {
        tasksPanelShown: false
      },
      callback
    );
  }

  renderMessage(message: IMessage) {
    const { id, type, text } = message;

    return (
      <Message
        key={id}
        id={id}
        type={type}
        text={text}
        onDismiss={() => this.removeMessage(id)}
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
      appController,
      tasksPanelShown,
      dialogs,
      messages,
      tabs,
      activeTabId,
      tasks,
      widgets
    } = this.state;

    const scrollbarStyles = mergeStyles({
      "*::-webkit-scrollbar": {
        width: "16px"
      },
      "*::-webkit-scrollbar-thumb": {
        height: "56px",
        borderRadius: "8px",
        border: "4px solid transparent",
        backgroundClip: "content-box",
        backgroundColor: getTheme().palette.themePrimary
      }
    });

    const TabComponent =
      activeTabId === undefined ? MainTab : this.getTab(activeTabId)?.component;

    const tabId = activeTabId === undefined ? uuidv4() : activeTabId;

    const tabProps =
      activeTabId === undefined ? {} : this.getTab(activeTabId)?.props;

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
              setActiveTabRef={this.setActiveTabRef}
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
      appRef.current!.addTab(makeTab({}));
    }
  },
  {
    keys: "ctrl+w",
    description: "Close tab",
    action: (appRef: React.RefObject<AppSkeleton>) => {
      appRef.current!.removeTab(appRef.current!.getActiveTabId()!);
    }
  },
  {
    keys: "ctrl+shift+t",
    description: "Show tasks panel",
    action: (appRef: React.RefObject<AppSkeleton>) => {
      appRef.current!.showTasksPanel();
    }
  },
  {
    keys: "ctrl+,",
    description: "Show settings tab",
    action: (appRef: React.RefObject<AppSkeleton>) => {
      appRef.current!.addTab({
        id: uuidv4(),
        title: "Settings",
        component: SettingsTab,
        props: {},
        dirty: false
      });
    }
  },
  {
    keys: "ctrl+.",
    description: "Show development tab",
    action: (appRef: React.RefObject<AppSkeleton>) => {
      appRef.current!.addTab({
        id: uuidv4(),
        title: "Development",
        component: DevelopmentTab,
        props: {},
        dirty: false
      });
    }
  }
];

export const App = UseShortcuts(AppSkeleton, AppShortcuts);
