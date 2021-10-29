import React, { Component } from "react";
import { v4 as uuidv4 } from "uuid";

import { MessageBarType } from "@fluentui/react";

import { readFileSync } from "../../API/ElectronAPI";
import { INotebookPageController } from "../../contexts/INotebookPageController";
import { NotebookController } from "../../contexts/NotebookController";
import { NotebookPageController } from "../../contexts/NotebookPageController";
import { saveNotebook } from "../../IO/NotebookIO";
import { strings } from "../../strings";
import {
  historyDo,
  historyRedo,
  historyUndo,
} from "../../structures/history/HistoryManipulation";
import { IHistoryInformation } from "../../structures/history/IHistoryManipulation";
import { createMessage } from "../../structures/messages/MessagesConstructors";
import { addMessage } from "../../structures/messages/MessagesManipulation";
import {
  INotebook,
  INotebookManipulation,
  INotebookManipulationArguments,
} from "../../structures/notebook/INotebookManipulation";
import {
  addPlaceholderCellSync,
  redo,
  undo,
} from "../../structures/notebook/NotebookManipulation";
import {
  collectComplementaryArguments,
  getRedoManipulation,
  isAsync,
} from "../../structures/notebook/NotebookQueries";
import { createTask } from "../../structures/tasks/TasksConstructors";
import { addTask, removeTask } from "../../structures/tasks/TasksManipulation";
import PageComponent from "../Page/PageComponent";
import {
  NotebookComponentProps,
  NotebookComponentState,
} from "./INotebookComponent";

export default class NotebookComponent extends Component<
  NotebookComponentProps,
  NotebookComponentState
> {
  static contextType = NotebookPageController;

  constructor(props: NotebookComponentProps) {
    super(props);

    this.loadDocument = this.loadDocument.bind(this);
    this.save = this.save.bind(this);

    this.handleSelection = this.handleSelection.bind(this);
    this.toggleEditing = this.toggleEditing.bind(this);

    this.do = this.do.bind(this);
    this.doSync = this.doSync.bind(this);
    this.undo = this.undo.bind(this);
    this.redo = this.redo.bind(this);
    this.getNotebookPageController = this.getNotebookPageController.bind(this);
    this.getActiveCell = this.getActiveCell.bind(this);
    this.getActivePage = this.getActivePage.bind(this);
    this.getNotebook = this.getNotebook.bind(this);

    const { tabId, notebook, notebookPath } = props;

    this.state = {
      tabId: tabId,
      notebook: notebook,
      notebookPath: notebookPath,
      documentPath: notebook.document_path,
      documentFile: undefined,
      activePage: undefined,
      activeCell: undefined,
      editing: false,
      history: [],
      historyIndex: -1,
      isSaved: true,
      notebookController: {
        save: this.save,
        handleSelection: this.handleSelection,
        toggleEditing: this.toggleEditing,
        undo: this.undo,
        redo: this.redo,
        do: this.do,
        doSync: this.doSync,
        getNotebookPageController: this.getNotebookPageController,
        getActiveCell: this.getActiveCell,
        getActivePage: this.getActivePage,
        getNotebook: this.getNotebook,
      },
    };
  }

  componentDidMount() {
    if (this.state.documentPath && !this.state.documentFile)
      this.loadDocument();

    let unparsedState = window.localStorage.getItem(this.state.notebook.name);

    if (unparsedState !== null) {
      let state = JSON.parse(unparsedState);

      if (state.documentPath && state.documentFile) {
        state.documentFile.data = Uint8Array.from(state.documentFile.data);
      }

      this.setState(state);
    }
  }

  componentWillUnmount() {
    let state = { ...this.state };
    window.localStorage.setItem(
      this.state.notebook.name,
      JSON.stringify(state)
    );
  }

  loadDocument() {
    const notebookPageController: INotebookPageController = this.context;
    const appController = notebookPageController.getAppController();

    const taskId = uuidv4();
    appController!.tasksDo(addTask, {
      task: createTask({ id: taskId, name: strings.loadingDocumentTaskLabel }),
    });

    readFileSync(this.state.documentPath!)
      .then((documentContent) => {
        this.setState((state) => {
          const documentFile = {
            url: this.state.documentPath!,
            data: documentContent as Uint8Array,
          };
          return { ...state, documentFile: documentFile };
        });
      })
      .catch((error) => {
        notebookPageController.messagesDo(addMessage, {
          message: createMessage({
            text: strings.documentLoadingError,
            type: MessageBarType.error,
          }),
        });
      })
      .finally(() => {
        appController!.tasksDo(removeTask, { id: taskId });
      });
  }

  save() {
    const notebookPageController: INotebookPageController = this.context;
    const appController = notebookPageController.getAppController();

    const taskId = uuidv4();
    appController!.tasksDo(addTask, {
      task: createTask({ id: taskId, name: strings.savingNotebookTaskLabel }),
    });

    saveNotebook(this.state.notebook, this.state.notebookPath)
      .then((notebookPath) => {
        this.setState((state) => {
          return {
            ...state,
            notebookPath: notebookPath as string,
            isSaved: true,
          };
        });
      })
      .catch((error) => {
        notebookPageController.messagesDo(addMessage, {
          message: createMessage({
            text: strings.savingNotebookTaskError,
            type: MessageBarType.error,
          }),
        });
      })
      .finally(() => {
        appController!.tasksDo(removeTask, { id: taskId });
      });
  }

  handleSelection(pageId: string, cellId: string) {
    if (this.state.activePage === pageId && this.state.activeCell === cellId) {
      this.context.hideCommandBox();
      this.setState((state) => {
        return { ...state, activePage: undefined, activeCell: undefined };
      });
    } else if (
      this.state.activePage === pageId &&
      this.state.activeCell !== cellId
    ) {
      this.context.showCommandBox();
      this.setState((state) => {
        return { ...state, activePage: pageId, activeCell: cellId };
      });
    } else {
      this.context.showCommandBox();
      this.setState((state) => {
        return { ...state, activePage: pageId, activeCell: cellId };
      });
    }
  }

  toggleEditing() {
    this.setState((state) => {
      return {
        ...state,
        editing: !state.editing,
      };
    });
  }

  do(
    manipulation: INotebookManipulation,
    args: INotebookManipulationArguments
  ) {
    const notebookPageController: INotebookPageController = this.context;
    const appController = notebookPageController.getAppController();
    let notebook = this.state.notebook;
    let { pageId, cellId } = args;

    let newArgs = collectComplementaryArguments(notebook, manipulation, args);

    if (pageId === undefined) {
      const lastPage = notebook.pages[notebook.pages.length - 1];
      if (lastPage === undefined) throw new Error("No page.");
      newArgs.pageId = lastPage.id;
    }

    if (cellId === undefined) {
      let [_notebook, id] = addPlaceholderCellSync(notebook, {
        pageId: newArgs.pageId,
      });
      notebook = _notebook;
      newArgs.cellId = id;
    }

    this.setState((state) => {
      return { ...state, notebook: notebook };
    });

    const taskId = uuidv4();
    appController!.tasksDo(addTask, {
      task: createTask({ id: taskId, name: manipulation.name }),
    });

    (manipulation(notebook, newArgs) as Promise<INotebook>)
      .then((_notebook: INotebook) => {
        let { history, historyIndex } = this.state;

        const newHistoryInformation = historyDo(history, historyIndex, {
          command: { ...newArgs, action: manipulation.name },
        });

        this.setState((state) => {
          return {
            ...state,
            ...newHistoryInformation,
            notebook: _notebook,
            isSaved: false,
          };
        });
      })
      .catch((error) => {
        notebookPageController.messagesDo(addMessage, {
          message: createMessage({
            text: strings.notebookManipulationError,
            type: MessageBarType.error,
          }),
        });
      })
      .finally(() => {
        appController!.tasksDo(removeTask, { id: taskId });
      });
  }

  doSync(
    manipulation: INotebookManipulation,
    args: INotebookManipulationArguments
  ) {
    let { notebook, history, historyIndex } = this.state;

    let newArgs = collectComplementaryArguments(notebook, manipulation, args);

    const newHistoryInformation = historyDo(history, historyIndex, {
      command: { ...newArgs, action: manipulation.name },
    });

    const newNotebook = manipulation(notebook, newArgs);

    this.setState((state) => {
      return {
        ...state,
        ...newHistoryInformation,
        notebook: newNotebook as INotebook,
        isSaved: false,
      };
    });
  }

  undo() {
    let { notebook, history, historyIndex } = this.state;
    const [command, newHistoryInformation] = historyUndo(history, historyIndex);
    const newNotebook = undo(notebook, command);

    this.setState((state) => {
      return {
        ...state,
        ...newHistoryInformation,
        notebook: newNotebook,
        isSaved: false,
      };
    });
  }

  redo() {
    let { history, historyIndex } = this.state;
    const [command, historyInformation] = historyRedo(history, historyIndex);

    if (isAsync(command)) {
      this.redoAsync(command, historyInformation);
    } else {
      this.redoSync(command, historyInformation);
    }
  }

  redoSync(
    command: INotebookManipulationArguments,
    historyInformation: IHistoryInformation
  ) {
    let notebook = this.state.notebook;
    let newNotebook = redo(notebook, command) as INotebook;

    this.setState((state) => {
      return {
        ...state,
        ...historyInformation,
        notebook: newNotebook,
        isSaved: false,
      };
    });
  }

  redoAsync(
    command: INotebookManipulationArguments,
    historyInformation: IHistoryInformation
  ) {
    const notebookPageController: INotebookPageController = this.context;
    const appController = notebookPageController.getAppController();

    let notebook = this.state.notebook;

    let { pageId, cellId } = command;

    if (pageId === undefined) {
      const lastPage = notebook.pages[notebook.pages.length - 1];
      if (lastPage === undefined) throw new Error("No page.");
      command.pageId = lastPage.id;
    }

    if (cellId === undefined) {
      let [_notebook, id] = addPlaceholderCellSync(notebook, {
        pageId: command.pageId,
      });
      notebook = _notebook;
      command.cellId = id;
    }

    this.setState((state) => {
      return { ...state, notebook: notebook };
    });

    const taskId = uuidv4();
    appController!.tasksDo(addTask, {
      task: createTask({ id: taskId, name: command.action }),
    });

    let redoManipulation = getRedoManipulation(command);

    (redoManipulation(notebook, command) as Promise<INotebook>)
      .then((_notebook: INotebook) => {
        this.setState((state) => {
          return {
            ...state,
            ...historyInformation,
            notebook: _notebook,
            isSaved: false,
          };
        });
      })
      .catch((error) => {
        notebookPageController.messagesDo(addMessage, {
          message: createMessage({
            text: strings.notebookManipulationError,
            type: MessageBarType.error,
          }),
        });
      })
      .finally(() => {
        appController!.tasksDo(removeTask, { id: taskId });
      });
  }

  getNotebookPageController() {
    return this.context;
  }

  getActiveCell(): string | undefined {
    return this.state.activeCell;
  }

  getActivePage(): string | undefined {
    return this.state.activePage;
  }

  getNotebook(): INotebook {
    return this.state.notebook;
  }

  render() {
    return (
      <NotebookController.Provider value={this.state.notebookController}>
        <div className="notebook" id="notebook">
          {this.state.notebook.pages.map((page) => (
            <PageComponent
              key={page.id}
              id={page.id}
              data={page.data}
              document={this.state.documentFile}
              cells={page.cells}
              active={this.state.activePage === page.id}
              activeCell={this.state.activeCell}
              editing={this.state.editing}
            />
          ))}
        </div>
      </NotebookController.Provider>
    );
  }
}
