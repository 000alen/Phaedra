import { INotebookCommand } from "../notebook/INotebookManipulation";

export type IHistory = INotebookCommand[];

export interface IHistoryInformation {
  history: IHistory;
  historyIndex: number;
}
