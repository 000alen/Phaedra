import React from "react";
import { pdfjs, Document, Page } from "react-pdf";
import { readFileSync } from "../../API/ElectronAPI";
import { IReference } from "../../Notebook/Notebook";
import { NotebookManager } from "../../Notebook/UseNotebook";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export interface ReferenceProps {
  notebookManager: NotebookManager;
  reference: IReference;
}

export function Reference({ notebookManager, reference }: ReferenceProps) {
  const [pdfFile, setPdfFile] = React.useState<null | { data: Uint8Array }>(
    null
  );

  const source = notebookManager.getSource(reference.sourceId)!;

  React.useEffect(() => {
    if (source.type === "pdf") {
      readFileSync(source.path!).then((data) => {
        setPdfFile({ data: data as Uint8Array });
      });
    }
  }, [source.type, source.path]);

  return source.type === "pdf" ? (
    <Document file={pdfFile} renderMode="svg">
      <Page
        pageIndex={source.index!}
        renderAnnotationLayer={false}
        renderTextLayer={false}
      />
    </Document>
  ) : (
    <>{source.content}</>
  );
}
