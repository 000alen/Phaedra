// ! TODO: Pass AppController to avoid persistence issues

import { INotebookPageController } from "../contexts/NotebookPageController";

export function saveAction(notebookPageController: INotebookPageController) {
  const notebookController = notebookPageController.getNotebookController()!;
  notebookController.save();
}
