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
import { theme } from "../resources/theme";
import {
  historyDo,
  historyRedo,
  historyUndo,
  IHistory,
} from "../structures/HistoryStructure";
import { addMessage, createMessage } from "../structures/MessagesStructure";
import {
  addPlaceholderCellSync,
  collectComplementaryArguments,
  getRedoManipulation,
  INotebook,
  INotebookManipulation,
  INotebookManipulationAction,
  INotebookManipulationArguments,
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
  notebook: INotebook;
  notebookPath: string | undefined;
}

export interface NotebookComponentState {
  notebook: INotebook;
  notebookPath: string | undefined;
  documentPath: string | undefined;
  documentFile: DocumentFile | undefined;

  selected: { [key: string]: string[] };

  editing: boolean;

  history: IHistory;

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

    this.loadDocument = this.loadDocument.bind(this);

    this.save = this.save.bind(this);
    this.isSaved = this.isSaved.bind(this);

    this.getSelected = this.getSelected.bind(this);
    this.selectPage = this.selectPage.bind(this);
    this.selectCell = this.selectCell.bind(this);
    this.deselectPage = this.deselectPage.bind(this);
    this.deselectCell = this.deselectCell.bind(this);
    this.isPageSelected = this.isPageSelected.bind(this);
    this.isCellSelected = this.isCellSelected.bind(this);

    this.enterEditing = this.enterEditing.bind(this);
    this.exitEditing = this.exitEditing.bind(this);
    this.isEditing = this.isEditing.bind(this);

    this.do = this.do.bind(this);
    this.doAsync = this.doAsync.bind(this);
    this.doSync = this.doSync.bind(this);
    this.undo = this.undo.bind(this);
    this.redo = this.redo.bind(this);
    this.redoAsync = this.redoAsync.bind(this);
    this.redoSync = this.redoSync.bind(this);

    this.getNotebookPageController = this.getNotebookPageController.bind(this);
    this.getNotebook = this.getNotebook.bind(this);

    const { notebook, notebookPath } = props;

    this.state = {
      notebook: notebook,
      notebookPath: notebookPath,

      documentPath: notebook.document_path,
      documentFile: undefined,

      selected: {},
      editing: false,

      history: {
        actions: [],
        index: -1,
      },

      saved: true,
      notebookController: {
        save: this.save,
        isSaved: this.isSaved,

        getSelected: this.getSelected,
        selectPage: this.selectPage,
        selectCell: this.selectCell,
        deselectPage: this.deselectPage,
        deselectCell: this.deselectCell,
        isPageSelected: this.isPageSelected,
        isCellSelected: this.isCellSelected,

        enterEditing: this.enterEditing,
        exitEditing: this.exitEditing,
        isEditing: this.isEditing,

        do: this.do,
        undo: this.undo,
        redo: this.redo,

        getNotebookPageController: this.getNotebookPageController,
        getNotebook: this.getNotebook,
      },
    };
  }

  // ! TODO
  componentDidMount() {
    const { documentPath, documentFile, notebook } = this.state;

    if (documentPath && !documentFile) this.loadDocument();

    let unparsedState = window.localStorage.getItem(notebook.name);

    if (unparsedState !== null) {
      let state = JSON.parse(unparsedState);

      if (state.documentPath && state.documentFile) {
        state.documentFile.data = Uint8Array.from(state.documentFile.data);
      }

      this.setState(state);
    }
  }

  // ! TODO
  componentWillUnmount() {
    const { notebook } = this.state;
    let state = { ...this.state };
    window.localStorage.setItem(notebook.name, JSON.stringify(state));
  }

  // ! TODO: Move to NotebookIO
  async loadDocument() {
    const { documentPath } = this.state;
    const notebookPageController: INotebookPageController = this.context;
    const appController = notebookPageController.getAppController();

    const taskId = uuidv4();
    appController!.tasksDo(addTask, {
      task: createTask({ id: taskId, name: strings.loadingDocumentTaskLabel }),
    });

    try {
      const documentContent = await readFileSync(documentPath!);
      const documentFile = {
        url: documentPath!,
        data: documentContent as Uint8Array,
      };
      this.setState((state) => {
        return { ...state, documentFile: documentFile };
      });
    } catch (error) {
      notebookPageController.messagesDo(addMessage, {
        message: createMessage({
          text: strings.documentLoadingError,
          type: MessageBarType.error,
        }),
      });
    } finally {
      appController!.tasksDo(removeTask, { id: taskId });
    }
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

  getSelected(): { [key: string]: string[] } {
    return this.state.selected;
  }

  selectPage(pageId: string) {
    const { selected } = this.state;

    if (pageId in selected) return;

    this.setState((state) => {
      return {
        ...state,
        selected: {
          ...selected,
          [pageId]: [],
        },
      };
    });
  }

  selectCell(pageId: string, cellId: string) {
    const { selected } = this.state;

    if (pageId in selected && selected[pageId].includes(cellId)) return;

    if (pageId in selected) {
      this.setState((state) => {
        return {
          ...state,
          selected: {
            ...selected,
            [pageId]: [...selected[pageId], cellId],
          },
        };
      });
    } else {
      this.setState((state) => {
        return {
          ...state,
          selected: {
            ...selected,
            [pageId]: [cellId],
          },
        };
      });
    }
  }

  deselectPage(pageId: string) {
    const { selected } = this.state;

    if (!(pageId in selected)) return;

    this.setState((state) => {
      delete selected[pageId];
      return {
        ...state,
        selected: selected,
      };
    });
  }

  deselectCell(pageId: string, cellId: string) {
    const { selected } = this.state;

    if (!(pageId in selected)) return;
    if (!selected[pageId].includes(cellId)) return;

    this.setState((state) => {
      return {
        ...state,
        selected: {
          ...selected,
          [pageId]: selected[pageId].filter((id) => id !== cellId),
        },
      };
    });
  }

  isPageSelected(pageId: string): boolean {
    const { selected } = this.state;
    return pageId in selected;
  }

  isCellSelected(pageId: string, cellId: string): boolean {
    const { selected } = this.state;
    if (!(pageId in selected)) return false;
    return selected[pageId].includes(cellId);
  }

  enterEditing() {
    this.setState((state) => {
      return {
        ...state,
        isEditing: true,
      };
    });
  }

  exitEditing() {
    this.setState((state) => {
      return {
        ...state,
        isEditing: false,
      };
    });
  }

  isEditing(): boolean {
    return this.state.editing;
  }

  do<T extends INotebookManipulationArguments>(
    manipulation: INotebookManipulation<T>,
    args: T
  ) {
    if (isAsync({ ...args, name: manipulation.name })) {
      this.doAsync(
        manipulation as INotebookManipulation<INotebookManipulationAsyncArguments>,
        args as INotebookManipulationAsyncArguments
      );
    } else {
      this.doSync(manipulation, args);
    }
  }

  doAsync<T extends INotebookManipulationAsyncArguments>(
    manipulation: INotebookManipulation<T>,
    args: T
  ) {
    const notebookPageController: INotebookPageController = this.context;
    const appController = notebookPageController.getAppController()!;
    const { notebook } = this.state;

    const newArgs = collectComplementaryArguments(notebook, manipulation, args);

    if (!("pageId" in args)) {
      const lastPage = notebook.pages[notebook.pages.length - 1];
      if (lastPage === undefined) throw new Error("No page.");
      newArgs.pageId = lastPage.id;
    }

    let intermediateNotebook = notebook;
    if (!("pageId" in args)) {
      let [_intermediateNotebook, placeholderCellId] = addPlaceholderCellSync(
        notebook,
        {
          pageId: newArgs.pageId,
        }
      );
      intermediateNotebook = _intermediateNotebook;
      newArgs.cellId = placeholderCellId;
    }

    this.setState(
      (state) => {
        return { ...state, notebook: intermediateNotebook };
      },
      async () => {
        const taskId = uuidv4();

        appController.tasksDo(addTask, {
          task: createTask({ id: taskId, name: manipulation.name }),
        });

        try {
          let finalNotebook = await manipulation(notebook, newArgs);
          let { history } = this.state;

          const finalHistory = historyDo(history, {
            manipulationAction: { ...newArgs, name: manipulation.name },
          });

          this.setState((state) => {
            return {
              ...state,
              history: finalHistory,
              notebook: finalNotebook,
              saved: false,
            };
          });
        } catch (error) {
          notebookPageController.messagesDo(addMessage, {
            message: createMessage({
              text: strings.notebookManipulationError,
              type: MessageBarType.error,
            }),
          });
        } finally {
          appController!.tasksDo(removeTask, { id: taskId });
        }
      }
    );
  }

  doSync<T extends INotebookManipulationSyncArguments>(
    manipulation: INotebookManipulation<T>,
    args: T
  ) {
    let { notebook, history } = this.state;

    let newArgs = collectComplementaryArguments(notebook, manipulation, args);

    const finalHistory = historyDo(history, {
      manipulationAction: { ...newArgs, name: manipulation.name },
    });

    const finalNotebook = manipulation(notebook, newArgs);

    this.setState((state) => {
      return {
        ...state,
        history: finalHistory,
        notebook: finalNotebook as INotebook,
        saved: false,
      };
    });
  }

  undo() {
    let { notebook, history } = this.state;

    const [command, newHistory] = historyUndo(history);
    if (command === undefined) return;

    const newNotebook = undo(notebook, command);

    this.setState((state) => {
      return {
        ...state,
        history: newHistory,
        notebook: newNotebook,
        saved: false,
      };
    });
  }

  redo() {
    let { history } = this.state;

    const [command, newHistory] = historyRedo(history);
    if (command === undefined) return;

    if (isAsync(command)) {
      this.redoAsync(command as INotebookManipulationAsyncAction, newHistory);
    } else {
      this.redoSync(command as INotebookManipulationSyncAction, newHistory);
    }
  }

  async redoAsync(
    command: INotebookManipulationAsyncAction,
    history: IHistory
  ) {
    let { notebook } = this.state;
    const notebookPageController: INotebookPageController = this.context;
    const appController = notebookPageController.getAppController();

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

    try {
      const finalNotebook = await redoManipulation(notebook, newCommand);
      this.setState((state) => {
        return {
          ...state,
          history: history,
          notebook: finalNotebook,
          saved: false,
        };
      });
    } catch (error) {
      notebookPageController.messagesDo(addMessage, {
        message: createMessage({
          text: strings.notebookManipulationError,
          type: MessageBarType.error,
        }),
      });
    } finally {
      appController!.tasksDo(removeTask, { id: taskId });
    }
  }

  redoSync(command: INotebookManipulationAction, history: IHistory) {
    let { notebook } = this.state;
    let newNotebook = redo(notebook, command) as INotebook;

    this.setState((state) => {
      return {
        ...state,
        history: history,
        notebook: newNotebook,
        saved: false,
      };
    });
  }

  getNotebookPageController() {
    return this.context;
  }

  getNotebook(): INotebook {
    return this.state.notebook;
  }

  render() {
    const notebookPageController: INotebookPageController = this.context;
    const { notebookController, notebook, documentFile, selected, editing } =
      this.state;

    if (
      Object.keys(selected).length > 0 &&
      !notebookPageController.isCommandBoxShown()
    ) {
      notebookPageController.showCommandBox();
    } else if (
      Object.keys(selected).length === 0 &&
      notebookPageController.isCommandBoxShown()
    ) {
      notebookPageController.hideCommandBox();
    }

    const containerStyle = {
      backgroundColor: theme.palette.neutralLight,
    };

    return (
      <NotebookController.Provider value={notebookController}>
        <div
          className="notebook flex justify-center"
          id="notebook"
          style={containerStyle}
        >
          {notebook.pages.map((page) => (
            <PageComponent
              key={page.id}
              id={page.id}
              data={page.data}
              document={documentFile}
              cells={page.cells}
              selected={selected}
              editing={editing}
            />
          ))}
        </div>
      </NotebookController.Provider>
    );
  }
}
