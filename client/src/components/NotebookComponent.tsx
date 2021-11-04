import React, { Component } from "react";
import { v4 as uuidv4 } from "uuid";

import { MessageBarType } from "@fluentui/react";

import { readFileSync } from "../API/ElectronAPI";
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
import {
  historyDo,
  historyRedo,
  historyUndo,
  IHistoryInformation,
} from "../structures/HistoryStructure";
import { addMessage, createMessage } from "../structures/MessagesStructure";
import {
  addPlaceholderCellSync,
  collectComplementaryArguments,
  getRedoManipulation,
  INotebook,
  INotebookManipulation,
  INotebookManipulationAction,
  INotebookManipulationAsyncAction,
  INotebookManipulationAsyncArguments,
  INotebookManipulationSyncAction,
  INotebookManipulationSyncArguments,
  isAsync,
  redo,
  undo,
} from "../structures/NotebookStructure";
import { addTask, createTask, removeTask } from "../structures/TasksStructure";
import PageComponent from "./PageComponent";

export interface DocumentFile {
  url: string;
  data: Uint8Array;
}

export interface NotebookComponentProps {
  tabId: string;
  notebook: INotebook;
  notebookPath: string | undefined;
}

export interface NotebookComponentState {
  tabId: string;
  notebook: INotebook;
  notebookPath: string | undefined;
  documentPath: string | undefined;
  documentFile: DocumentFile | undefined;
  activePage: string | undefined;
  activeCell: string | undefined;
  editing: boolean;
  history: any; // XXX
  historyIndex: number;
  isSaved: boolean;
  notebookController: INotebookController;
}

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
    this.getActive = this.getActive.bind(this);
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
        getActive: this.getActive,
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

  do<T extends INotebookManipulationAsyncArguments>(
    manipulation: INotebookManipulation<T>,
    args: T
  ) {
    const notebookPageController: INotebookPageController = this.context;
    const appController = notebookPageController.getAppController();
    let notebook = this.state.notebook;

    let newArgs = collectComplementaryArguments(notebook, manipulation, args);

    if (!("pageId" in args)) {
      const lastPage = notebook.pages[notebook.pages.length - 1];
      if (lastPage === undefined) throw new Error("No page.");
      newArgs.pageId = lastPage.id;
    }

    if (!("pageId" in args)) {
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
          command: { ...newArgs, name: manipulation.name },
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

  doSync<T extends INotebookManipulationSyncArguments>(
    manipulation: INotebookManipulation<T>,
    args: T
  ) {
    let { notebook, history, historyIndex } = this.state;

    let newArgs = collectComplementaryArguments(notebook, manipulation, args);

    const newHistoryInformation = historyDo(history, historyIndex, {
      command: { ...newArgs, name: manipulation.name },
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
    if (command === undefined) return;

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
    if (command === undefined) return;

    if (isAsync(command)) {
      this.redoAsync(
        command as INotebookManipulationAsyncAction,
        historyInformation
      );
    } else {
      this.redoSync(
        command as INotebookManipulationSyncAction,
        historyInformation
      );
    }
  }

  redoSync(
    command: INotebookManipulationAction,
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
    command: INotebookManipulationAsyncAction,
    historyInformation: IHistoryInformation
  ) {
    const notebookPageController: INotebookPageController = this.context;
    const appController = notebookPageController.getAppController();

    let notebook = this.state.notebook;

    let newCommand = { ...command };

    if (!("pageId" in command)) {
      const lastPage = notebook.pages[notebook.pages.length - 1];
      if (lastPage === undefined) throw new Error("No page.");
      newCommand.pageId = lastPage.id;
    }

    if (!("cellId" in command)) {
      let [_notebook, id] = addPlaceholderCellSync(notebook, {
        pageId: newCommand.pageId,
      });
      notebook = _notebook;
      newCommand.cellId = id;
    }

    this.setState((state) => {
      return { ...state, notebook: notebook };
    });

    const taskId = uuidv4();
    appController!.tasksDo(addTask, {
      task: createTask({ id: taskId, name: newCommand.name }),
    });

    let redoManipulation = getRedoManipulation(newCommand);

    (redoManipulation(notebook, newCommand) as Promise<INotebook>)
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

  getActive(): [string | undefined, string | undefined] {
    return [this.state.activePage, this.state.activeCell];
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
