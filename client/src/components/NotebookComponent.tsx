import React, { Component } from "react";
import { v4 as uuidv4 } from "uuid";

import { MessageBarType } from "@fluentui/react";

import {
  INotebookController,
  NotebookController,
} from "../contexts/NotebookController";
import {
  INotebookPageController,
  NotebookPageController,
} from "../contexts/NotebookPageController";
import { saveNotebook } from "../IO/NotebookIO";
import { strings } from "../resources/strings";
import { theme } from "../resources/theme";
import { addMessage, createMessage } from "../structures/MessagesStructure";
import { IBlock, INotebook } from "../structures/NotebookStructure";
import { addTask, createTask, removeTask } from "../structures/TasksStructure";
import PageComponent from "./PageComponent";

// export interface DocumentFile {
//   url: string;
//   data: Uint8Array;
// }

export interface NotebookComponentProps {
  notebook: INotebook;
  notebookPath: string | undefined;
}

export interface NotebookComponentState {
  notebook: INotebook;
  notebookPath: string | undefined;

  saved: boolean;
  notebookController: INotebookController;
}

export default class NotebookComponent extends Component<
  NotebookComponentProps,
  NotebookComponentState
> {
  static contextType = NotebookPageController;

  constructor(props: NotebookComponentProps) {
    super(props);

    this.save = this.save.bind(this);
    this.isSaved = this.isSaved.bind(this);
    this.getNotebookPageController = this.getNotebookPageController.bind(this);
    this.getNotebook = this.getNotebook.bind(this);
    this.onBlocks = this.onBlocks.bind(this);

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

  // TODO: Change the method of persistance
  componentDidMount() {
    const { notebook } = this.state;

    let unparsedState = window.localStorage.getItem(notebook.name);

    if (unparsedState !== null) {
      let state = JSON.parse(unparsedState);
      this.setState(state);
    }
  }

  // TODO: Change the method of persistance
  componentWillUnmount() {
    const { notebook } = this.state;
    let state = { ...this.state };
    window.localStorage.setItem(notebook.name, JSON.stringify(state));
  }

  async save() {
    const { notebook, notebookPath } = this.state;
    const notebookPageController: INotebookPageController = this.context;
    const appController = notebookPageController.getAppController();

    const taskId = uuidv4();
    appController!.tasksDo(addTask, {
      task: createTask({ id: taskId, name: strings.savingNotebookTaskLabel }),
    });

    try {
      const finalNotebookPath = await saveNotebook(notebook, notebookPath);
      this.setState((state) => {
        return {
          ...state,
          notebookPath: finalNotebookPath,
          saved: true,
        };
      });
    } catch (error) {
      notebookPageController.messagesDo(addMessage, {
        message: createMessage({
          text: strings.savingNotebookTaskError,
          type: MessageBarType.error,
        }),
      });
    } finally {
      appController!.tasksDo(removeTask, { id: taskId });
    }
  }

  isSaved(): boolean {
    return this.state.saved;
  }

  getNotebookPageController() {
    return this.context;
  }

  getNotebook(): INotebook {
    return this.state.notebook;
  }

  onBlocks(pageId: string, blocks: IBlock[]) {
    console.log(pageId, blocks);

    const { notebook } = this.state;
    const page = notebook.pages.find((page) => page.id === pageId);

    page!.blocks = blocks;

    this.setState((state) => {
      return {
        ...state,
        notebook: notebook,
        saved: false,
      };
    });
  }

  render() {
    const { notebookController, notebook } = this.state;

    const containerStyle = {
      backgroundColor: theme.palette.neutralLight,
    };

    return (
      <NotebookController.Provider value={notebookController}>
        <div className="notebook" id="notebook" style={containerStyle}>
          {notebook.pages.map((page) => (
            <PageComponent
              key={page.id}
              id={page.id}
              references={page.references}
              data={page.data}
              blocks={page.blocks}
              onBlocks={this.onBlocks}
            />
          ))}
        </div>
      </NotebookController.Provider>
    );
  }
}
