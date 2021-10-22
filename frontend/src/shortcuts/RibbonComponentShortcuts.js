import { handleSave } from "../actions/HomeActions";
import { handleEdit } from "../actions/EditAction";

export const RibbonComponentShortcuts = {
  "ctrl+s": (notebookPageController) => handleSave(notebookPageController),
  "ctrl+i": (notebookPageController) => handleEdit(notebookPageController),
};
