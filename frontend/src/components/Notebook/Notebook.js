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

    insertPage(page, index) {
        let newNotebook = { ...this.state.notebook };
        newNotebook.pages.splice(index, 0, page);
        this.setState((state) => {
            return {
                ...state,
                notebook: newNotebook
            };
        });
    }

    addPage(page) {
        this.setState((state) => {
            return {
                ...state,
                notebook: {
                    ...state.notebook,
                    pages: [
                        ...state.notebook.pages,
                        page
                    ]
                }
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

    removePage(pageId) {
        this.setState((state) => {
            return {
                ...state,
                notebook: {
                    ...state.notebook,
                    pages: state.notebook.pages.filter(page => page.id !== pageId)
                }
            };
        });
    }

    insertCell(pageId, cell, index) {
        let newNotebook = { ...this.state.notebook };
        const pageIndex = this.indexPage(pageId);
        newNotebook.pages[pageIndex].cells.splice(index, 0, cell);

        this.setState((state) => {
            return {
                ...state,
                notebook: newNotebook
            };
        });
    }

    addCell(pageId, cell) {
        this.setState((state) => {
            return {
                ...state,
                notebook: {
                    ...state.notebook,
                    pages: state.notebook.pages.map(page => {
                        if (page.id === pageId) {
                            return {
                                ...page,
                                cells: [
                                    ...page.cells,
                                    cell
                                ]
                            };
                        } else {
                            return page;
                        }
                    })
                }
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

    removeCell(pageId, cellId) {
        this.setState((state) => {
            return {
                ...state,
                notebook: {
                    ...state.notebook,
                    pages: state.notebook.pages.map(page => {
                        if (page.id === pageId) {
                            return {
                                ...page,
                                cells: page.cells.filter(cell => cell.id !== cellId)
                            };
                        } else {
                            return page;
                        }
                    })
                }
            };
        });
    }

    addEntitiesCell(pageId) {
        addEntitiesCell(this.state.notebook, pageId).then((notebook) => {
            this.setState((state) => {
                return {
                    ...state,
                    notebook: notebook
                };
            });
        });
    }

    addQuestionCell(question, pageId) {
        addQuestionCell(this.state.notebook, question, pageId).then((notebook) => {
            this.setState((state) => {
                return {
                    ...state,
                    notebook: notebook
                };
            });
        });
    }

    addSparseQuestionCell(question) {
        addSparseQuestionCell(this.state.notebook, question).then((notebook) => {
            this.setState((state) => {
                return {
                    ...state,
                    notebook: notebook
                };
            });
        });
    }

    addGenerateCell(prompt, pageId) {
        addGenerateCell(this.state.notebook, prompt, pageId).then((notebook) => {
            this.setState((state) => {
                return {
                    ...state,
                    notebook: notebook
                };
            });
        });
    }

    addWikipediaSummaryCell(query, pageId) {
        addWikipediaSummaryCell(this.state.notebook, query, pageId).then((notebook) => {
            this.setState((state) => {
                return {
                    ...state,
                    notebook: notebook
                };
            });
        });
    }

    addWikipediaSuggestionsCell(query, pageId) {
        addWikipediaSuggestionsCell(this.state.notebook, query, pageId).then((notebook) => {
            this.setState((state) => {
                return {
                    ...state,
                    notebook: notebook
                };
            });
        });
    }

    addWikipediaImageCell(query, pageId) {
        addWikipediaImageCell(this.state.notebook, query, pageId).then((notebook) => {
            this.setState((state) => {
                return {
                    ...state,
                    notebook: notebook
                };
            });
        });
    }

    addMeaningCell(word, pageId) {
        addMeaningCell(this.state.notebook, word, pageId).then((notebook) => {
            this.setState((state) => {
                return {
                    ...state,
                    notebook: notebook
                };
            });
        });
    }

    addSynonymCell(word, pageId) {
        addSynonymCell(this.state.notebook, word, pageId).then((notebook) => {
            this.setState((state) => {
                return {
                    ...state,
                    notebook: notebook
                };
            });
        });
    }

    addAntonymCell(word, pageId) {
        addAntonymCell(this.state.notebook, word, pageId).then((notebook) => {
            this.setState((state) => {
                return {
                    ...state,
                    notebook: notebook
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

    setCellContent(pageId, cellId, content, deselect) {
        if (deselect === undefined) deselect = false;

        this.setState((state) => {
            return {
                ...state,
                activePage: deselect ? null : state.activePage,
                activeCell: deselect ? null : state.activeCell,
                notebook: {
                    ...state.notebook,
                    pages: state.notebook.pages.map(page => {
                        if (page.id === pageId) {
                            return {
                                ...page,
                                cells: page.cells.map(cell => {
                                    if (cell.id === cellId) {
                                        return {
                                            ...cell,
                                            content: content
                                        };
                                    } else {
                                        return cell;
                                    }
                                })
                            };
                        } else {
                            return page;
                        }
                    })
                }
            };
        });
    }

    setCellData(pageId, cellId, data, deselect) {
        if (deselect === undefined) deselect = false;

        this.setState((state) => {
            return {
                ...state,
                activePage: deselect ? null : state.activePage,
                activeCell: deselect ? null : state.activeCell,
                notebook: {
                    ...state.notebook,
                    pages: state.notebook.pages.map(page => {
                        if (page.id === pageId) {
                            return {
                                ...page,
                                cells: page.cells.map(cell => {
                                    if (cell.id === cellId) {
                                        return {
                                            ...cell,
                                            data: data
                                        };
                                    } else {
                                        return cell;
                                    }
                                })
                            };
                        } else {
                            return page;
                        }
                    })
                }
            };
        });
    }

    render() {
        return (
            <div className="notebook">
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
