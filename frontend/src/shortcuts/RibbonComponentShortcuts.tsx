import { handleSave } from "../actions/HomeActions";
import { handleEdit } from "../actions/EditAction";
import { INotebookPageController } from "../contexts/NotebookPageController";

export const RibbonComponentShortcuts = {
  "ctrl+s": (notebookPageController: INotebookPageController) =>
    handleSave(notebookPageController),
  "ctrl+i": (notebookPageController: INotebookPageController) =>
    handleEdit(notebookPageController),
};
