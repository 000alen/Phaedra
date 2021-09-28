import React, {Component} from 'react';
import { initializeIcons, Icon, DefaultButton } from '@fluentui/react';
import { pdfjs, Document, Page as DocumentPage } from 'react-pdf';
import Cell from './Cell';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

initializeIcons();

class Page extends Component {
    constructor(props) {
        super(props);

        const {id, notebookController, data, document, cells, active, activeCell} = props;

        this.state = {
            id: id,
            notebookController: notebookController,
            data: data,
            document: document,
            cells: cells,
            active: active,
            activeCell: activeCell
        }
    }

    renderWithDocument() {
        const {id, notebookController, data, document, cells, active, activeCell} = this.state;

        return (
            <div className="page p-2 m-2 rounded-sm shadow-md grid grid-cols-2">
                <div>
                    {cells.map((cell) => <Cell 
                        key={cell.id} 
                        id={cell.id} 
                        notebookController={notebookController}
                        data={cell.data}
                        content={cell.content}
                        pageId={id}
                        active={active ? (activeCell === cell.id) : null} />
                    )}
                </div>
                
                {data.document_page_number && (
                    <div className="rounded-sm">
                        <Document 
                            file={document}
                            renderMode="svg">
                            <DocumentPage 
                                pageNumber={data.document_page_number}
                                renderTextLayer={false} />
                        </Document>
                    </div>
                )}
            </div>
        );
    }

    renderWithoutDocument() {
        // 8.5 x 11 inches
        const pageStyle = {
            width: '8.5in',
            height: '11in',
        };

        return (
            <div className="flex items-center justify-center bg-gray-200">
                <div className="page p-2 m-2 rounded-sm shadow-md bg-white" style={pageStyle}>
                    <div>
                        {this.state.cells.map((cell) => <Cell 
                            key={cell.id} 
                            id={cell.id} 
                            notebookController={this.state.notebookController}
                            data={cell.data}
                            content={cell.content}
                            pageId={this.state.id}
                            active={this.state.active ? (this.state.activeCell === cell.id) : null} />
                        )}
                    </div>
                </div>
            </div>
        );
    }

    render() {
        return this.renderWithDocument();
        // return this.renderWithoutDocument();
    }
}

export default Page;
