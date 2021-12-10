import React from "react";
import { v4 as uuidv4 } from "uuid";

import {
  DefaultButton,
  DialogFooter,
  DialogType,
  IconButton,
  PrimaryButton,
} from "@fluentui/react";

import { saveAction } from "../actions";
import {
  AppController,
  IAppController,
  INotebookTabController,
  NotebookTabController,
} from "../contexts";
import { IShortcut, UseShortcuts } from "../HOC/UseShortcuts";
import { Notebook } from "../Notebook/Notebook";
import { emptyPage, NotebookManager } from "../Notebook/UseNotebook";
import { INotebook } from "../Notebook/Notebook";
import { PresentationTab } from "./PresentationTab";

type NotebookTabProps = TabProps & {
  notebook: INotebook;
  notebookPath?: string | undefined;
};

export interface NotebookTabState {
  notebookTabController: INotebookTabController;
}

class NotebookTabSkeleton extends React.Component<
  NotebookTabProps,
  NotebookTabState
> {
  static contextType = AppController;

  notebookManager: NotebookManager | undefined = undefined;

  constructor(props: NotebookTabProps) {
    super(props);

    this.getAppController = this.getAppController.bind(this);
    this.getTabId = this.getTabId.bind(this);
    this.getNotebookManager = this.getNotebookManager.bind(this);
    this.addPage = this.addPage.bind(this);

    this.isDirty = this.isDirty.bind(this);
    this.setDirty = this.setDirty.bind(this);
    this.handleDirt = this.handleDirt.bind(this);

    this.state = {
      notebookTabController: {
        isDirty: this.isDirty,
        setDirty: this.setDirty,
        handleDirt: this.handleDirt,
        getAppController: this.getAppController,
        getTabId: this.getTabId,
        getNotebookManager: this.getNotebookManager,
      },
    };
  }

  componentDidMount(): void {
    const appController: IAppController = this.context;
    const { setActiveTabRef, tabId, notebook } = this.props;
    setActiveTabRef(this);

    appController.tabsManager!.setTitle(tabId, notebook.name);
  }

  componentWillUnmount(): void {
    const { setActiveTabRef } = this.props;

    setActiveTabRef(undefined);
  }

  getAppController(): IAppController {
    return this.context;
  }
  getTabId(): string {
    return this.props.tabId;
  }

  getNotebookManager(): NotebookManager | undefined {
    return this.notebookManager;
  }

  isDirty() {
    const { tabId } = this.props;
    const appController = this.getAppController();
    const tab = appController.tabsManager?.get(tabId)!;
    return tab?.dirty;
  }

  setDirty(dirty: boolean) {
    if (dirty === this.isDirty()) return;

    const { tabId } = this.props;
    const appController = this.getAppController();
    appController.tabsManager?.setDirty(tabId, dirty);
  }

  handleDirt(callback?: () => void): void {
    const appController: IAppController = this.context;
    const { notebook } = this.props;

    const dialogId = uuidv4();

    appController.dialogsManager!.add({
      id: dialogId,
      title: "Save changes?",
      subText: notebook.name,
      type: DialogType.normal,
      visible: true,
      onDismiss: () => {
        appController.dialogsManager!.remove(dialogId);
      },
      footer: (
        <DialogFooter>
          <DefaultButton
            text="Cancel"
            onClick={() => {
              appController.dialogsManager!.remove(dialogId);
            }}
          />
          <DefaultButton
            text="Do not save"
            onClick={() => {
              appController.dialogsManager!.remove(dialogId, () => {
                appController.tabsManager!.setDirty(
                  this.getTabId(),
                  false,
                  () => {
                    appController.tabsManager!.remove(this.getTabId());
                  }
                );
              });
            }}
          />
          <PrimaryButton
            text="Save"
            onClick={() => {
              appController.dialogsManager!.remove(dialogId, () => {
                this.notebookManager!.save().then(() => {
                  appController.tabsManager!.remove(this.getTabId());
                });
              });
            }}
          />
        </DialogFooter>
      ),
    });
  }

  addPage() {
    this.notebookManager?.addPage(emptyPage());
  }

  handlePresentation() {
    const appController: IAppController = this.context;
    const { tabId } = this.props;
    appController.tabsManager!.setComponent(tabId, PresentationTab, {
      notebook: this.notebookManager?.notebook,
    });
  }

  render(): JSX.Element {
    const { notebookTabController } = this.state;

    return (
      <NotebookTabController.Provider value={notebookTabController}>
        <div className="w-full h-full">
          <Notebook
            key={this.props.tabId}
            initialize={(notebookManager: NotebookManager) => {
              this.notebookManager = notebookManager;
            }}
            notebookTabController={notebookTabController}
            notebook={this.props.notebook}
            notebookPath={this.props.notebookPath}
          />
          <div className="absolute flex flex-row-reverse align-middle bottom-5 right-5">
            <IconButton
              iconProps={{ iconName: "Add" }}
              onClick={() => this.addPage()}
            />
            <IconButton
              iconProps={{ iconName: "Presentation" }}
              onClick={() => {
                this.handlePresentation();
              }}
            />
          </div>
        </div>
      </NotebookTabController.Provider>
    );
  }
}

export const NotebookTabShortcuts: IShortcut<NotebookTabSkeleton>[] = [
  {
    keys: "ctrl+s",
    description: "Save notebook",
    action: (notebookTabRef: React.RefObject<NotebookTabSkeleton>) =>
      saveAction(notebookTabRef.current!),
  },
];

export const NotebookTab = UseShortcuts(
  NotebookTabSkeleton,
  NotebookTabShortcuts
);
