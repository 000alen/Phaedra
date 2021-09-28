import React, { Component } from 'react';
import { addEntitiesCell, addQuestionCell, addSparseQuestionCell, addWikipediaSummaryCell, addWikipediaSuggestionsCell, addWikipediaImageCell, addMeaningCell, addSynonymCell, addAntonymCell, addUsageExampleCell } from '../../API';
import {ipcRenderer} from '../../index';
import Page from './Page';

class Notebook extends Component {
    constructor(props) {
        super(props);

        this.loadDocument = this.loadDocument.bind(this);
        this.toggleSelectPage = this.toggleSelectPage.bind(this);
        this.toggleSelectCell = this.toggleSelectCell.bind(this);

        this.insertPage = this.insertPage.bind(this);
        this.addPage = this.addPage.bind(this);
        this.getPage = this.getPage.bind(this);
        this.removePage = this.removePage.bind(this);

        this.insertCell = this.insertCell.bind(this);
        this.addCell = this.addCell.bind(this);
        this.getCell = this.getCell.bind(this);
        this.removeCell = this.removeCell.bind(this);
        
        this.addEntitiesCell = this.addEntitiesCell.bind(this);
        this.addQuestionCell = this.addQuestionCell.bind(this);
        this.addSparseQuestionCell = this.addSparseQuestionCell.bind(this);
        this.addWikipediaSummaryCell = this.addWikipediaSummaryCell.bind(this);
        this.addWikipediaSuggestionsCell = this.addWikipediaSuggestionsCell.bind(this);
        this.addWikipediaImageCell = this.addWikipediaImageCell.bind(this);

        this.addMeaningCell = this.addMeaningCell.bind(this);
        this.addSynonymCell = this.addSynonymCell.bind(this);
        this.addAntonymCell = this.addAntonymCell.bind(this);
        this.addUsageExampleCell = this.addUsageExampleCell.bind(this);

        const {tabId, appController } = props;
        const {notebook, notebookPath} = props;

        const notebookController = {
            toggleSelectPage: this.toggleSelectPage,
            toggleSelectCell: this.toggleSelectCell,
            insertPage: this.insertPage,
            addPage: this.addPage,
            getPage: this.getPage,
            removePage: this.removePage,
            insertCell: this.insertCell,
            addCell: this.addCell,
            getCell: this.getCell,
            removeCell: this.removeCell,
            addEntitiesCell: this.addEntitiesCell,
            addQuestionCell: this.addQuestionCell,
            addSparseQuestionCell: this.addSparseQuestionCell,
            addWikipediaSummaryCell: this.addWikipediaSummaryCell,
            addWikipediaSuggestionsCell: this.addWikipediaSuggestionsCell,
            addWikipediaImageCell: this.addWikipediaImageCell,
            addMeaningCell: this.addMeaningCell,
            addSynonymCell: this.addSynonymCell,
            addAntonymCell: this.addAntonymCell,
            addUsageExampleCell: this.addUsageExampleCell
        };

        this.state =  {
            tabId: tabId,
            appController: appController,
            notebookController: notebookController,
            notebook: notebook,
            notebookPath: notebookPath,
            documentPath: notebook.document_path,
            documentFile: null,
            activePage: null,
            activeCell: null
        };
    }

    componentDidMount() {
        let state = JSON.parse(window.localStorage.getItem(this.state.notebook.name));

        if (state !== null) {
            console.log("Loading saved state");
            state.appController = this.state.appController;
            state.pageController = this.state.pageController;
            state.notebookController = this.state.notebookController;
            state.documentFile.data = Uint8Array.from(state.documentFile.data);
            this.setState(state);
        }
    }

    componentWillUnmount() {
        window.localStorage.setItem(this.state.notebook.name, JSON.stringify(this.state));
    }

    loadDocument() {
        ipcRenderer.invoke('readFile', this.state.documentPath).then((documentContent) => {
            this.setState((state) => {
                const documentFile = {url: this.state.documentPath, data: documentContent};
                return {...state, documentFile: documentFile};
            });
        })
    }

    toggleSelectPage(pageId) {
        if (this.state.activePage === pageId) {
            this.setState((state) => {
                return {
                    ...state,
                    activePage: null
                };
            });
        } else {
            this.setState((state) => {
                return {
                    ...state,
                    activePage: pageId
                };
            });
        }
    }

    toggleSelectCell(pageId, cellId) {
        if (this.state.activePage === pageId && this.state.activeCell === cellId) {
            this.setState((state) => {
                return {
                    ...state,
                    activePage: null,
                    activeCell: null
                };
            });
        } else {
            this.setState((state) => {
                return {
                    ...state,
                    activePage: pageId,
                    activeCell: cellId
                };
            });
        }
    }

    insertPage(page, index) {
        this.setState((state) => {
            return {
                ...state,
                notebook: {
                    ...state.notebook,
                    pages: state.notebook.pages.splice(index, 0, page)
                }
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
        this.setState((state) => {
            return {
                ...state,
                notebook: {
                    ...state.notebook,
                    pages: state.notebook.pages.map(page => {
                        if (page.id === pageId) {
                            return {
                                ...page,
                                cells: page.cells.splice(index, 0, cell)
                            };
                        } else {
                            return page;
                        }
                    })
                }
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

    addUsageExampleCell(word, pageId) {
        addUsageExampleCell(this.state.notebook, word, pageId).then((notebook) => {
            this.setState((state) => {
                return {
                    ...state,
                    notebook: notebook
                };
            });
        });
    }

    render() {
        if (this.state.documentFile === null) this.loadDocument();

        return (
            <div className="notebook">
                {this.state.notebook.pages.map(page => <Page 
                    key={page.id} 
                    id={page.id} 
                    notebookController={this.state.notebookController}
                    data={page.data}
                    document={this.state.documentFile}
                    cells={page.cells}
                    active={this.state.activePage === page.id}
                    activeCell={this.state.activeCell} />
                )}
            </div>
        );
    }
}

export default Notebook;
