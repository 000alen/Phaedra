import React, {Component} from 'react';
import { pdfjs, Document, Page as DocumentPage } from 'react-pdf';
import { Cell } from './Cell';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export function Page({id, notebookController, data, document, cells, active, activeCell}) {
    return (
        <div className="page p-2 m-2 bg-white rounded-sm shadow-md grid grid-cols-2">
            <div>
                {cells.map((cell) => 
                    <Cell 
                        key={cell.id} 
                        id={cell.id} 
                        notebookController={notebookController}
                        data={cell.data}
                        content={cell.content}
                        pageId={id}
                        active={active ? (activeCell === cell.id) : null} />
                )}
                <div className="flex flex-wrap justify-center">
                    <div className="flex items-center p-2 m-2 bg-white rounded-sm shadow-md space-x-2">
                        <img className="h-4 w-4" src={`./assets/feather/plus.svg`} />
                        <button>Cell</button>
                    </div>
                    <div className="flex items-center p-2 m-2 bg-white rounded-sm shadow-md space-x-2">
                        <img className="h-4 w-4" src={`./assets/feather/plus.svg`} />
                        <button>Question</button>
                    </div>
                    <div className="flex items-center p-2 m-2 bg-white rounded-sm shadow-md space-x-2">
                        <img className="h-4 w-4" src={`./assets/feather/plus.svg`} />
                        <button>Wikipedia</button>
                    </div>
                </div>
            </div>
            
            {data.document_page_number && (
                <div>
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
    )
}
