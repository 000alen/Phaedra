import { handleSave } from "../../actions/HomeActions";
import { handleEdit } from "../../actions/EditAction";

export const NotebookPageShortcuts = {
  "ctrl+s": (notebookRef, commandBoxRef, pageController, appController) =>
    handleSave(notebookRef),
  "ctrl+i": (notebookRef, commandBoxRef, pageController, appController) =>
    handleEdit(notebookRef),
};
