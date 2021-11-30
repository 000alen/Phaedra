import React from "react";
import { v4 as uuidv4 } from "uuid";

import { DefaultButton, MessageBarType } from "@fluentui/react";

import {
  IAppController,
  INotebookController,
  INotebookTabController,
  NotebookController,
  NotebookTabController,
} from "../contexts";
import { INotebook } from "../HOC/UseNotebook/deprecated";
import { saveNotebook } from "../IO/NotebookIO";
import { getStrings } from "../strings";
import { getTheme } from "../themes";
import { Page } from "./Page";

export interface NotebookProps {
  notebook: INotebook;
  notebookPath: string | undefined;
}

export interface NotebookState {
  notebook: INotebook;
  notebookPath: string | undefined;

  saved: boolean;
  notebookController: INotebookController;
}

export class Notebook extends React.Component<NotebookProps, NotebookState> {
  static contextType = NotebookTabController;

  constructor(props: NotebookProps) {
    super(props);

    this.save = this.save.bind(this);
    this.isSaved = this.isSaved.bind(this);
    this.setDirty = this.setDirty.bind(this);

    this.getNotebookPageController = this.getNotebookPageController.bind(this);
    this.getNotebook = this.getNotebook.bind(this);

    const { notebook, notebookPath } = props;

    this.state = {
      notebook: notebook,
      notebookPath: notebookPath,

      saved: true,
      notebookController: {
        save: this.save,
        isSaved: this.isSaved,
        getNotebookPageController: this.getNotebookPageController,
        getNotebook: this.getNotebook,
      },
    };
  }

  componentDidMount() {
    const notebookTabController: INotebookTabController = this.context;
    const appController: IAppController =
      notebookTabController.getAppController()!;
    const tabId = notebookTabController.getTabId()!;
    const { notebook } = this.state;

    appController.tabsManager!.setTitle(tabId, notebook.name);
  }

  async save() {
    const { notebook, notebookPath } = this.state;
    const notebookTabController: INotebookTabController = this.context;
    const appController = notebookTabController.getAppController()!;

    const taskId = uuidv4();
    appController.tasksManager!.add({
      id: taskId,
      name: getStrings().savingNotebookTaskLabel,
    });

    try {
      const finalNotebookPath = await saveNotebook(notebook, notebookPath);
      this.setState(
        {
          notebookPath: finalNotebookPath,
        },
        () => this.setDirty(false)
      );
    } catch (error) {
      appController.messagesManager!.add({
        id: uuidv4(),
        text: getStrings().savingNotebookTaskError,
        type: MessageBarType.error,
      });
    } finally {
      appController.tasksManager!.remove(taskId);
    }
  }

  isSaved(): boolean {
    return this.state.saved;
  }

  setDirty(dirty: boolean, callback?: () => void) {
    const notebookTabController: INotebookTabController = this.context;
    const appController = notebookTabController.getAppController()!;
    const tabId = notebookTabController.getTabId()!;

    appController.tabsManager!.setDirty(tabId, dirty);

    this.setState(
      {
        saved: !dirty,
      },
      callback
    );
  }

  getNotebookPageController() {
    return this.context;
  }

  getNotebook(): INotebook {
    return this.state.notebook;
  }

  render() {
    const { notebookController, notebook } = this.state;

    const containerStyle = {
      backgroundColor: getTheme().palette.neutralLight,
    };

    return (
      <NotebookController.Provider value={notebookController}>
        <div
          className="w-[100%] h-[100%] overflow-y-auto overflow-x-hidden"
          id="notebook"
          style={containerStyle}
        >
          {notebook.pages.map((page) => (
            <Page key={page.id} page={page} />
          ))}
          <DefaultButton text="Add page" />
        </div>
      </NotebookController.Provider>
    );
  }
}
