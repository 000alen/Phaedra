import { saveAction } from "../actions/HomeActions";
import { INotebookPageController } from "../contexts/NotebookPageController";
import { IShortcuts } from "./IShortcuts";

export const NotebookPageShortcuts: IShortcuts = {
  "ctrl+s": (notebookPageController: INotebookPageController) =>
    saveAction(notebookPageController),
  "ctrl+k": (notebookPageController: INotebookPageController) =>
    notebookPageController.showColaborationPanel(),
};
