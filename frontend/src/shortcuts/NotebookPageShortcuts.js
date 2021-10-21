import { handleSave } from "../actions/HomeActions";
import { handleEdit } from "../actions/EditAction";

export const NotebookPageShortcuts = {
  "ctrl+s": (notebookPageController) => handleSave(notebookPageController),
  "ctrl+i": (notebookPageController) => handleEdit(notebookPageController),
};
