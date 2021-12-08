import * as pdfjs from "pdfjs-dist/legacy/build/pdf";
import pdfjsWorker from "pdfjs-dist/legacy/build/pdf.worker.entry";

pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export async function extractTextFromPdf(buffer: Buffer) {
  const pdf = await pdfjs.getDocument(buffer).promise;
  const maxPages = pdf.numPages;
  const pageTextPromises = [];
  for (let pageNo = 1; pageNo <= maxPages; pageNo += 1) {
    const page = await pdf.getPage(pageNo);
    const tokenizedText = await page.getTextContent();
    const pageText = tokenizedText.items
      .map((token: any) => token.str)
      .join("");
    pageTextPromises.push(pageText);
  }
  const pageTexts = await Promise.all(pageTextPromises);
  return pageTexts.join(" ");
}

export async function extractTextToPagesFromPdf(buffer: Buffer) {
  const pdf = await pdfjs.getDocument(buffer).promise;
  const maxPages = pdf.numPages;
  const pageTextPromises = [];
  for (let pageNo = 1; pageNo <= maxPages; pageNo += 1) {
    const page = await pdf.getPage(pageNo);
    const tokenizedText = await page.getTextContent();
    const pageText = tokenizedText.items
      .map((token: any) => token.str)
      .join("");
    pageTextPromises.push(pageText);
  }
  const pageTexts = await Promise.all(pageTextPromises);
  return pageTexts;
}
