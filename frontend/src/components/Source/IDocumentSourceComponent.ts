import { DocumentFile } from "../Notebook/INotebookComponent";

export interface DocumentSourceComponent {
  document: DocumentFile;
  pageNumber: number;
}
