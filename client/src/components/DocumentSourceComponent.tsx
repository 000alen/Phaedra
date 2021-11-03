import React from "react";
import { Document, Page as DocumentPage, pdfjs } from "react-pdf";

import { DocumentFile } from "./NotebookComponent";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export interface DocumentSourceComponentProps {
  document: DocumentFile;
  pageNumber: number;
}

export function DocumentSourceComponent({
  document,
  pageNumber,
}: DocumentSourceComponentProps) {
  return (
    <Document file={document} renderMode="svg">
      <DocumentPage pageNumber={pageNumber} renderTextLayer={false} />
    </Document>
  );
}
