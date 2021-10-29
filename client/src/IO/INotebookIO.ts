import { INotebook } from "../structures/notebook/INotebookManipulation";

export interface INotebookIO {
  notebook: INotebook;
  notebookPath: string | undefined;
}
