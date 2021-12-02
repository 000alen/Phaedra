import React from "react";
import { pdfjs, Document, Page } from "react-pdf";
import { readFileSync } from "../API/ElectronAPI";
import { IReference } from "../HOC/UseNotebook/Notebook";
import { NotebookManager } from "../HOC/UseNotebook/UseNotebook";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export interface ReferenceProps {
  notebookManager: NotebookManager;
  reference: IReference;
}

export function Reference({ notebookManager, reference }: ReferenceProps) {
  const [file, setFile] = React.useState<null | { data: Uint8Array }>(null);

  React.useEffect(() => {
    readFileSync("C:\\Users\\alenk\\Desktop\\bitcoin.pdf").then((data) => {
      setFile({ data: data as Uint8Array });
    });
  }, []);

  return (
    <Document file={file} renderMode="svg">
      <Page
        pageIndex={0}
        renderAnnotationLayer={false}
        renderTextLayer={false}
      />
    </Document>
  );
}
