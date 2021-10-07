import React, { Component } from 'react';
import {
    addEntitiesCell,
    addQuestionCell,
    addSparseQuestionCell,
    addGenerateCell,
    addWikipediaSummaryCell,
    addWikipediaSuggestionsCell,
    addWikipediaImageCell,
    addMeaningCell,
    addSynonymCell,
    addAntonymCell,
} from '../../API';
import { readFile, writeFile, saveDialog } from '../../ElectronAPI';
import Page from './Page';
import { v4 as uuidv4 } from 'uuid';

export function createNotebook({ id, name, document_path, pages }) {
    if (!id) id = uuidv4();
    if (!name) name = "Untitled";
    if (!document_path) document_path = null;
    if (!pages) pages = [
        {
            id: uuidv4(),
            data: {},
            cells: []
        }
    ];

    return {
        id: id,
        name: name,
        document_path: document_path,
        pages: pages
    }
}

class Notebook extends Component {
    constructor(props) {
        super(props);

        this.loadDocument = this.loadDocument.bind(this);

        this.handleSelection = this.handleSelection.bind(this);

        this.insertPage = this.insertPage.bind(this);
        this.addPage = this.addPage.bind(this);
        this.indexPage = this.indexPage.bind(this);
        this.getPage = this.getPage.bind(this);
        this.removePage = this.removePage.bind(this);

        this.insertCell = this.insertCell.bind(this);
        this.addCell = this.addCell.bind(this);
        this.indexCell = this.indexCell.bind(this);
        this.getCell = this.getCell.bind(this);
        this.removeCell = this.removeCell.bind(this);

        this.addEntitiesCell = this.addEntitiesCell.bind(this);
        this.addQuestionCell = this.addQuestionCell.bind(this);
        this.addSparseQuestionCell = this.addSparseQuestionCell.bind(this);
        this.addGenerateCell = this.addGenerateCell.bind(this);
        this.addWikipediaSummaryCell = this.addWikipediaSummaryCell.bind(this);
        this.addWikipediaSuggestionsCell = this.addWikipediaSuggestionsCell.bind(this);
        this.addWikipediaImageCell = this.addWikipediaImageCell.bind(this);

        this.addMeaningCell = this.addMeaningCell.bind(this);
        this.addSynonymCell = this.addSynonymCell.bind(this);
        this.addAntonymCell = this.addAntonymCell.bind(this);

        this.save = this.save.bind(this);

        this.toggleEditing = this.toggleEditing.bind(this);

        this.setCellContent = this.setCellContent.bind(this);
        this.setCellData = this.setCellData.bind(this);

        this.undo = this.undo.bind(this);
        this.redo = this.redo.bind(this);

        const { tabId, appController, pageController } = props;
        const { notebook, notebookPath } = props;

        const notebookController = {
            handleSelection: this.handleSelection,
            insertPage: this.insertPage,
            addPage: this.addPage,
            indexPage: this.indexPage,
            getPage: this.getPage,
            removePage: this.removePage,
            insertCell: this.insertCell,
            addCell: this.addCell,
            indexCell: this.indexCell,
            getCell: this.getCell,
            removeCell: this.removeCell,
            addEntitiesCell: this.addEntitiesCell,
            addQuestionCell: this.addQuestionCell,
            addSparseQuestionCell: this.addSparseQuestionCell,
            addGenerateCell: this.addGenerateCell,
            addWikipediaSummaryCell: this.addWikipediaSummaryCell,
            addWikipediaSuggestionsCell: this.addWikipediaSuggestionsCell,
            addWikipediaImageCell: this.addWikipediaImageCell,
            addMeaningCell: this.addMeaningCell,
            addSynonymCell: this.addSynonymCell,
            addAntonymCell: this.addAntonymCell,
            save: this.save,
            toggleEditing: this.toggleEditing,
            setCellContent: this.setCellContent,
            setCellData: this.setCellData,
            undo: this.undo,
            redo: this.redo
        };

        this.state = {
            tabId: tabId,
            appController: appController,
            pageController: pageController,
            notebookController: notebookController,
            notebook: notebook,
            notebookPath: notebookPath,
            documentPath: notebook.document_path,
            documentFile: null,
            activePage: null,
            activeCell: null,
            editing: false,
            history: [],
            historyPointer: -1,
        };
    }

    componentDidMount() {
        if (this.state.documentPath && !this.state.documentFile) this.loadDocument();

        let state = JSON.parse(window.localStorage.getItem(this.state.notebook.name));

        if (state !== null) {
            state.appController = this.state.appController;
            state.pageController = this.state.pageController;
            state.notebookController = this.state.notebookController;

            if (state.documentPath && state.documentFile) {
                state.documentFile.data = Uint8Array.from(state.documentFile.data);
            }

            this.setState(state);
        }
    }

    componentWillUnmount() {
        window.localStorage.setItem(this.state.notebook.name, JSON.stringify(this.state));
    }

    loadDocument() {
        readFile(this.state.documentPath).then((documentContent) => {
            this.setState((state) => {
                const documentFile = { url: this.state.documentPath, data: documentContent };
                return { ...state, documentFile: documentFile };
            });
        })
    }

    handleSelection(pageId, cellId) {
        if (this.state.activePage === pageId && this.state.activeCell === cellId) {
            this.state.pageController.hideCommandBox();
            this.setState((state) => {
                return { ...state, activePage: null, activeCell: null };
            });
        } else if (this.state.activePage === pageId && this.state.activeCell !== cellId) {
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

    insertPage(page, index, operation) {
        if (operation === undefined) operation = "do";

        let notebook = { ...this.state.notebook };
        notebook.pages.splice(index, 0, page);

        let history = this.handleHistory({
            command: 'insertPage',
            page: page,
            index: index
        }, operation);

        this.setState((state) => {
            return {
                ...state,
                ...history,
                notebook: notebook,
            };
        });
    }

    addPage(page, operation) {
        if (operation === undefined) operation = "do";

        let notebook = { ...this.state.notebook };
        notebook.pages.push(page);

        let history = this.handleHistory({
            command: 'addPage',
            page: page
        }, operation);

        this.setState((state) => {
            return {
                ...state,
                ...history,
                notebook: notebook,
            };
        });
    }

    indexPage(pageId) {
        return this.state.notebook.pages.findIndex((page) => {
            return page.id === pageId;
        });
    }

    getPage(pageId) {
        return this.state.notebook.pages.find(page => page.id === pageId);
    }

    removePage(pageId, operation) {
        if (operation === undefined) operation = "do";
        
        let notebook = { ...this.state.notebook };
        notebook.pages = notebook.pages.filter(page => page.id !== pageId);

        const page = this.getPage(pageId);
        const pageIndex = this.indexPage(pageId);
        let history = this.handleHistory({
            command: 'removePage',
            pageId: pageId,
            page: page,
            pageIndex: pageIndex
        }, operation);

        this.setState((state) => {
            return {
                ...state,
                ...history,
                notebook: notebook,
            };
        });
    }

    insertCell(pageId, cell, index, operation) {
        if (operation === undefined) operation = "do";

        let notebook = { ...this.state.notebook };
        notebook.pages[this.indexPage(pageId)].cells.splice(index, 0, cell);

        let history = this.handleHistory({
            command: 'insertCell',
            pageId: pageId,
            cell: cell,
            cellIndex: index,
        }, operation);

        this.setState((state) => {
            return {
                ...state,
                ...history,
                notebook: notebook,
            };
        });
    }

    addCell(pageId, cell, operation) {
        if (operation === undefined) operation = "do";
        
        let notebook = { ...this.state.notebook };
        notebook.pages[this.indexPage(pageId)].cells.push(cell);

        let history = this.handleHistory({
            command: 'addCell',
            pageId: pageId,
            cell: cell,
        }, operation);

        this.setState((state) => {
            return {
                ...state,
                ...history,
                notebook: notebook
            };
        });
    }

    indexCell(pageId, cellId) {
        return this.getPage(pageId).cells.findIndex((cell) => {
            return cell.id === cellId;
        });
    }

    getCell(pageId, cellId) {
        return this.state.notebook.pages.find(page => page.id === pageId).cells.find(cell => cell.id === cellId);
    }

    removeCell(pageId, cellId, operation) {
        if (operation === undefined) operation = "do";
        
        const pageIndex = this.indexPage(pageId);
        let notebook = { ...this.state.notebook };
        notebook.pages[pageIndex].cells = notebook.pages[pageIndex].cells.filter(cell => cell.id !== cellId);

        const cell = this.getCell(pageId, cellId);
        const cellIndex = this.indexCell(pageId, cellId);
        let history = this.handleHistory({
            command: 'removeCell',
            pageId: pageId,
            cellId: cellId,
            cell: cell,
            cellIndex: cellIndex
        }, operation);

        this.setState((state) => {
            return {
                ...state,
                ...history,
                notebook: notebook
            };
        });
    }

    addEntitiesCell(pageId, operation) {
        if (operation === undefined) operation = "do";
        
        addEntitiesCell(this.state.notebook, pageId).then((notebook) => {
            let history = this.handleHistory({
                command: 'addEntitiesCell',
                pageId: pageId,
            }, operation);

            this.setState((state) => {
                return {
                    ...state,
                    ...history,
                    notebook: notebook,
                };
            });
        });
    }

    addQuestionCell(question, pageId, operation) {
        if (operation === undefined) operation = "do";

        addQuestionCell(this.state.notebook, question, pageId).then((notebook) => {
            let history = this.handleHistory({
                command: 'addQuestionCell',
                question: question,
                pageId: pageId
            }, operation);

            this.setState((state) => {
                return {
                    ...state,
                    ...history,
                    notebook: notebook,
                };
            });
        });
    }

    addSparseQuestionCell(question, operation) {
        if (operation === undefined) operation = "do";

        addSparseQuestionCell(this.state.notebook, question).then((notebook) => {
            let history = this.handleHistory({
                command: 'addSparseQuestionCell',
                question: question,
            }, operation);

            this.setState((state) => {
                return {
                    ...state,
                    ...history,
                    notebook: notebook,
                };
            });
        });
    }

    addGenerateCell(prompt, pageId, operation) {
        if (operation === undefined) operation = "do";

        addGenerateCell(this.state.notebook, prompt, pageId).then((notebook) => {
            let history = this.handleHistory({
                command: 'addGenerateCell',
                prompt: prompt,
                pageId: pageId
            }, operation);

            this.setState((state) => {
                return {
                    ...state,
                    ...history,
                    notebook: notebook,
                };
            });
        });
    }

    addWikipediaSummaryCell(query, pageId, operation) {
        if (operation === undefined) operation = "do";

        addWikipediaSummaryCell(this.state.notebook, query, pageId).then((notebook) => {
            let history = this.handleHistory({
                command: 'addWikipediaSummaryCell',
                query: query,
                pageId: pageId
            }, operation);

            this.setState((state) => {
                return {
                    ...state,
                    ...history,
                    notebook: notebook,
                };
            });
        });
    }

    addWikipediaSuggestionsCell(query, pageId, operation) {
        if (operation === undefined) operation = "do";
        
        addWikipediaSuggestionsCell(this.state.notebook, query, pageId).then((notebook) => {
            let history = this.handleHistory({
                command: 'addWikipediaSuggestionsCell',
                query: query,
                pageId: pageId
            }, operation);

            this.setState((state) => {
                return {
                    ...state,
                    ...history,
                    notebook: notebook,
                };
            });
        });
    }

    addWikipediaImageCell(query, pageId, operation) {
        if (operation === undefined) operation = "do";

        addWikipediaImageCell(this.state.notebook, query, pageId).then((notebook) => {
            let history = this.handleHistory({
                command: 'addWikipediaImageCell',
                query: query,
                pageId: pageId
            }, operation);

            this.setState((state) => {
                return {
                    ...state,
                    ...history,
                    notebook: notebook,
                };
            });
        });
    }

    addMeaningCell(word, pageId, operation) {
        if (operation === undefined) operation = "do";

        addMeaningCell(this.state.notebook, word, pageId).then((notebook) => {
            let history = this.handleHistory({
                command: 'addMeaningCell',
                word: word,
                pageId: pageId
            }, operation);

            this.setState((state) => {
                return {
                    ...state,
                    ...history,
                    notebook: notebook,
                };
            });
        });
    }

    addSynonymCell(word, pageId, operation) {
        if (operation === undefined) operation = "do";

        addSynonymCell(this.state.notebook, word, pageId).then((notebook) => {
            let history = this.handleHistory({
                command: 'addSynonymCell',
                word: word,
                pageId: pageId
            }, operation);

            this.setState((state) => {
                return {
                    ...state,
                    ...history,
                    notebook: notebook,
                };
            });
        });
    }

    addAntonymCell(word, pageId, operation) {
        if (operation === undefined) operation = "do";

        addAntonymCell(this.state.notebook, word, pageId).then((notebook) => {
            let history = this.handleHistory({
                command: 'addAntonymCell',
                word: word,
                pageId: pageId
            }, operation);

            this.setState((state) => {
                return {
                    ...state,
                    ...history,
                    notebook: notebook,
                };
            });
        });
    }

    save() {
        const saveDialogOptions = {
            filters: [
                { name: 'Notebooks', extensions: ['json'] }
            ]
        };

        const { notebookPath, notebook } = this.state;

        console.log(notebookPath);

        if (notebookPath) {
            writeFile(notebookPath, JSON.stringify(notebook));
        } else {
            saveDialog(saveDialogOptions).then((results) => {
                if (!results.canceled) {
                    const path = results.filePath;
                    writeFile(path, JSON.stringify(notebook));
                    this.setState((state) => {
                        return {
                            ...state,
                            notebookPath: path
                        };
                    });
                }
            });
        }
    }

    toggleEditing() {
        this.setState((state) => {
            return {
                ...state,
                editing: !state.editing
            };
        });
    }

    setCellContent(pageId, cellId, content, deselect, operation) {
        if (deselect === undefined) deselect = false;
        if (operation === undefined) operation = "do";

        const pageIndex = this.indexPage(pageId);
        const cellIndex = this.indexCell(pageId, cellId);
        let notebook = { ...this.state.notebook };
        notebook.pages[pageIndex].cells[cellIndex].content = content;

        const previousContent = this.getCell(pageId, cellId).content;
        let history = this.handleHistory({
            command: 'setCellContent',
            pageId: pageId,
            cellId: cellId,
            content: content,
            previousContent: previousContent
        }, operation);

        this.setState((state) => {
            return {
                ...state,
                ...history,
                activePage: deselect ? null : state.activePage,
                activeCell: deselect ? null : state.activeCell,
                notebook: notebook
            };
        });
    }

    setCellData(pageId, cellId, data, deselect, operation) {
        if (deselect === undefined) deselect = false;
        if (operation === undefined) operation = "do";

        const pageIndex = this.indexPage(pageId);
        const cellIndex = this.indexCell(pageId, cellId);
        let notebook = { ...this.state.notebook };
        notebook.pages[pageIndex].cells[cellIndex].data = data;

        const previousData = this.getCell(pageId, cellId).data;
        let history = this.handleHistory({
            command: 'setCellData',
            pageId: pageId,
            cellId: cellId,
            data: data,
            previousData: previousData
        }, operation);

        this.setState((state) => {
            return {
                ...state,
                ...history,
                activePage: deselect ? null : state.activePage,
                activeCell: deselect ? null : state.activeCell,
                notebook: notebook
            };
        });
    }

    handleHistory(command, operation) {
        if (operation === undefined) operation = "do";

        let history = [ ...this.state.history ];
        let historyPointer = this.state.historyPointer;

        if (operation === "do") {
            if (historyPointer === history.length - 1) {
                history.push(command);
            } else {
                history.splice(historyPointer, history.length - historyPointer, command);
            }

            historyPointer++;

        } else if (operation === "undo") {
            historyPointer--;
        } else if (operation === "redo") {
            historyPointer++;
        }

        return {
            history: history,
            historyPointer: historyPointer
        };
    }

    undo() {
        const command = this.state.history[this.state.historyPointer];

        switch (command.command) {
            case "insertPage":
                this.removePage(command.page.id, "undo");
                break;
            case "addPage":
                this.removePage(command.page.id, "undo");
                break;
            case "removePage":
                this.insertPage(command.page, command.pageIndex, "undo");
                break;
            case "insertCell":
                this.removeCell(command.pageId, command.cell.id, "undo");
                break;
            case "addCell":
                this.removeCell(command.pageId, command.cell.id, "undo");
                break;
            case "removeCell":
                this.insertCell(command.pageId, command.cell, command.cellIndex, "undo");
                break;
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
                this.removeCell(command.pageId, command.cellId, "undo");
                break;
            case "setCellContent":
                this.setCellContent(command.pageId, command.cellId, command.previousContent, undefined, "undo");
                break;
            case "setCellData":
                this.setCellData(command.pageId, command.cellId, command.previousData, undefined, "undo");
                break;
        }
    }

    redo() {
        const command = this.state.history[this.state.historyPointer];

        switch (command.command) {
            case "insertPage":
                this.insertPage(command.page, command.pageIndex, "redo");
                break;
            case "addPage":
                this.addPage(command.page, "redo");
                break;
            case "removePage":
                this.removePage(command.pageId, "redo");
                break;
            case "insertCell":
                this.insertCell(command.pageId, command.cell, command.cellIndex, "redo");
                break;
            case "addCell":
                this.addCell(command.pageId, command.cell, "redo");
                break;
            case "removeCell":
                this.removeCell(command.pageId, command.cellId, "redo");
                break;
            case "addEntitiesCell":
                this.addEntitiesCell(command.pageId, "redo");
                break;
            case "addQuestionCell":
                this.addQuestionCell(command.question, command.pageId, "redo");
                break;
            case "addSparseQuestionCell":
                this.addSparseQuestionCell(command.question, "redo");
                break;
            case "addGenerateCell":
                this.addGenerateCell(command.prompt, command.pageId, "redo");
                break;
            case "addWikipediaSummaryCell":
                this.addWikipediaSummaryCell(command.query, command.pageId, "redo");
                break;
            case "addWikipediaSuggestionsCell":
                this.addWikipediaSuggestionsCell(command.query, command.pageId, "redo");
                break;
            case "addWikipediaImageCell":
                this.addWikipediaImageCell(command.query, command.pageId, "redo");
                break;
            case "addMeaningCell":
                this.addMeaningCell(command.word, command.pageId, "redo");
                break;
            case "addSynonymCell":
                this.addSynonymCell(command.word, command.pageId, "redo");
                break;
            case "addAntonymCell":
                this.addAntonymCell(command.word, command.pageId, "redo");
                break;
            case "setCellContent":
                this.setCellContent(command.pageId, command.cellId, command.content, undefined, "redo");
                break;
            case "setCellData":
                this.setCellData(command.pageId, command.cellId, command.data, undefined, "redo");
                break;
        }
    }

    render() {
        return (
            <div className="notebook" id="notebook">
                {this.state.notebook.pages.map((page) => <Page
                    key={page.id}
                    id={page.id}
                    pageController={this.state.pageController}
                    notebookController={this.state.notebookController}
                    data={page.data}
                    document={this.state.documentFile}
                    cells={page.cells}
                    active={this.state.activePage === page.id}
                    activeCell={this.state.activeCell}
                    editing={this.state.editing} />
                )}
            </div>
        );
    }
}

export default Notebook;
