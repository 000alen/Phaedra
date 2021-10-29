import { INotebookController } from "../../contexts/INotebookController";
import { INotebook } from "../../structures/notebook/INotebookManipulation";

export interface DocumentFile {
  url: string;
  data: Uint8Array;
}

export interface NotebookComponentProps {
  tabId: string;
  notebook: INotebook;
  notebookPath: string | undefined;
}

export interface NotebookComponentState {
  tabId: string;
  notebook: INotebook;
  notebookPath: string | undefined;
  documentPath: string | undefined;
  documentFile: DocumentFile | undefined;
  activePage: string | undefined;
  activeCell: string | undefined;
  editing: boolean;
  history: any; // XXX
  historyIndex: number;
  isSaved: boolean;
  notebookController: INotebookController;
}
