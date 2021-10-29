import { INotebookManipulationArguments } from "../notebook/INotebookManipulation";

export type IHistory = INotebookManipulationArguments[];

export interface IHistoryInformation {
  history: IHistory;
  historyIndex: number;
}
