import {
  INotebook,
  INotebookManipulation,
  INotebookManipulationArguments,
} from "../structures/notebook/INotebookManipulation";
import { INotebookPageController } from "./INotebookPageController";

export interface INotebookController {
  save: () => void;
  handleSelection: (pageId: string, cellId: string) => void;
  toggleEditing: () => void;
  undo: () => void;
  redo: () => void;
  do: (
    action: INotebookManipulation,
    args: INotebookManipulationArguments
  ) => void;
  doSync: (
    action: INotebookManipulation,
    args: INotebookManipulationArguments
  ) => void;
  getNotebookPageController: () => INotebookPageController | undefined;
  getActive: () => [string | undefined, string | undefined];
  getNotebook: () => INotebook | undefined;
}
