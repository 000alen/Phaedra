import { handleEdit } from "../actions/EditActions";
import {
  handleCopy,
  handleCut,
  handleInsertCell,
  handlePaste,
  handleRedo,
  handleSave,
  handleUndo,
} from "../actions/HomeActions";
import { insertCellAbove, insertCellBelow } from "../actions/TestActions";
import { INotebookPageController } from "../contexts/INotebookPageController";
import { IShortcuts } from "./IShortcuts";

export const NotebookPageShortcuts: IShortcuts = {
  "ctrl+s": (notebookPageController: INotebookPageController) =>
    handleSave(notebookPageController),
  "ctrl+i": (notebookPageController: INotebookPageController) =>
    handleEdit(notebookPageController),
  "ctrl+c": (notebookPageController: INotebookPageController) =>
    handleCopy(notebookPageController),
  "ctrl+v": (notebookPageController: INotebookPageController) =>
    handlePaste(notebookPageController),
  "ctrl+x": (notebookPageController: INotebookPageController) =>
    handleCut(notebookPageController),
  "ctrl+z": (notebookPageController: INotebookPageController) =>
    handleUndo(notebookPageController),
  "ctrl+y": (notebookPageController: INotebookPageController) =>
    handleRedo(notebookPageController),
  "ctrl+n": (notebookPageController: INotebookPageController) =>
    handleInsertCell(notebookPageController),
  b: (notebookPageController: INotebookPageController) =>
    insertCellBelow(notebookPageController),
  a: (notebookPageController: INotebookPageController) =>
    insertCellAbove(notebookPageController),
};
