import React, { Component } from "react";
import { v4 as uuidv4 } from "uuid";

import { MessageBarType } from "@fluentui/react";

import { readFileSync } from "../../API/ElectronAPI";
import { INotebookPageController } from "../../contexts/INotebookPageController";
import { NotebookController } from "../../contexts/NotebookController";
import { NotebookPageController } from "../../contexts/NotebookPageController";
import { saveNotebook } from "../../IO/NotebookIO";
import {
  historyDo,
  historyRedo,
  historyUndo,
} from "../../manipulation/HistoryManipulation";
import { IHistoryInformation } from "../../manipulation/IHistoryManipulation";
import {
  INotebook,
  INotebookCommand,
  INotebookManipulation,
} from "../../manipulation/INotebookManipulation";
import {
  addMessage,
  createMessage,
} from "../../manipulation/MessagesManipulation";
import {
  addAntonymCell,
  addEntitiesCell,
  addGenerateCell,
  addMeaningCell,
  addPlaceholderCell,
  addQuestionCell,
  addSparseQuestionCell,
  addSynonymCell,
  addWikipediaImageCell,
  addWikipediaSuggestionsCell,
  addWikipediaSummaryCell,
  getCell,
  getCellContent,
  getCellData,
  getPage,
  indexCell,
  indexPage,
  redo,
  undo,
} from "../../manipulation/NotebookManipulation";
import {
  addTask,
  createTask,
  removeTask,
} from "../../manipulation/TasksManipulation";
import {
  NotebookComponentProps,
  NotebookComponentState,
} from "./INotebookComponent";
import PageComponent from "./PageComponent";

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
    this.wrapDo = this.wrapDo.bind(this);
    this.handleDo = this.handleDo.bind(this);
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
      task: createTask({ id: taskId, name: "Loading document" }),
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
          message: createMessage({ text: "error", type: MessageBarType.error }),
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
      task: createTask({ id: taskId, name: "Loading document" }),
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
            text: "Could not save file",
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

  do(manipulation: INotebookManipulation, args: INotebookCommand) {
    let notebook = this.state.notebook;
    switch (manipulation.name) {
      case "removePage":
        const page = getPage(notebook, { pageId: args.pageId });
        const pageIndex = indexPage(notebook, {
          pageId: args.pageId,
        });
        args = { ...args, page: page, pageIndex: pageIndex };
        break;
      case "removeCell":
        const cell = getCell(notebook, {
          pageId: args.pageId,
          cellId: args.cellId,
        });
        const cellIndex = indexCell(notebook, {
          pageId: args.pageId,
          cellId: args.cellId,
        });
        args = { ...args, cell: cell, cellIndex: cellIndex };
        break;
      case "setCellContent":
        const previousContent = getCellContent(notebook, {
          pageId: args.pageId,
          cellId: args.cellId,
        });
        args = { ...args, previousContent: previousContent };
        break;
      case "setCellData":
        const previousData = getCellData(notebook, {
          pageId: args.pageId,
          cellId: args.cellId,
        });
        args = { ...args, previousData: previousData };
        break;
      default:
        break;
    }

    switch (manipulation.name) {
      case "addEntitiesCell":
      case "addQuestionCell":
      case "addSparseQuestionCell":
      case "addGenerateCell":
      case "addWikipediaSummaryCell":
      case "addWikipediaSuggestionsCell":
      case "addWikipediaImageCell":
      case "addMeaningCell":
      case "addSynonymCell":
      case "addAntonymCell":
        this.wrapDo(manipulation, args);
        break;
      default:
        this.handleDo(
          manipulation,
          args,
          manipulation(notebook, args) as INotebook
        );
        break;
    }
  }

  wrapDo(manipulation: INotebookManipulation, args: INotebookCommand) {
    const notebookPageController: INotebookPageController = this.context;
    const appController = notebookPageController.getAppController();

    let notebook = this.state.notebook;

    let { pageId, cellId } = args;

    if (pageId === undefined) {
      const lastPage = notebook.pages[notebook.pages.length - 1];
      if (lastPage === undefined) throw new Error("No page.");
      args.pageId = lastPage.id;
    }

    if (cellId === undefined) {
      let [_notebook, id] = addPlaceholderCell(notebook, {
        pageId: args.pageId,
      });
      notebook = _notebook;
      args.cellId = id;
    }

    this.setState((state) => {
      return { ...state, notebook: notebook };
    });

    const taskId = uuidv4();
    appController!.tasksDo(addTask, {
      task: createTask({ id: taskId, name: manipulation.name }),
    });

    (manipulation(notebook, args) as Promise<INotebook>)
      .then((_notebook: INotebook) => {
        this.handleDo(manipulation, args, _notebook);
      })
      .catch((error) => {
        notebookPageController.messagesDo(addMessage, {
          message: createMessage({ text: "error", type: MessageBarType.error }),
        });
      })
      .finally(() => {
        appController!.tasksDo(removeTask, { id: taskId });
      });
  }

  handleDo(
    manipulation: INotebookManipulation,
    args: INotebookCommand,
    notebook: INotebook
  ) {
    let { history, historyIndex } = this.state;

    const newHistoryInformation = historyDo(history, historyIndex, {
      command: { ...args, action: manipulation.name },
    });

    this.setState((state) => {
      return {
        ...state,
        ...newHistoryInformation,
        notebook: notebook,
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
    let { notebook, history, historyIndex } = this.state;
    const [command, newHistoryInformation] = historyRedo(history, historyIndex);

    switch (command.action) {
      case "addEntitiesCell":
      case "addQuestionCell":
      case "addSparseQuestionCell":
      case "addGenerateCell":
      case "addWikipediaSummaryCell":
      case "addWikipediaSuggestionsCell":
      case "addWikipediaImageCell":
      case "addMeaningCell":
      case "addSynonymCell":
      case "addAntonymCell":
        this.wrapRedo(command, newHistoryInformation);
        break;
      default:
        this.handleRedo(
          newHistoryInformation,
          redo(notebook, command) as INotebook
        );
        break;
    }
  }

  // TODO
  wrapRedo(command: INotebookCommand, historyInformation: IHistoryInformation) {
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
      let [_notebook, id] = addPlaceholderCell(notebook, {
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

    let manipulation: INotebookManipulation;
    switch (command.action) {
      case "addEntitiesCell":
        manipulation = addEntitiesCell;
        break;
      case "addQuestionCell":
        manipulation = addQuestionCell;
        break;
      case "addSparseQuestionCell":
        manipulation = addSparseQuestionCell;
        break;
      case "addGenerateCell":
        manipulation = addGenerateCell;
        break;
      case "addWikipediaSummaryCell":
        manipulation = addWikipediaSummaryCell;
        break;
      case "addWikipediaSuggestionsCell":
        manipulation = addWikipediaSuggestionsCell;
        break;
      case "addWikipediaImageCell":
        manipulation = addWikipediaImageCell;
        break;
      case "addMeaningCell":
        manipulation = addMeaningCell;
        break;
      case "addSynonymCell":
        manipulation = addSynonymCell;
        break;
      case "addAntonymCell":
        manipulation = addAntonymCell;
        break;
      default:
        throw new Error("Invalid action.");
    }

    (manipulation(notebook, command) as Promise<INotebook>)
      .then((_notebook: INotebook) => {
        this.handleRedo(historyInformation, _notebook);
      })
      .catch((error) => {
        notebookPageController.messagesDo(addMessage, {
          message: createMessage({ text: "error", type: MessageBarType.error }),
        });
      })
      .finally(() => {
        appController!.tasksDo(removeTask, { id: taskId });
      });
  }

  handleRedo(historyInformation: IHistoryInformation, notebook: INotebook) {
    this.setState((state) => {
      return {
        ...state,
        ...historyInformation,
        notebook: notebook,
        isSaved: false,
      };
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
