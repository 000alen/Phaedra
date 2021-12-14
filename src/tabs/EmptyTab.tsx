// TODO: Refactor handling calls

import React from "react";
import { v4 as uuidv4 } from "uuid";

import { CardButton } from "../components/CardButton";
import { AppController, IAppController } from "../contexts";
import { getStrings } from "../i18n/i18n";
import { openFile } from "../Notebook/IO";
import { empty as emptyNotebook } from "../Notebook/UseNotebook";
import { NotebookTab } from "./NotebookTab";

interface EmptyTabState {}

const openIcon = {
  iconName: "OpenFile"
};

const newIcon = {
  iconName: "FileTemplate"
};

export class EmptyTab extends React.Component<TabProps, EmptyTabState> {
  static contextType = AppController;

  constructor(props: TabProps) {
    super(props);

    this.handleOpen = this.handleOpen.bind(this);
    this.handleNew = this.handleNew.bind(this);
  }

  componentDidMount() {
    const { setActiveTabRef } = this.props;
    setActiveTabRef(this);
  }

  componentWillUnmount() {
    const { setActiveTabRef } = this.props;
    setActiveTabRef(undefined);
  }

  handleOpen() {
    const appController: IAppController = this.context;
    const { tabId } = this.props;

    const taskId = uuidv4();
    appController.addTask({
      id: taskId,
      name: getStrings().openingFileTaskLabel
    });

    openFile().then(({ notebook, notebookPath }) => {
      appController.removeTask(taskId);

      if (!notebook) return;

      appController.setTabComponent(tabId, NotebookTab, {
        notebook: notebook,
        notebookPath: notebookPath
      });
    });
  }

  handleNew() {
    const appController: IAppController = this.context;
    const { tabId } = this.props;

    const notebook = emptyNotebook();

    appController.setTabComponent(tabId, NotebookTab, {
      notebook: notebook,
      notebookPath: undefined
    });
  }

  render() {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="flex flex-row space-x-1">
          <CardButton
            iconProps={openIcon}
            title={getStrings().openFileButtonLabel}
            subtitle={getStrings().openFileButtonDescription}
            onClick={this.handleOpen}
          />

          <CardButton
            iconProps={newIcon}
            title={getStrings().createNotebookButtonLabel}
            subtitle={getStrings().createNotebookButtonDescription}
            onClick={this.handleNew}
          />
        </div>
      </div>
    );
  }
}
