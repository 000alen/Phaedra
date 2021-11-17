// TODO: Refactor handling calls

import React, { Component } from "react";
import { v4 as uuidv4 } from "uuid";

import { Card } from "../components/Card";
import { AppController, IAppController } from "../contexts/AppController";
import { openFile } from "../IO/NotebookIO";
import { getStrings } from "../resources/strings";
import { createNotebook } from "../structures/NotebookStructure";
import { NotebookTab } from "./NotebookTab";

export interface EmptyTabProps {
  tabId: string;
  tabRef: (ref: any) => void;
}

interface EmptyTabState {}

const openIcon = {
  iconName: "OpenFile",
};

const newIcon = {
  iconName: "FileTemplate",
};

export class EmptyTab extends Component<EmptyTabProps, EmptyTabState> {
  static contextType = AppController;

  constructor(props: EmptyTabProps) {
    super(props);

    this.handleOpen = this.handleOpen.bind(this);
    this.handleNew = this.handleNew.bind(this);
  }

  componentDidMount() {
    const { tabRef } = this.props;
    tabRef(this);
  }

  componentWillUnmount() {
    const { tabRef } = this.props;
    tabRef(undefined);
  }

  handleOpen() {
    const appController: IAppController = this.context;
    const { tabId } = this.props;

    const taskId = uuidv4();
    // appController.addTask({
    //   id: taskId,
    //   name: getStrings().openingFileTaskLabel,
    // });
    appController.tasksManager.add({
      id: taskId,
      name: getStrings().openingFileTaskLabel,
    });

    openFile().then(({ notebook, notebookPath }) => {
      // appController.removeTask(taskId);
      appController.tasksManager.remove(taskId);

      if (!notebook) return;

      // appController.setTabContent(tabId, NotebookTab, {
      //   notebook: notebook,
      //   notebookPath: notebookPath,
      // });
      appController.tabsManager.setComponent(tabId, NotebookTab, {
        notebook: notebook,
        notebookPath: notebookPath,
      });
    });
  }

  handleNew() {
    const appController: IAppController = this.context;
    const { tabId } = this.props;

    const notebook = createNotebook({ name: `Unnamed Notebook ${tabId}` });

    // appController.setTabContent(tabId, NotebookTab, {
    //   notebook: notebook,
    //   notebookPath: undefined,
    // });
    appController.tabsManager.setComponent(tabId, NotebookTab, {
      notebook: notebook,
      notebookPath: undefined,
    });
  }

  render() {
    return (
      <div className="w-[100%] h-[100%] flex items-center justify-center">
        <div className="flex flex-row space-x-1">
          <Card
            iconProps={openIcon}
            title={getStrings().openFileButtonLabel}
            subtitle={getStrings().openFileButtonDescription}
            onClick={this.handleOpen}
          />

          <Card
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