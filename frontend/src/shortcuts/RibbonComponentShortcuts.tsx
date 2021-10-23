import { handleEdit } from "../actions/EditAction";
import { handleSave } from "../actions/HomeActions";
import { INotebookPageController } from "../contexts/INotebookPageController";
import { IShortcuts } from "./IShortcuts";

export const RibbonComponentShortcuts: IShortcuts = {
  "ctrl+s": (notebookPageController: INotebookPageController) =>
    handleSave(notebookPageController),
  "ctrl+i": (notebookPageController: INotebookPageController) =>
    handleEdit(notebookPageController),
};
