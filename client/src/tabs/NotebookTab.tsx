import React from "react";
import { v4 as uuidv4 } from "uuid";

import {
  DefaultButton,
  DialogFooter,
  DialogType,
  PrimaryButton,
} from "@fluentui/react";

import { saveAction } from "../actions";
import { ColaborationPanel } from "../components/ColaborationPanel";
import { Notebook } from "../components/Notebook";
import {
  AppController,
  IAppController,
  INotebookController,
  INotebookTabController,
  NotebookTabController,
} from "../contexts";
import { INotebook } from "../HOC/UseNotebook";
import { IShortcuts, UseShortcuts } from "../HOC/UseShortcuts";

export interface NotebookTabProps {
  tabId: string;
  tabRef: (ref: any) => void;
  notebook: INotebook;
  notebookPath?: string | undefined;
}

export interface NotebookTabState {
  colaborationPanelShown: boolean;
  notebookTabController: INotebookTabController;
}

class NotebookTabSkeleton extends React.Component<
  NotebookTabProps,
  NotebookTabState
> {
  static contextType = AppController;

  notebookRef: React.RefObject<Notebook>;

  constructor(props: NotebookTabProps) {
    super(props);

    this.getAppController = this.getAppController.bind(this);
    this.getNotebookController = this.getNotebookController.bind(this);
    this.getTabId = this.getTabId.bind(this);
    this.showColaborationPanel = this.showColaborationPanel.bind(this);
    this.hideColaborationPanel = this.hideColaborationPanel.bind(this);
    this.isColaborationPanelShown = this.isColaborationPanelShown.bind(this);

    this.notebookRef = React.createRef();

    this.state = {
      colaborationPanelShown: false,
      notebookTabController: {
        getAppController: this.getAppController,
        getNotebookController: this.getNotebookController,
        getTabId: this.getTabId,
        showColaborationPanel: this.showColaborationPanel,
        hideColaborationPanel: this.hideColaborationPanel,
        isColaborationPanelShown: this.isColaborationPanelShown,
      },
    };
  }

  componentDidMount(): void {
    const { tabRef } = this.props;

    tabRef(this);
  }

  componentWillUnmount(): void {
    const { tabRef } = this.props;

    tabRef(undefined);
  }

  getAppController(): IAppController {
    return this.context;
  }

  getNotebookController(): INotebookController {
    return this.notebookRef.current!.state.notebookController!;
  }

  showColaborationPanel(): void {
    this.setState((state) => {
      return {
        ...state,
        colaborationPanelShown: true,
      };
    });
  }

  hideColaborationPanel(): void {
    this.setState((state) => {
      return {
        ...state,
        colaborationPanelShown: false,
      };
    });
  }

  isColaborationPanelShown(): boolean {
    return this.state.colaborationPanelShown;
  }

  getTabId(): string {
    return this.props.tabId;
  }

  handleDirt() {
    const appController: IAppController = this.context;
    const { notebook } = this.props;

    const dialogId = uuidv4();

    appController.dialogsManager.add({
      id: dialogId,
      title: "Save changes?",
      subText: notebook.name,
      type: DialogType.normal,
      visible: true,
      onDismiss: () => {
        appController.dialogsManager.remove(dialogId);
      },
      footer: (
        <DialogFooter>
          <DefaultButton
            text="Cancel"
            onClick={() => {
              appController.dialogsManager.remove(dialogId);
            }}
          />
          <DefaultButton
            text="Do not save"
            onClick={() => {
              appController.dialogsManager.remove(dialogId, () => {
                appController.tabsManager.setDirty(
                  this.getTabId(),
                  false,
                  () => {
                    appController.tabsManager.remove(this.getTabId());
                  }
                );
              });
            }}
          />
          <PrimaryButton
            text="Save"
            onClick={() => {
              appController.dialogsManager.remove(dialogId, () => {
                this.getNotebookController()
                  .save()
                  .then(() => {
                    appController.tabsManager.remove(this.getTabId());
                  });
              });
            }}
          />
        </DialogFooter>
      ),
    });
  }

  render(): JSX.Element {
    const { colaborationPanelShown, notebookTabController } = this.state;

    return (
      <NotebookTabController.Provider value={notebookTabController}>
        <div className="w-[100%] h-[100%]">
          <Notebook
            key={this.props.tabId}
            ref={this.notebookRef}
            notebook={this.props.notebook}
            notebookPath={this.props.notebookPath}
          />
        </div>

        <ColaborationPanel
          colaborationPanelShown={colaborationPanelShown}
          hideColaborationPanel={this.hideColaborationPanel}
        />
      </NotebookTabController.Provider>
    );
  }
}

export const NotebookTabShortcuts: IShortcuts<
  React.RefObject<NotebookTabSkeleton>
> = {
  "ctrl+s": (notebookTabRef: React.RefObject<NotebookTabSkeleton>) =>
    saveAction(notebookTabRef.current!),
  "ctrl+k": (notebookTabRef: React.RefObject<NotebookTabSkeleton>) =>
    notebookTabRef.current!.showColaborationPanel(),
};

export const NotebookTab = UseShortcuts(
  NotebookTabSkeleton,
  // @ts-ignore
  NotebookTabShortcuts
);
