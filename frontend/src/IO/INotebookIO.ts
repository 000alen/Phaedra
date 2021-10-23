import { INotebook } from "../manipulation/INotebookManipulation";

export interface INotebookIO {
  notebook: INotebook;
  notebookPath: string | undefined;
}
