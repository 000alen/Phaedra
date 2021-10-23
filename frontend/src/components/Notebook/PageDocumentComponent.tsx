import React, { PureComponent } from "react";
import { Document, Page as DocumentPage, pdfjs } from "react-pdf";

import {
  PageDocumentComponentProps,
  PageDocumentComponentState,
} from "./IPageDocumentComponent";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

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
