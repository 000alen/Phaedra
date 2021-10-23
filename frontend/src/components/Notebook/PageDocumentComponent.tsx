import React, { PureComponent } from "react";
import { pdfjs, Document, Page as DocumentPage } from "react-pdf";
import { File } from "./NotebookComponent";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PageDocumentComponentProps {
  document: File;
  pageNumber: number;
}

interface PageDocumentComponentState {}

export class PageDocumentComponent extends PureComponent<
  PageDocumentComponentProps,
  PageDocumentComponentState
> {
  render() {
    const { document, pageNumber } = this.props;

    return (
      <Document file={document} renderMode="svg">
        <DocumentPage pageNumber={pageNumber} renderTextLayer={false} />
      </Document>
    );
  }
}
