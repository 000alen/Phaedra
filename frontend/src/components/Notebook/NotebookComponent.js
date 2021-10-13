import React, { Component } from "react";
import { saveNotebook } from "../../NotebookIO";
import {
  undo,
  redo,
  getPage,
  indexPage,
  getCell,
  indexCell,
  getCellContent,
  getCellData,
} from "../../NotebookManipulation";
import { readFile } from "../../ElectronAPI";
import PageComponent from "./PageComponent";

export default class NotebookComponent extends Component {
  constructor(props) {
    super(props);

    this.loadDocument = this.loadDocument.bind(this);
    this.save = this.save.bind(this);

    this.handleSelection = this.handleSelection.bind(this);
    this.toggleEditing = this.toggleEditing.bind(this);

    this.historyDo = this.historyDo.bind(this);
    this.historyUndo = this.historyUndo.bind(this);
    this.historyRedo = this.historyRedo.bind(this);

    this.do = this.do.bind(this);
    this.undo = this.undo.bind(this);
    this.redo = this.redo.bind(this);

    const { tabId, appController, pageController, statusBarRef } = props;
    const { notebook, notebookPath } = props;

    const notebookController = {
      save: this.save,
      handleSelection: this.handleSelection,
      toggleEditing: this.toggleEditing,

      undo: this.undo,
      redo: this.redo,
      do: this.do,
    };

    this.state = {
      tabId: tabId,
      appController: appController,
      pageController: pageController,
      notebookController: notebookController,
      statusBarRef: statusBarRef,
      notebook: notebook,
      notebookPath: notebookPath,
      documentPath: notebook.document_path,
      documentFile: null,
      activePage: null,
      activeCell: null,
      editing: false,
      history: [],
      historyIndex: -1,
    };
  }

  componentDidMount() {
    if (this.state.documentPath && !this.state.documentFile)
      this.loadDocument();

    let state = JSON.parse(
      window.localStorage.getItem(this.state.notebook.name)
    );

    if (state !== null) {
      state.appController = this.state.appController;
      state.pageController = this.state.pageController;
      state.notebookController = this.state.notebookController;
      state.statusBarRef = this.state.statusBarRef;

      if (state.documentPath && state.documentFile) {
        state.documentFile.data = Uint8Array.from(state.documentFile.data);
      }

      this.setState(state);
    }
  }

  componentWillUnmount() {
    let state = { ...this.state };
    state.statusBarRef = null;
    window.localStorage.setItem(
      this.state.notebook.name,
      JSON.stringify(state)
    );
  }

  /**
   *
   */
  loadDocument() {
    readFile(this.state.documentPath).then((documentContent) => {
      this.setState((state) => {
        const documentFile = {
          url: this.state.documentPath,
          data: documentContent,
        };
        return { ...state, documentFile: documentFile };
      });
    });
  }

  /**
   *
   */
  save() {
    saveNotebook(this.state.notebook, this.state.notebookPath).then(
      (notebookPath) => {
        this.setState((state) => {
          return { ...state, notebookPath: notebookPath };
        });
      }
    );
  }

  /**
   *
   * @param {*} pageId
   * @param {*} cellId
   */
  handleSelection(pageId, cellId) {
    if (this.state.activePage === pageId && this.state.activeCell === cellId) {
      this.state.pageController.hideCommandBox();
      this.setState((state) => {
        return { ...state, activePage: null, activeCell: null };
      });
    } else if (
      this.state.activePage === pageId &&
      this.state.activeCell !== cellId
    ) {
      this.state.pageController.showCommandBox();
      this.setState((state) => {
        return { ...state, activePage: pageId, activeCell: cellId };
      });
    } else {
      this.state.pageController.showCommandBox();
      this.setState((state) => {
        return { ...state, activePage: pageId, activeCell: cellId };
      });
    }
  }

  /**
   *
   */
  toggleEditing() {
    this.setState((state) => {
      return {
        ...state,
        editing: !state.editing,
      };
    });
  }

  /**
   *
   * @param {*} command
   * @returns
   */
  historyDo(command) {
    let history = [...this.state.history];
    let historyIndex = this.state.historyIndex;

    if (historyIndex === history.length - 1) {
      history.push(command);
    } else {
      history.splice(historyIndex, history.length - historyIndex, command);
    }

    historyIndex++;

    return {
      history: history,
      historyIndex: historyIndex,
    };
  }

  /**
   *
   * @returns
   */
  historyUndo() {
    let history = [...this.state.history];
    let historyIndex = this.state.historyIndex;
    let command = history[historyIndex];

    historyIndex--;

    return [command, { history: history, historyIndex: historyIndex }];
  }

  /**
   *
   * @returns
   */
  historyRedo() {
    let history = [...this.state.history];
    let historyIndex = this.state.historyIndex;
    let command = history[historyIndex];

    historyIndex++;

    return [command, { history: history, historyIndex: historyIndex }];
  }

  /**
   *
   * @param {*} action
   * @param {*} args
   */
  do(action, args) {
    let notebook = this.state.notebook;
    switch (action.name) {
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
    }

    switch (action.name) {
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
        const { statusBarController } = this.state.statusBarRef.current.state;
        statusBarController.showLoading();
        action(notebook, args).then((_notebook) => {
          statusBarController.hideLoading();
          // XXX
          args = { ...args, cellId: undefined };
          notebook = _notebook;
        });
        break;
      default:
        notebook = action(notebook, args);
        break;
    }

    const history = this.historyDo({
      ...args,
      action: action.name,
    });

    this.setState((state) => {
      return {
        ...state,
        ...history,
        notebook: notebook,
      };
    });
  }

  /**
   *
   */
  undo() {
    const [command, history] = this.historyUndo();
    const notebook = undo(notebook, command);

    this.setState((state) => {
      return {
        ...state,
        ...history,
        notebook: notebook,
      };
    });
  }

  /**
   *
   */
  redo() {
    const [command, history] = this.historyRedo();
    const notebook = redo(notebook, command);

    this.setState((state) => {
      return {
        ...state,
        ...history,
        notebook: notebook,
      };
    });
  }

  render() {
    return (
      <div className="notebook" id="notebook">
        {this.state.notebook.pages.map((page) => (
          <PageComponent
            key={page.id}
            id={page.id}
            pageController={this.state.pageController}
            notebookController={this.state.notebookController}
            data={page.data}
            document={this.state.documentFile}
            cells={page.cells}
            active={this.state.activePage === page.id}
            activeCell={this.state.activeCell}
            editing={this.state.editing}
          />
        ))}
      </div>
    );
  }
}
