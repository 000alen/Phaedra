import React, { PureComponent } from "react";
import { pdfjs, Document, Page as DocumentPage } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export class PageDocumentComponent extends PureComponent {
  constructor(props) {
    super(props);

    const { document, pageNumber } = props;

    this.state = {
      document: document,
      pageNumber: pageNumber,
    };
  }

  render() {
    const { document, pageNumber } = this.props;

    return (
      <Document file={document} renderMode="svg">
        <DocumentPage pageNumber={pageNumber} renderTextLayer={false} />
      </Document>
    );
  }
}
