import React, { Component } from 'react';
import { addQuestionCell } from '../../API';
import {ipcRenderer} from '../../index';
import {Page} from './Page';


export class Notebook extends Component {
    constructor(props) {
        super(props);

        // this.componentDidMount = this.componentDidMount.bind(this);
        // this.componentWillUnmount = this.componentWillUnmount.bind(this);

        this.loadDocument = this.loadDocument.bind(this);
        this.toggleSelectPage = this.toggleSelectPage.bind(this);
        this.toggleSelectCell = this.toggleSelectCell.bind(this);
        
        const {tabId, appController} = props;
        const {notebook, path} = props;

        const notebookController = {
            toggleSelectPage: this.toggleSelectPage,
            toggleSelectCell: this.toggleSelectCell,
        };

        this.state =  {
            tabId: tabId,
            appController: appController,
            notebookController: notebookController,
            notebook: notebook,
            path: path,
            documentPath: notebook.document,
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
            state.notebookController = this.state.notebookController;
            state.documentFile.data = Uint8Array.from(state.documentFile.data);
            this.setState(state);
        }
    }

    componentWillUnmount() {
        console.log("Saving state");
        window.localStorage.setItem(this.state.notebook.name, JSON.stringify(this.state));
    }

    pageIdToIndex(pageId) {
        return this.state.notebook.pages.findIndex(page => page.id === pageId);
    }

    cellIdToIndex(pageId, cellId) {
        const pageIndex = this.pageIdToIndex(pageId);
        const page = this.state.notebook.pages[pageIndex];
        return page.cells.findIndex(cell => cell.id === cellId);
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

    addQuestionCell(question) {
        const pageIndex = this.pageIdToIndex(this.state.activePage);
        addQuestionCell(this.state.notebook, pageIndex, question).then((notebook) => {
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
                {this.state.notebook.pages.map(page => 
                    <Page 
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
