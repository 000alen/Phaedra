import { handleSave } from "../../components/Ribbon/actions/HomeActions";

export const NotebookPageShortcuts = {
  "ctrl+s": (notebookRef, commandBoxRef, pageController, appController) =>
    handleSave(notebookRef),
};
