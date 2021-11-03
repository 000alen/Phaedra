import React from "react";

import {
  INotebook,
  INotebookManipulation,
  INotebookManipulationArguments,
} from "../structures/NotebookStructure";
import { INotebookPageController } from "./NotebookPageController";

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

export const NotebookController = React.createContext<INotebookController>({
  save: () => {},
  handleSelection: (pageId: string, cellId: string) => {},
  toggleEditing: () => {},
  undo: () => {},
  redo: () => {},
  do: (
    action: INotebookManipulation,
    args: INotebookManipulationArguments
  ) => {},
  doSync: (
    action: INotebookManipulation,
    args: INotebookManipulationArguments
  ) => {},
  getNotebookPageController: () => undefined,
  getActive: () => [undefined, undefined],
  getNotebook: () => undefined,
});
