import React from "react";
import {
  AppController,
  IAppController,
  NotebookTabController,
} from "../contexts";
import { INotebook, Notebook } from "../Notebook/Notebook";
import { NotebookManager } from "../Notebook/UseNotebook";

type PresentationTabProps = TabProps & {
  notebook: INotebook;
};

interface PresentationTabState {}

export class PresentationTab extends React.Component<
  PresentationTabProps,
  PresentationTabState
> {
  static contextType = AppController;

  componentDidMount() {
    const appController: IAppController = this.context;
    const { setActiveTabRef, tabId, notebook } = this.props;
    setActiveTabRef(this);

    appController.tabsManager!.setTitle(
      tabId,
      `Presentation: ${notebook.name}`
    );
  }

  componentWillUnmount() {
    const { setActiveTabRef } = this.props;
    setActiveTabRef(undefined);
  }

  render() {
    return (
      <div className="absolute inset-0">
        <Notebook
          notebook={this.props.notebook}
          notebookTabController={{
            isDirty: () => false,
            setDirty: (isDirty: boolean) => {},
            handleDirt: (callback?: () => void) => {},
            getAppController: () => undefined,
            getTabId: () => undefined,
            getNotebookManager: () => undefined,
          }}
        />
      </div>
    );
  }
}
