import React from "react";
import { pdfjs, Document, Page } from "react-pdf";
import { readFileSync } from "../API/ElectronAPI";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export function Source() {
  const [file, setFile] = React.useState<null | { data: Uint8Array }>(null);

  React.useEffect(() => {
    readFileSync("C:\\Users\\alenk\\Desktop\\bitcoin.pdf").then((data) => {
      setFile({ data: data as Uint8Array });
    });
  }, []);

  return (
    <div>
      <Document file={file}>
        <Page pageIndex={0} />
      </Document>
    </div>
  );
}
