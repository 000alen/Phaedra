import React from "react";

import {
  INotebook,
  INotebookManipulation,
  INotebookManipulationArguments,
} from "../structures/NotebookStructure";
import { INotebookPageController } from "./NotebookPageController";

export interface INotebookController {
  save: () => void;
  isSaved: () => boolean | undefined;

  getSelected: () => { [key: string]: string[] } | undefined;
  selectPage: (pageId: string) => void;
  selectCell: (pageId: string, cellId: string) => void;
  deselectPage: (pageId: string) => void;
  deselectCell: (pageId: string, cellId: string) => void;
  isPageSelected: (pageId: string) => boolean;
  isCellSelected: (pageId: string, cellId: string) => boolean;

  enterEditing: () => void;
  exitEditing: () => void;
  isEditing: () => boolean | undefined;

  do: <T extends INotebookManipulationArguments>(
    action: INotebookManipulation<T>,
    args: T
  ) => void;
  undo: () => void;
  redo: () => void;

  getNotebookPageController: () => INotebookPageController | undefined;
  getNotebook: () => INotebook | undefined;
}

export const NotebookController = React.createContext<INotebookController>({
  save: () => {},
  isSaved: () => undefined,

  getSelected: () => undefined,
  selectPage: (pageId: string) => {},
  selectCell: (pageId: string, cellId: string) => {},
  deselectPage: (pageId: string) => {},
  deselectCell: (pageId: string, cellId: string) => {},
  isPageSelected: (pageId: string) => false,
  isCellSelected: (pageId: string, cellId: string) => false,

  enterEditing: () => {},
  exitEditing: () => {},
  isEditing: () => undefined,

  do: <T extends INotebookManipulationArguments>(
    action: INotebookManipulation<T>,
    args: T
  ) => {},
  undo: () => {},
  redo: () => {},

  getNotebookPageController: () => undefined,
  getNotebook: () => undefined,
});
