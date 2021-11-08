import { handleEdit, handleSeamless } from "../actions/EditActions";
import {
  handleInsertCell,
  handleRedo,
  handleSave,
  handleUndo,
} from "../actions/HomeActions";
import { INotebookPageController } from "../contexts/NotebookPageController";
import { IShortcuts } from "./IShortcuts";

export const NotebookPageShortcuts: IShortcuts = {
  "ctrl+s": (notebookPageController: INotebookPageController) =>
    handleSave(notebookPageController),
  "ctrl+i": (notebookPageController: INotebookPageController) =>
    handleEdit(notebookPageController),
  "ctrl+z": (notebookPageController: INotebookPageController) =>
    handleUndo(notebookPageController),
  "ctrl+y": (notebookPageController: INotebookPageController) =>
    handleRedo(notebookPageController),
  "ctrl+n": (notebookPageController: INotebookPageController) =>
    handleInsertCell(notebookPageController),
  s: (notebookPageController: INotebookPageController) =>
    handleSeamless(notebookPageController),
};
