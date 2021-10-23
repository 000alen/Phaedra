import React from "react";

import {
  INotebookCommand,
  INotebookManipulation,
} from "../manipulation/INotebookManipulation";
import { INotebookController } from "./INotebookController";

export const NotebookController = React.createContext<INotebookController>({
  save: () => {},
  handleSelection: (pageId: string, cellId: string) => {},
  toggleEditing: () => {},
  undo: () => {},
  redo: () => {},
  do: (action: INotebookManipulation, args: INotebookCommand) => {},
  getNotebookPageController: () => undefined,
});
