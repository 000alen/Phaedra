import React from "react";

import {
  INotebookManipulation,
  INotebookManipulationArguments,
} from "../structures/notebook/INotebookManipulation";
import { INotebookController } from "./INotebookController";

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
  getActiveCell: () => undefined,
  getActivePage: () => undefined,
  getNotebook: () => undefined,
});
