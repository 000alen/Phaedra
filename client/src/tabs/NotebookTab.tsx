import React from "react";
import { v4 as uuidv4 } from "uuid";

import {
  DefaultButton,
  DialogFooter,
  DialogType,
  PrimaryButton,
} from "@fluentui/react";

import { saveAction } from "../actions";
import { ContentTable } from "../components/ContentTable";
import { Notebook } from "../components/Notebook";
import {
  AppController,
  IAppController,
  INotebookController,
  INotebookTabController,
  NotebookTabController,
} from "../contexts";
import { INotebook } from "../HOC/UseNotebook/deprecated";
import { IShortcut, UseShortcuts } from "../HOC/UseShortcuts";

export interface NotebookTabProps {
  tabId: string;
  tabRef: (ref: any) => void;
  notebook: INotebook;
  notebookPath?: string | undefined;
}

export interface NotebookTabState {
  contentTableShown: boolean;
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

    this.notebookRef = React.createRef();

    this.state = {
      contentTableShown: false,
      notebookTabController: {
        getAppController: this.getAppController,
        getNotebookController: this.getNotebookController,
        getTabId: this.getTabId,
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

  showContentTable(): void {
    this.setState({ contentTableShown: true });
  }

  hideContentTable(): void {
    this.setState({ contentTableShown: false });
  }

  isContentTableShown(): boolean {
    return this.state.contentTableShown;
  }

  getTabId(): string {
    return this.props.tabId;
  }

  handleDirt() {
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
                this.getNotebookController()
                  .save()
                  .then(() => {
                    appController.tabsManager!.remove(this.getTabId());
                  });
              });
            }}
          />
        </DialogFooter>
      ),
    });
  }

  render(): JSX.Element {
    const { notebookTabController, contentTableShown } = this.state;

    return (
      <NotebookTabController.Provider value={notebookTabController}>
        <div className="w-[100%] h-[100%]">
          <div className="flex flex-row h-[100%]">
            {contentTableShown && <ContentTable />}
            <Notebook
              key={this.props.tabId}
              ref={this.notebookRef}
              notebook={this.props.notebook}
              notebookPath={this.props.notebookPath}
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
