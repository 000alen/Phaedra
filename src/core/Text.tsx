import * as pdfjs from "pdfjs-dist/legacy/build/pdf";
import pdfjsWorker from "pdfjs-dist/legacy/build/pdf.worker.entry";

import { decode, encode } from "../electron";

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

export async function chop(
  texts: string[],
  size: number
): Promise<[number[], string[]]> {
  const tokenizedSources = await Promise.all(texts.map(encode));

  const indexes: number[] = [];
  const chunks: [number[]][] = [];

  let currentIndex: number = 0;
  let currentChunk: number[] = [];

  for (const [i, tokenizedSource] of tokenizedSources.entries()) {
    let j = 0;
    while (j < tokenizedSource.length) {
      if (j + (size - currentChunk.length) <= tokenizedSource.length) {
        const chunkExtension = tokenizedSource.slice(
          j,
          j + (size - currentChunk.length)
        );
        j += size - currentChunk.length;
        currentChunk.push(...chunkExtension);

        indexes.push(currentIndex);
        // @ts-ignore
        chunks.push(currentChunk);

        currentIndex = i;
        currentChunk = [];
      } else {
        currentChunk.push(...tokenizedSource.slice(j));
        j = tokenizedSource.length;
      }

      if (currentChunk.length === size) {
        indexes.push(currentIndex);
        // @ts-ignore
        chunks.push(currentChunk);

        currentIndex = i;
        currentChunk = [];
      }
    }

    if (currentChunk && i === tokenizedSources.length - 1) {
      indexes.push(currentIndex);
      // @ts-ignore
      chunks.push(currentChunk);
    }
  }

  // @ts-ignore
  return [indexes, await Promise.all(chunks.map((chunk) => decode(chunk)))];
}

export function zip(...arrays: any[][]) {
  return arrays[0].map(function (_, i) {
    return arrays.map(function (array) {
      return array[i];
    });
  });
}
