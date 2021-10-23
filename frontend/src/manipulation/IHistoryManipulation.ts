import { INotebookCommand } from "./INotebookManipulation";

export type IHistory = INotebookCommand[];

export interface IHistoryManipulation {
  history: IHistory;
  historyIndex: number;
}
