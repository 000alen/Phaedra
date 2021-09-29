import React, { Component } from 'react';
import { pdfjs, Document, Page as DocumentPage } from 'react-pdf';
import Cell from './Cell';
import { theme } from '../../index';
import { v4 as uuidv4 } from 'uuid';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export function createPage() {
    return {
        id: uuidv4(),
        data: {},
        cells: [
            {
                id: uuidv4(),
                data: {},
                content: 'Hello, world!',
            }
        ],
    };
}


class Page extends Component {
    constructor(props) {
        super(props);

        this.handleSelect = this.handleSelect.bind(this);

        const { id, notebookController, pageController } = props;

        this.state = {
            id: id,
            notebookController: notebookController,
            pageController: pageController
        }
    }

    handleSelect() {
        const { notebookController, id } = this.state;
        notebookController.toggleSelectPage(id);
    }

    renderWithDocument() {
        const { id, notebookController, pageController } = this.state;
        const { data, cells, active, activeCell, document } = this.props;

        const containerStyle = {
            backgroundColor: theme.palette.neutralLight,
        }

        const paperStyle = {
            backgroundColor: theme.palette.white,
            border: active? `1px solid ${theme.palette.themePrimary}` : null,
        }

        return (
            <div className="page grid grid-cols-2" style={containerStyle}>
                <div className="m-2 p-2 rounded-md shadow-md" style={paperStyle} onClick={this.handleSelect}>
                    {cells.map((cell) => <Cell
                        key={cell.id}
                        id={cell.id}
                        pageController={pageController}
                        notebookController={notebookController}
                        data={cell.data}
                        content={cell.content}
                        pageId={id}
                        active={active ? (activeCell === cell.id) : null} />
                    )}
                </div>

                <div className="m-2 rounded-md shadow-md">
                    <Document
                        file={document}
                        renderMode="svg">
                        <DocumentPage
                            pageNumber={data.document_page_number}
                            renderTextLayer={false} />
                    </Document>
                </div>
            </div>
        );
    }

    renderWithoutDocument() {
        const { id, notebookController, pageController } = this.state;
        const { cells, active, activeCell } = this.props;

        const containerStyle = {
            backgroundColor: theme.palette.neutralLight,
        }

        const pageStyle = {
            width: '8.5in',
            height: '11in',
            backgroundColor: theme.palette.white,
            border: active? `1px solid ${theme.palette.themePrimary}` : null,
        };

        return (
            <div className="flex items-center justify-center" style={containerStyle}>
                <div className="page p-2 m-2 rounded-md shadow-md" style={pageStyle} onClick={this.handleSelect}>
                    <div>
                        {cells.map((cell) => <Cell
                            key={cell.id}
                            id={cell.id}
                            pageController={pageController}
                            notebookController={notebookController}
                            data={cell.data}
                            content={cell.content}
                            pageId={id}
                            active={active ? (activeCell === cell.id) : null} />
                        )}
                    </div>
                </div>
            </div>
        );
    }

    render() {
        const { document, data } = this.props;

        if (document && data.document_page_number) {
            return this.renderWithDocument();
        } else {
            return this.renderWithoutDocument();
        }
    }
}

export default Page;
