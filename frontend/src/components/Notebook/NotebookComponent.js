import React, { Component } from "react";

import { readFile } from "../../API/ElectronAPI";

import PageComponent from "./PageComponent";

import {
  historyDo,
  historyRedo,
  historyUndo,
} from "../../manipulation/HistoryManipulation";
import {
  undo,
  redo,
  getPage,
  indexPage,
  getCell,
  indexCell,
  getCellContent,
  getCellData,
  addCell,
  createCell,
  addPlaceholderCell,
} from "../../manipulation/NotebookManipulation";

import { saveNotebook } from "../../NotebookIO";
import { v4 as uuidv4 } from "uuid";

/**
 * @typedef {import("../../App").AppController} AppController
 */

/**
 * @typedef {import("../../pages/NotebookPage/NotebookPage").NotebookPageController} NotebookPageController
 */

/**
 * @typedef {import("../../manipulation/NotebookManipulation").Notebook} Notebook
 */

/**
 * @typedef {import("../../manipulation/NotebookManipulation").Command} Command
 */

/**
 * @typedef {Object} NotebookController
 * @property {Function} save
 * @property {Function} handleSelection
 * @property {Function} toggleEditing
 * @property {Function} undo
 * @property {Function} redo
 * @property {Function} do
 */

/**
 * @typedef {Object} NotebookState
 * @property {string} tabId
 * @property {AppController} appController
 * @property {NotebookPageController} pageController
 * @property {NotebookController} notebookController
 * @property {React.RefObject | undefined} statusBarRef
 * @property {Notebook} notebook
 * @property {string | undefined} notebookPath
 * @property {string | undefined} documentPath
 * @property {any | undefined} documentFile
 * @property {string | undefined} activePage
 * @property {string | undefined} activeCell
 * @property {boolean} editing
 * @property {Command[]} history
 * @property {number} historyIndex
 * @property {boolean} isSaved
 */

export default class NotebookComponent extends Component {
  constructor(props) {
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

    const { tabId, appController, pageController, statusBarRef } = props;
    const { notebook, notebookPath } = props;

    /**
     * @type {NotebookController}
     */
    const notebookController = {
      save: this.save,
      handleSelection: this.handleSelection,
      toggleEditing: this.toggleEditing,

      undo: this.undo,
      redo: this.redo,
      do: this.do,
    };

    /**
     * @type {NotebookState}
     */
    this.state = {
      tabId: tabId,
      appController: appController,
      pageController: pageController,
      notebookController: notebookController,
      statusBarRef: statusBarRef,
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
    };
  }

  componentDidMount() {
    if (this.state.documentPath && !this.state.documentFile)
      this.loadDocument();

    let unparsedState = window.localStorage.getItem(this.state.notebook.name);

    if (unparsedState !== null) {
      let state = JSON.parse(unparsedState);
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
    state.statusBarRef = undefined;
    window.localStorage.setItem(
      this.state.notebook.name,
      JSON.stringify(state)
    );
  }

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

  save() {
    saveNotebook(this.state.notebook, this.state.notebookPath).then(
      (notebookPath) => {
        this.setState((state) => {
          return { ...state, notebookPath: notebookPath, isSaved: true };
        });
      }
    );
  }

  /**
   *
   * @param {string} pageId
   * @param {string} cellId
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
   * @param {Function} action
   * @param {Object} args
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
        this.wrapDo(action, args);
        break;
      default:
        this.handleDo(action, args, action(notebook, args));
        break;
    }
  }

  wrapDo(action, args) {
    if (this.state.statusBarRef === undefined)
      throw new Error("StatusBarRef is undefined.");

    const { statusBarController } = this.state.statusBarRef.current.state;

    let notebook = this.state.notebook;

    let { pageId, cellId } = args;

    if (pageId === undefined) {
      const lastPage = notebook.pages.at(-1);
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

    statusBarController.showLoading();
    action(notebook, args).then((_notebook) => {
      statusBarController.hideLoading();
      this.handleDo(action, args, _notebook);
    });
  }

  handleDo(action, args, notebook) {
    let { history, historyIndex } = this.state;

    const newHistoryInformation = historyDo(history, historyIndex, {
      ...args,
      action: action.name,
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
    const newNotebook = redo(notebook, command);

    this.setState((state) => {
      return {
        ...state,
        ...newHistoryInformation,
        notebook: newNotebook,
        isSaved: false,
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
