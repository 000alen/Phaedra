import { INotebookCommand } from "./INotebookManipulation";

export type IHistory = INotebookCommand[];

export interface IHistoryInformation {
  history: IHistory;
  historyIndex: number;
}
