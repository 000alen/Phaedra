import React from 'react';
import { Document, Page as DocumentPage, pdfjs } from 'react-pdf';
import { Cell } from './Cell';


import "../css/Page.css";

//import SelectedMenu from "react-selected-text-menu";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export function Page({ file, number, cells }) {
    function removeTextLayerOffset() {
        const textLayers = document.querySelectorAll(".react-pdf__Page__textContent");
        textLayers.forEach(layer => {
            const { style } = layer;
            style.top = "0";
            style.left = "0";
            style.transform = "";
        });
    }

    return (
        <div className="page">
            <div className="page-number">
                {`Page ${number}`}
            </div>

            <div className="pageLeftContainer">
                <div className="pageMarkdown">
                    {cells.map((cell) => {
                        return <Cell key={cell.id} content={cell.content} font="Ubuntu"/>
                    })}
                </div>

            </div>

            <div className="pageRightContainer">
                <div className="pagePdf">
                    <Document
                        file={file}
                        renderMode="svg"
                        onLoadSuccess={removeTextLayerOffset}>
                        <DocumentPage
                            pageNumber={number}
                            scale={1}
                        />
                    </Document>
                </div>
            </div>
        </div>
    );
}
