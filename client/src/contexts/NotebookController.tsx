import React from "react";

import {
  INotebook,
  INotebookManipulation,
  INotebookManipulationAsyncArguments,
  INotebookManipulationSyncArguments,
} from "../structures/NotebookStructure";
import { INotebookPageController } from "./NotebookPageController";

export interface INotebookController {
  save: () => void;
  handleSelection: (pageId: string, cellId: string) => void;
  toggleEditing: () => void;
  undo: () => void;
  redo: () => void;
  do: <T extends INotebookManipulationAsyncArguments>(
    action: INotebookManipulation<T>,
    args: T
  ) => void;
  doSync: <T extends INotebookManipulationSyncArguments>(
    action: INotebookManipulation<T>,
    args: T
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
  do: <T extends INotebookManipulationAsyncArguments>(
    action: INotebookManipulation<T>,
    args: T
  ) => {},
  doSync: <T extends INotebookManipulationSyncArguments>(
    action: INotebookManipulation<T>,
    args: T
  ) => {},
  getNotebookPageController: () => undefined,
  getActive: () => [undefined, undefined],
  getNotebook: () => undefined,
});
