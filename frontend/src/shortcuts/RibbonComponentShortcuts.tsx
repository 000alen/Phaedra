import { handleEdit } from "../actions/EditAction";
import {
  handleCopy,
  handleCut,
  handlePaste,
  handleSave,
} from "../actions/HomeActions";
import { INotebookPageController } from "../contexts/INotebookPageController";
import { IShortcuts } from "./IShortcuts";

export const RibbonComponentShortcuts: IShortcuts = {
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
};