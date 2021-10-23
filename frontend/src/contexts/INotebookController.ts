import {
  INotebookCommand,
  INotebookManipulation,
} from "../manipulation/INotebookManipulation";
import { INotebookPageController } from "./INotebookPageController";

export interface INotebookController {
  save: () => void;
  handleSelection: (pageId: string, cellId: string) => void;
  toggleEditing: () => void;
  undo: () => void;
  redo: () => void;
  do: (action: INotebookManipulation, args: INotebookCommand) => void;
  getNotebookPageController: () => INotebookPageController | undefined;
}
