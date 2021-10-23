import React from "react";
import { INotebookCommand } from "../manipulation/NotebookManipulation";
import { INotebookPageController } from "./NotebookPageController";

export interface INotebookController {
  save: () => void;
  handleSelection: (pageId: string, cellId: string) => void;
  toggleEditing: () => void;
  undo: () => void;
  redo: () => void;
  do: (action: Function, args: INotebookCommand) => void;
  getNotebookPageController: () => INotebookPageController | undefined;
}

export const NotebookController = React.createContext<INotebookController>({
  save: () => {},
  handleSelection: (pageId: string, cellId: string) => {},
  toggleEditing: () => {},
  undo: () => {},
  redo: () => {},
  do: (action: Function, args: INotebookCommand) => {},
  getNotebookPageController: () => undefined,
});
